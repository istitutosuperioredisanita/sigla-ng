import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, ViewChild, ElementRef, TemplateRef, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, combineLatest } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { ContextService } from 'app/context';
import { Pair } from '../../context/pair.model';
import { EChartsOption } from 'echarts';
import { DettaglioVoceSpesa, DimensioneFondo, FondiFunzionamentoService } from './fondi-funzionamento.service';
import { LocalStateStorageService } from '../../shared/auth/local-storage.service';
import { Principal } from '../../shared/auth/principal.service';

/** Forma comune usata dal grafico, indipendente dall'endpoint chiamato */
interface VoceFondo {
  codice: string;
  descrizione: string;
  importoFinanziato: number;
  importoUtilizzato: number;
}

/** Filtro di drill-down attivo (livello 2): dimensione + valore scelto */
interface FiltroFondo {
  dimensione: DimensioneFondo;
  valore: string;
}

const COLORE_UTILIZZATO = '#516fdb'; // blu
const COLORE_ASSEGNATO = '#b6d635';  // verde

/** Etichette dei raggruppamenti disponibili (per i testi del componente) */
const DIMENSIONI: { valore: DimensioneFondo; label: string }[] = [
  { valore: 'uo', label: 'Unità Organizzativa' },
  { valore: 'tipo-finanziamento', label: 'Tipo Finanziamento' },
  { valore: 'ente-finanziatore', label: 'Ente Finanziatore' }
];

@Component({
  selector: 'fondi-funzionamento',
  templateUrl: './fondi-funzionamento.component.html',
  standalone: false
})
export class FondiFunzionamentoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dashboard: boolean = false;
  /**
   * Dimensione di raggruppamento del componente. Non è selezionabile in
   * pagina: arriva dai dati di route (data: { dimensione: ... }) quando il
   * componente è raggiunto tramite una delle tre route dedicate, oppure da
   * qui quando è incorporato altrove (es. dashboard).
   */
  @Input() dimensione: DimensioneFondo = 'uo';
  /** Se valorizzato, il grafico mostra direttamente i progetti di questo gruppo */
  @Input() valore?: string;
  /** @deprecated alias di `valore` con dimensione 'uo', mantenuto per retrocompatibilità */
  @Input() uo?: string;

  protected filterForm!: FormGroup;
  esercizi: number[] = [];
  private anno!: number;

  protected readonly dimensioni = DIMENSIONI;
  /** Dimensione effettiva in uso (da route data o @Input) */
  protected dimensioneCorrente: DimensioneFondo = 'uo';
  /** Filtro di drill-down attivo (livello 2), se presente */
  protected filtroCorrente?: FiltroFondo;

  /** Filtro UO aggiuntivo, selezionabile solo quando dimensioneCorrente !== 'uo' */
  @ViewChild('uoFiltroInput', { static: false }) uoFiltroInput!: ElementRef;
  protected uoPairs: Pair[] = [];
  private filtroUoCorrente?: string;
  private lastValueUo: any = null;
  /** true mentre il click sul caret forza l'apertura della tendina (non è una cancellazione voluta dall'utente) */
  private aperturaTypeahead = false;

  private destroy$ = new Subject<void>();

  protected chartOptions: EChartsOption = {};
  protected legenda: VoceFondo[] = [];

  @ViewChild('dettaglioModal') dettaglioModalTpl!: TemplateRef<any>;
  private modalRef?: NgbModalRef;
  protected dettaglio: DettaglioVoceSpesa[] = [];
  protected dettaglioProgetto?: VoceFondo;
  protected loadingDettaglio = signal(false);
  protected readonly coloreUtilizzato = COLORE_UTILIZZATO;
  protected readonly coloreAssegnato = COLORE_ASSEGNATO;

  loadingChart = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private contextService: ContextService,
    private fondiService: FondiFunzionamentoService,
    private modalService: NgbModal,
    private localStateStorageService: LocalStateStorageService,
    private principal: Principal,
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.data, this.route.queryParams])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([data, params]) => {
        if (params['dashboard'] !== undefined) {
          this.dashboard = params['dashboard'] === 'true';
        }

        // dimensione: dati di route (route dedicata) > @Input > default 'uo'
        this.dimensioneCorrente = (data['dimensione'] as DimensioneFondo) ?? this.dimensione ?? 'uo';

        // valore di drill-down: query param > @Input valore > @Input uo (retrocompatibilità)
        const valoreFiltro = params['valore'] ?? this.valore ?? this.uo;
        this.filtroCorrente = valoreFiltro
          ? { dimensione: this.dimensioneCorrente, valore: valoreFiltro }
          : undefined;

        const annoParam = params['anno'] ? Number(params['anno']) : undefined;

        if (this.filterForm) {
          // componente già inizializzato: se l'URL porta un anno diverso, allinea il select
          if (annoParam && this.filterForm.controls['esercizio'].value !== annoParam) {
            this.filterForm.controls['esercizio'].setValue(annoParam, { emitEvent: false });
          }
          this.loadData(annoParam ?? this.filterForm.controls['esercizio'].value);
        } else {
          this.principal.getIdentyAccount(false).then((account) => {
            const userContext = this.localStateStorageService.getUserContext(account.username);
            this.contextService.getEsercizi().subscribe((esercizi: number[]) => {
              this.esercizi = esercizi;
              this.initializeComponent(annoParam || userContext?.esercizio);
            });
          });
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // cambio di valore/uo via @Input a componente già inizializzato
    const cambioValore = (changes['valore'] && !changes['valore'].firstChange)
      || (changes['uo'] && !changes['uo'].firstChange);
    if (cambioValore && this.filterForm) {
      const valoreFiltro = this.valore ?? this.uo;
      this.filtroCorrente = valoreFiltro ? { dimensione: this.dimensioneCorrente, valore: valoreFiltro } : undefined;
      this.loadData(this.filterForm.controls['esercizio'].value);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(annoIniziale?: number): void {
    this.filterForm = this.formBuilder.group({
      esercizio: new FormControl(annoIniziale ?? Math.max(...this.esercizi)),
      uoFiltro: new FormControl()
    });

    this.filterForm.controls['esercizio'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((esercizio: number) => this.loadData(esercizio));

    // filtro UO aggiuntivo (solo per tipoFinanziamento/enteFinanziatore)
    this.filterForm.controls['uoFiltro'].valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(value => {
        if (this.aperturaTypeahead) {
          // svuotamento provocato dal click sul caret per aprire la tendina: non è una cancellazione
          this.aperturaTypeahead = false;
          this.lastValueUo = value;
          return;
        }
        if (!value && this.lastValueUo) {
          this.filtroUoCorrente = undefined;
          this.loadData(this.filterForm.controls['esercizio'].value);
        }
        this.lastValueUo = value;
      });

    if (this.dimensioneCorrente !== 'uo') {
      this.contextService.getUo().subscribe((result: Pair[]) => {
        this.uoPairs = result;
      });
    }

    this.loadData(this.filterForm.controls['esercizio'].value);
  }

  onUoSelected(event: NgbTypeaheadSelectItemEvent): void {
    this.aperturaTypeahead = false;
    this.filtroUoCorrente = event?.item?.first;
    this.loadData(this.filterForm.controls['esercizio'].value);
  }

  searchuo = (text$: Observable<string>) =>
    text$.pipe(debounceTime(200)).pipe(
      map((term: string) => this.filterPair(term, this.uoPairs).slice(0, 200))
    );

  private filterPair(term: string, pairs: Pair[]): Pair[] {
    if (term === '') {
      return pairs;
    }
    return pairs.filter(v => new RegExp(term, 'gi').test(v.first + ' - ' + v.second));
  }

  formatter = (pair: Pair) => pair.first + ' - ' + pair.second;
  formatterFirst = (pair: Pair) => pair.first;

  openTypeaheadUo(): void {
    if (this.uoFiltroInput) {
      this.aperturaTypeahead = true;
      this.uoFiltroInput.nativeElement.value = '';
      this.uoFiltroInput.nativeElement.dispatchEvent(this.createNewEvent('input'));
    }
  }

  private createNewEvent(eventName: string): Event {
    if (typeof Event === 'function') {
      return new Event(eventName);
    }
    const event = document.createEvent('Event');
    event.initEvent(eventName, true, true);
    return event;
  }

  private loadData(anno: number): void {
    this.anno = anno;
    this.loadingChart.set(true);
    this.fondiService
      .getFondi(anno, this.dimensioneCorrente, this.filtroCorrente?.valore, this.filtroUoCorrente)
      .subscribe({
        next: (result: any[]) => {
          // normalizzazione e ordinamento per importo assegnato decrescente
          const data: VoceFondo[] = (result ?? [])
            .map(r => ({
              // supporta i diversi nomi di campo usati dai vari endpoint:
              // UO -> codiceUnita/descrizioneUnita, progetti -> codiceProgetto/descrizioneProgetto,
              // eventuali altri raggruppamenti -> codice/descrizione generici
              codice: r.codiceProgetto ?? r.codiceUnita ?? r.codice,
              descrizione: (r.descrizioneProgetto ?? r.descrizioneUnita ?? r.descrizione ?? '').trim(),
              importoFinanziato: r.importoFinanziato ?? 0,
              importoUtilizzato: r.importoUtilizzato ?? 0
            }))
            .sort((a, b) => b.importoFinanziato - a.importoFinanziato);
          this.legenda = data;
          this.loadChart(data);
          this.loadingChart.set(false);
        },
        error: () => this.loadingChart.set(false)
      });
  }

  /**
   * Click su una barra:
   * - livello 1 (nessun filtro): entra nel drill-down del gruppo cliccato
   * - livello 2 (filtro attivo): apre una modale con il dettaglio per voce di spesa
   */
  onChartClick(params: any): void {
    if (this.dashboard) {
      return;
    }
    const voce = this.legenda[params?.dataIndex];
    if (!voce) {
      return;
    }
    if (this.filtroCorrente) {
      this.apriDettaglioProgetto(voce);
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { valore: voce.codice, anno: this.anno },
        queryParamsHandling: 'merge'
      });
    }
  }

  private apriDettaglioProgetto(progetto: VoceFondo): void {
    // evita backdrop doppi se una modale è già aperta (es. doppio click sulla barra impilata)
    this.modalRef?.close();

    this.dettaglioProgetto = progetto;
    this.dettaglio = [];
    this.loadingDettaglio.set(true);
    this.modalRef = this.modalService.open(this.dettaglioModalTpl, {
      size: 'xl',
      scrollable: true,
      container: 'body'
    });
    // evita "Uncaught (in promise)" quando la modale viene chiusa/dismissata
    this.modalRef.result.catch(() => {});

    this.fondiService.getDettaglioProgetto(this.anno, progetto.codice).subscribe({
      next: (result) => {
        this.dettaglio = result ?? [];
        this.loadingDettaglio.set(false);
      },
      error: () => this.loadingDettaglio.set(false)
    });
  }

  chiudiDettaglio(): void {
    this.modalRef?.close();
  }

  torna(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { valore: null, uo: null },
      queryParamsHandling: 'merge'
    });
  }

  protected formatEur(v: number): string {
    return v != null
      ? v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'
      : '-';
  }

  protected labelDimensione(dimensione: DimensioneFondo): string {
    return this.dimensioni.find(d => d.valore === dimensione)?.label ?? dimensione;
  }

  private loadChart(data: VoceFondo[]): void {
    const categories = data.map(d => d.codice);

    // blu = utilizzato (base della barra)
    const utilizzato = data.map(d => {
      const residuo = d.importoFinanziato - d.importoUtilizzato;
      return {
        value: d.importoUtilizzato,
        // se non c'è residuo la parte blu è anche la cima della barra
        itemStyle: { borderRadius: residuo > 0 ? 0 : [6, 6, 0, 0] }
      };
    });

    // verde = residuo, così che il totale impilato = importo assegnato
    const residuo = data.map(d => ({
      value: Math.max(d.importoFinanziato - d.importoUtilizzato, 0),
      itemStyle: { borderRadius: [6, 6, 0, 0] }
    }));

    let suffisso = this.filtroCorrente
      ? ` - ${this.labelDimensione(this.filtroCorrente.dimensione)} ${this.filtroCorrente.valore}`
      : ` (per ${this.labelDimensione(this.dimensioneCorrente)})`;
    if (this.filtroUoCorrente) {
      suffisso += ` - UO ${this.filtroUoCorrente}`;
    }

    this.chartOptions = {
      title: {
        text: 'Trend fondi di funzionamento',
        subtext: `Anno ${this.anno}${suffisso}`,
        left: 'center'
      },
      toolbox: {
        feature: {
          saveAsImage: {
            title: 'Salva immagine',
            name: `fondi_funzionamento_${this.anno}${this.filtroCorrente ? '_' + this.filtroCorrente.valore : ''}${this.filtroUoCorrente ? '_' + this.filtroUoCorrente : ''}`
          }
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        textStyle: { align: 'left' },
        confine: true,
        formatter: (params: any) => {
          const idx = params[0]?.dataIndex;
          const row = data[idx];
          if (!row) return '';
          const residuoVal = row.importoFinanziato - row.importoUtilizzato;
          const perc = row.importoFinanziato
            ? ((row.importoUtilizzato / row.importoFinanziato) * 100).toFixed(1)
            : '0';
          return [
            `<b>${row.codice}</b>`,
            `<div style="max-width:320px;white-space:normal">${row.descrizione}</div>`,
            `<span style="color:${COLORE_ASSEGNATO}">●</span> Assegnato: ${this.formatEur(row.importoFinanziato)}`,
            `<span style="color:${COLORE_UTILIZZATO}">●</span> Utilizzato: ${this.formatEur(row.importoUtilizzato)} (${perc}%)`,
            `Residuo: ${this.formatEur(residuoVal)}`
          ].join('<br/>');
        }
      },
      // la legenda codice/descrizione è resa in HTML sotto il grafico
      legend: { show: false },
      grid: { left: '3%', right: '3%', bottom: '8%', top: '18%', containLabel: true },
      dataZoom: [
        { type: 'inside' },
        { type: 'slider', height: 18, bottom: 0 }
      ],
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { fontSize: 11, rotate: 60 }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v: number) =>
            v >= 1e6 ? (v / 1e6).toLocaleString('it-IT') + ' M€' : v.toLocaleString('it-IT') + '€'
        }
      },
      series: [
        {
          name: 'Importo utilizzato',
          type: 'bar',
          stack: 'fondi',
          barMaxWidth: 28,
          cursor: this.filtroCorrente ? 'default' : 'pointer',
          itemStyle: { color: COLORE_UTILIZZATO },
          data: utilizzato,
          animationDuration: 1000
        },
        {
          name: 'Importo assegnato (residuo)',
          type: 'bar',
          stack: 'fondi',
          barMaxWidth: 28,
          cursor: this.filtroCorrente ? 'default' : 'pointer',
          itemStyle: { color: COLORE_ASSEGNATO },
          data: residuo,
          animationDuration: 1000
        }
      ]
    };
  }
}