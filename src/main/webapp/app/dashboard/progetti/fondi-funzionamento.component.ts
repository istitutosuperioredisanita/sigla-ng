import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewChild, ElementRef, TemplateRef, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, Subscription, combineLatest } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { ContextService } from 'app/context';
import { Pair } from '../../context/pair.model';
import { EChartsOption, ECharts } from 'echarts';
import { DettaglioVoceSpesa, DimensioneFondo, FondiFunzionamentoService, VocePiano } from './fondi-funzionamento.service';
import { LocalStateStorageService } from '../../shared/auth/local-storage.service';
import { Principal } from '../../shared/auth/principal.service';
import { TranslateService } from '@ngx-translate/core';

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

/** Colori delle fette della torta (neutri, per non confonderli con blu/verde delle barre) */
const COLORI_TORTA = ['#4e79a7', '#f28e2b', '#b07aa1', '#e15759', '#76b7b2', '#edc948', '#9c755f', '#bab0ac'];

/** Numero di voci mostrate all'apertura del grafico 'elemento-voce' (le altre si raggiungono con lo slider) */
const VOCI_VISIBILI_INIZIALI = 25;

/** Icona Font Awesome 4.7 "file-image-o" (f1c5) come tracciato SVG, per il salva-immagine della toolbox */
const ICONA_IMMAGINE = 'path://M1468 380Q1496 408 1516 456T1536 544V1696Q1536 1736 1508 1764T1440 1792H96Q56 1792 28 1764T0 1696V96Q0 56 28 28T96 0H992Q1032 0 1080 20T1156 68ZM1024 136V512H1400Q1390 483 1378 471L1065 158Q1053 146 1024 136ZM1408 1664V640H992Q952 640 924 612T896 544V128H128V1664H1408ZM1280 1216V1536H256V1344L448 1152 576 1280 960 896ZM448 1024Q368 1024 312 968T256 832 312 696 448 640 584 696 640 832 584 968 448 1024Z';

/** Icona Font Awesome 4.7 "file-excel-o" (f1c3) come tracciato SVG, per la toolbox del grafico */
const ICONA_EXCEL = 'path://M1468 380Q1496 408 1516 456T1536 544V1696Q1536 1736 1508 1764T1440 1792H96Q56 1792 28 1764T0 1696V96Q0 56 28 28T96 0H992Q1032 0 1080 20T1156 68ZM1024 136V512H1400Q1390 483 1378 471L1065 158Q1053 146 1024 136ZM1408 1664V640H992Q952 640 924 612T896 544V128H128V1664H1408ZM429 1430V1536H710V1430H635L738 1269Q743 1262 748 1252.5T755.5 1239 759 1235H761Q762 1239 766 1245 768 1249 770.5 1252.5T776.5 1260.5 783 1269L890 1430H814V1536H1105V1430H1037L845 1157 1040 875H1107V768H828V875H902L799 1034Q795 1041 789 1050.5T780 1064L778 1067H776Q775 1063 771 1057 765 1046 754 1034L648 875H724V768H434V875H502L691 1147 497 1430H429Z';

/** Etichette dei raggruppamenti disponibili (per i testi del componente) */
const DIMENSIONI: { valore: DimensioneFondo; label: string }[] = [
  { valore: 'uo', label: 'Unità Organizzativa' },
  { valore: 'elemento-voce', label: 'Voce' },
  { valore: 'tipo-progetto', label: 'Tipo Progetto' },
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
  /** Emesso a ogni fine caricamento dati (anche in caso di errore): la dashboard lo usa per mostrare il componente solo quando è pronto */
  @Output() caricato = new EventEmitter<void>();

  protected filterForm!: FormGroup;
  esercizi: number[] = [];
  private anno!: number;

  protected readonly dimensioni = DIMENSIONI;
  /** Dimensione effettiva in uso (da route data o @Input) */
  protected dimensioneCorrente: DimensioneFondo = 'uo';
  /** Filtro di drill-down attivo (livello 2), se presente */
  protected filtroCorrente?: FiltroFondo;
  /**
   * Voce (elemento-voce) fissata, solo per la dimensione 'uo': arriva dal click su una voce
   * nel grafico 'elemento-voce' e restringe gli importi di ogni UO a quella voce
   */
  protected voceFissa?: string;
  /** Descrizione della voce fissata (arriva dal query param 'descrizioneVoce'), mostrata accanto al codice */
  protected descrizioneVoceFissa?: string;

  /** Filtro UO aggiuntivo, selezionabile solo quando dimensioneCorrente !== 'uo' */
  @ViewChild('uoFiltroInput', { static: false }) uoFiltroInput!: ElementRef;
  protected uoPairs: Pair[] = [];
  private filtroUoCorrente?: string;
  private lastValueUo: any = null;
  /** true mentre il click sul caret forza l'apertura della tendina (non è una cancellazione voluta dall'utente) */
  private aperturaTypeahead = false;

  /** Filtro CDS aggiuntivo, selezionabile solo quando dimensioneCorrente === 'uo' */
  @ViewChild('cdsFiltroInput', { static: false }) cdsFiltroInput!: ElementRef;
  protected cdsPairs: Pair[] = [];
  private filtroCdsCorrente?: string;
  private lastValueCds: any = null;
  private aperturaTypeaheadCds = false;

  private destroy$ = new Subject<void>();

  protected chartOptions: EChartsOption = {};
  /** Istanza ECharts, usata per evidenziare una barra via dispatchAction */
  private chartInstance?: ECharts;
  /** Indice della barra attualmente evidenziata dal filtro 'Voce' */
  private indiceEvidenziato?: number;

  /** Filtro Voce (solo dimensione 'elemento-voce'): typeahead che evidenzia la barra scelta */
  @ViewChild('voceFiltroInput', { static: false }) voceFiltroInput!: ElementRef;
  protected vocePairs: Pair[] = [];
  private lastValueVoce: any = null;
  private aperturaTypeaheadVoce = false;
  protected legenda: VoceFondo[] = [];
  /** true quando il grafico mostrato è una torta (la legenda blu/verde delle barre non si applica) */
  protected tortaAttiva = false;

  @ViewChild('dettaglioModal') dettaglioModalTpl!: TemplateRef<any>;
  private modalRef?: NgbModalRef;
  protected dettaglio: DettaglioVoceSpesa[] = [];
  protected dettaglioProgetto?: VoceFondo;
  protected loadingDettaglio = signal(false);
  protected readonly coloreUtilizzato = COLORE_UTILIZZATO;
  protected readonly coloreAssegnato = COLORE_ASSEGNATO;

  loadingChart = signal(false);

  /** Select "Voce del Piano" nella modale di dettaglio */
  protected vociPiano: VocePiano[] = [];
  protected voceControl = new FormControl<VocePiano | null>(null);
  private dettaglioSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private contextService: ContextService,
    private fondiService: FondiFunzionamentoService,
    private modalService: NgbModal,
    private localStateStorageService: LocalStateStorageService,
    private principal: Principal,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // unico punto di caricamento del dettaglio: sottoscritto una volta sola
    this.voceControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(voce => {
        if (this.dettaglioProgetto) {
          this.caricaDettaglio(this.dettaglioProgetto.codice, voce?.elementiVoce);
        }
      });

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

        // voce fissata (query param 'voce'): significativa solo per la dimensione 'uo'
        this.voceFissa = this.dimensioneCorrente === 'uo' ? (params['voce'] ?? undefined) : undefined;
        this.descrizioneVoceFissa = this.voceFissa ? (params['descrizioneVoce'] ?? undefined) : undefined;

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
    this.dettaglioSub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(annoIniziale?: number): void {
    this.filterForm = this.formBuilder.group({
      esercizio: new FormControl(annoIniziale ?? Math.max(...this.esercizi)),
      uoFiltro: new FormControl(),
      cdsFiltro: new FormControl(),
      voceFiltro: new FormControl<string | null>(null)
    });

    this.filterForm.controls['esercizio'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((esercizio: number) => this.loadData(esercizio));

    // filtro Voce (solo dimensione 'elemento-voce'): la scelta dalla tendina è gestita da onVoceSelected,
    // qui si intercetta solo lo svuotamento del campo per spegnere l'highlight
    this.filterForm.controls['voceFiltro'].valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(value => {
        if (this.aperturaTypeaheadVoce) {
          // svuotamento provocato dal click sul caret per aprire la tendina: non è una cancellazione
          this.aperturaTypeaheadVoce = false;
          this.lastValueVoce = value;
          return;
        }
        if (!value && this.lastValueVoce) {
          this.evidenziaVoce(null);
        }
        this.lastValueVoce = value;
      });

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

    // filtro CDS aggiuntivo (solo per dimensione 'uo')
    this.filterForm.controls['cdsFiltro'].valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(value => {
        if (this.aperturaTypeaheadCds) {
          this.aperturaTypeaheadCds = false;
          this.lastValueCds = value;
          return;
        }
        if (!value && this.lastValueCds) {
          this.filtroCdsCorrente = undefined;
          this.loadData(this.filterForm.controls['esercizio'].value);
        }
        this.lastValueCds = value;
      });

    const esercizio = this.filterForm.controls['esercizio'].value;

    if (this.dimensioneCorrente === 'uo') {
      const caricaConCds = (cds: Pair[]) => {
        this.cdsPairs = cds ?? [];
        // default: primo CDS della lista, solo al livello 1 e senza voce fissata
        // (con un drill-down da URL la UO scelta potrebbe appartenere a un altro CDS;
        // con una voce fissata si vogliono vedere tutte le UO che hanno speso su quella voce)
        const primo = this.cdsPairs[0];
        if (primo && !this.filtroCorrente && !this.voceFissa) {
          this.filtroCdsCorrente = primo.first;
          this.lastValueCds = primo;
          // emitEvent: false evita che la valueChanges del CDS lanci un'altra loadData
          this.filterForm.controls['cdsFiltro'].setValue(primo, { emitEvent: false });
        }
        this.loadData(esercizio);
      };

      this.contextService.getCds().subscribe({
        next: caricaConCds,
        error: () => caricaConCds([])
      });
    } else {
      this.contextService.getUo().subscribe((result: Pair[]) => {
        this.uoPairs = result;
      });
      this.loadData(esercizio);
    }
  }

  onUoSelected(event: NgbTypeaheadSelectItemEvent): void {
    this.aperturaTypeahead = false;
    this.filtroUoCorrente = event?.item?.first;
    this.loadData(this.filterForm.controls['esercizio'].value);
  }

  onCdsSelected(event: NgbTypeaheadSelectItemEvent): void {
    this.aperturaTypeaheadCds = false;
    this.filtroCdsCorrente = event?.item?.first;
    this.loadData(this.filterForm.controls['esercizio'].value);
  }

  onVoceSelected(event: NgbTypeaheadSelectItemEvent): void {
    this.aperturaTypeaheadVoce = false;
    const codice: string | null = event?.item?.first ?? null;
    const idx = this.legenda.findIndex(v => v.codice === codice);

    if (idx >= 0 && !this.dashboard) {
      // la scelta dalla tendina equivale al click sulla barra della voce
      // (grafico per UO con voce fissata, oppure modale di dettaglio se c'è un filtro attivo)
      this.onChartClick({ dataIndex: idx });
    } else {
      // in dashboard il click è disattivato: resta solo l'evidenziazione della barra
      this.evidenziaVoce(codice);
    }
  }

  onChartInit(chart: ECharts): void {
    this.chartInstance = chart;
  }

  /** Evidenzia la barra della voce scelta nella select (o spegne l'highlight se null) */
  private evidenziaVoce(codice: string | null): void {
    const chart = this.chartInstance;
    if (!chart) {
      return;
    }

    // spegne l'highlight precedente
    if (this.indiceEvidenziato !== undefined) {
      chart.dispatchAction({ type: 'downplay', seriesIndex: [0, 1], dataIndex: this.indiceEvidenziato });
      chart.dispatchAction({ type: 'hideTip' });
      this.indiceEvidenziato = undefined;
    }
    if (!codice) {
      return;
    }

    const idx = this.legenda.findIndex(v => v.codice === codice);
    if (idx < 0) {
      return;
    }

    const haScrollato = this.scorriFinoA(idx);
    const highlight = () => {
      chart.dispatchAction({ type: 'highlight', seriesIndex: [0, 1], dataIndex: idx });
      // tooltip sulla barra selezionata (stesso contenuto del passaggio del mouse)
      chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: idx });
      this.indiceEvidenziato = idx;
    };
    // se lo zoom ridisegna le barre, highlight e tooltip vanno applicati dopo
    if (haScrollato) {
      setTimeout(highlight, 0);
    } else {
      highlight();
    }
  }

  /** Se la barra è fuori dalla finestra dello slider, sposta la finestra centrandola sulla barra. Ritorna true se ha scrollato. */
  private scorriFinoA(idx: number): boolean {
    const chart = this.chartInstance;
    if (!chart) {
      return false;
    }
    const n = this.legenda.length;
    const dz: any = (chart.getOption() as any)?.dataZoom?.[0];
    const start = Number(dz?.startValue ?? 0);
    const end = Number(dz?.endValue ?? n - 1);
    if (idx >= start && idx <= end) {
      return false;
    }
    const size = end - start;
    const newStart = Math.max(0, Math.min(idx - Math.floor(size / 2), n - 1 - size));
    const finestra = { startValue: newStart, endValue: newStart + size };
    chart.dispatchAction({
      type: 'dataZoom',
      batch: [
        { dataZoomIndex: 0, ...finestra }, // inside
        { dataZoomIndex: 1, ...finestra }  // slider
      ]
    });
    return true;
  }

  searchuo = (text$: Observable<string>) =>
    text$.pipe(debounceTime(200)).pipe(
      map((term: string) => this.filterPair(term, this.uoPairs).slice(0, 200))
    );

  searchvoce = (text$: Observable<string>) =>
    text$.pipe(debounceTime(200)).pipe(
      map((term: string) => this.filterPair(term, this.vocePairs).slice(0, 200))
    );

  searchcds = (text$: Observable<string>) =>
    text$.pipe(debounceTime(200)).pipe(
      map((term: string) => this.filterPair(term, this.cdsPairs).slice(0, 200))
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

  openTypeaheadCds(): void {
    if (this.cdsFiltroInput) {
      this.aperturaTypeaheadCds = true;
      this.cdsFiltroInput.nativeElement.value = '';
      this.cdsFiltroInput.nativeElement.dispatchEvent(this.createNewEvent('input'));
    }
  }

  openTypeaheadVoce(): void {
    if (this.voceFiltroInput) {
      this.aperturaTypeaheadVoce = true;
      this.voceFiltroInput.nativeElement.value = '';
      this.voceFiltroInput.nativeElement.dispatchEvent(this.createNewEvent('input'));
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
      .getFondi(anno, this.dimensioneCorrente, this.filtroCorrente?.valore, this.filtroUoCorrente, this.filtroCdsCorrente, this.voceFissa)
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
          // il nuovo setOption azzera l'highlight: riallinea anche la select
          this.indiceEvidenziato = undefined;
          this.lastValueVoce = null;
          this.filterForm.controls['voceFiltro'].setValue(null, { emitEvent: false });
          this.legenda = data;
          this.vocePairs = data.map(d => ({ first: d.codice, second: d.descrizione } as Pair));
          this.loadChart(data);
          this.loadingChart.set(false);
          this.caricato.emit();
        },
        error: () => {
          this.loadingChart.set(false);
          this.caricato.emit();
        }
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
    } else if (this.dimensioneCorrente === 'elemento-voce') {
      // click su una voce: apre il grafico per UO con la voce fissata
      this.router.navigate(['/progetti/fondi-funzionamento/uo'], {
        queryParams: { voce: voce.codice, descrizioneVoce: voce.descrizione, anno: this.anno }
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { valore: voce.codice, anno: this.anno },
        queryParamsHandling: 'merge'
      });
    }
  }

  private apriDettaglioProgetto(progetto: VoceFondo): void {
    this.modalRef?.close();

    this.dettaglioProgetto = progetto;
    this.dettaglio = [];
    this.vociPiano = [];
    this.voceControl.setValue(null, { emitEvent: false });

    this.modalRef = this.modalService.open(this.dettaglioModalTpl, {
      size: 'xl',
      scrollable: true,
      container: 'body'
    });
    this.modalRef.result.catch(() => {});

    // evita il flash di "Nessuna voce di spesa disponibile" mentre arriva il piano
    this.loadingDettaglio.set(true);

    this.fondiService.getVociPiano(this.anno, progetto.codice).subscribe({
      next: (voci) => {
        this.vociPiano = voci ?? [];
        this.caricaDettaglio(progetto.codice);
      },
      error: () => {
        this.vociPiano = [];
        this.caricaDettaglio(progetto.codice);
      }
    });
  }

  private caricaDettaglio(codiceProgetto: string, elementiVoce?: string[]): void {
    // annulla la chiamata precedente per evitare risposte fuori ordine
    this.dettaglioSub?.unsubscribe();
    this.loadingDettaglio.set(true);
    this.dettaglioSub = this.fondiService
      .getDettaglioProgetto(this.anno, codiceProgetto, elementiVoce)
      .subscribe({
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

  /** Etichetta del "torna a": con un drill-down attivo si torna al livello della dimensione corrente,
   *  altrimenti (solo voce fissata) si torna al grafico per Voce */
  protected get labelTorna(): string {
    return this.labelDimensione(this.filtroCorrente ? this.dimensioneCorrente : 'elemento-voce');
  }

  torna(): void {
    if (this.filtroCorrente) {
      // livello 2 -> livello 1 (la voce fissata, se presente, resta nei queryParams)
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { valore: null, uo: null },
        queryParamsHandling: 'merge'
      });
    } else if (this.voceFissa) {
      // grafico UO con voce fissata -> grafico per Voce
      this.router.navigate(['/progetti/fondi-funzionamento/elemento-voce'], {
        queryParams: { anno: this.anno }
      });
    }
  }

  protected formatEur(v: number): string {
    return v != null
      ? v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'
      : '-';
  }

  protected labelDimensione(dimensione: DimensioneFondo): string {
    return this.dimensioni.find(d => d.valore === dimensione)?.label ?? dimensione;
  }

  /** Toolbox comune a barre e torta: salva immagine (blu) e scarica CSV (verde) */
  private toolbox(data: VoceFondo[], nomeFile: string) {
    return {
      feature: {
        saveAsImage: {
          title: 'Salva immagine',
          name: nomeFile,
          icon: ICONA_IMMAGINE,
          iconStyle: { color: '#2c6fbb', borderWidth: 0 },          // blu
          emphasis: { iconStyle: { color: '#1f5291', borderWidth: 0 } } // blu più scuro al passaggio del mouse
        },
        myScaricaCsv: {
          show: true,
          title: 'Scarica CSV',
          icon: ICONA_EXCEL,
          // il glifo è un'icona piena: riempimento al posto del solo contorno delle altre icone
          iconStyle: { color: '#217346', borderWidth: 0 },          // verde Excel
          emphasis: { iconStyle: { color: '#185c37', borderWidth: 0 } }, // verde più scuro al passaggio del mouse
          onclick: () => this.scaricaCsv(data, nomeFile)
        }
      }
    };
  }

  /** Torta sull'importo assegnato, usata da 'tipo-finanziamento' al primo livello (poche voci) */
  private opzioniTorta(data: VoceFondo[], suffisso: string, nomeFile: string): EChartsOption {
    return {
      color: COLORI_TORTA,
      title: {
        text: this.translateService.instant(`global.menu.progetti.fondi-funzionamento.${this.dimensioneCorrente}`),
        subtext: `Anno ${this.anno}${suffisso}`,
        left: 'center'
      },
      toolbox: this.toolbox(data, nomeFile),
      tooltip: {
        trigger: 'item',
        textStyle: { align: 'left' },
        confine: true,
        formatter: (params: any) => {
          const row = data[params?.dataIndex];
          if (!row) return '';
          const residuoVal = row.importoFinanziato - row.importoUtilizzato;
          const perc = row.importoFinanziato
            ? ((row.importoUtilizzato / row.importoFinanziato) * 100).toFixed(1)
            : '0';
          return [
            `<b>${row.codice}</b>`,
            `<div style="max-width:320px;white-space:normal">${row.descrizione}</div>`,
            `Assegnato: ${this.formatEur(row.importoFinanziato)} (${params.percent}% del totale)`,
            `Utilizzato: ${this.formatEur(row.importoUtilizzato)} (${perc}%)`,
            `Residuo: ${this.formatEur(residuoVal)}`
          ].join('<br/>');
        }
      },
      // la legenda codice/descrizione è resa in HTML sotto il grafico
      legend: { show: false },
      series: [
        {
          name: 'Importo assegnato',
          type: 'pie',
          radius: '60%',
          center: ['50%', '58%'],
          cursor: this.filtroCorrente ? 'default' : 'pointer',
          data: data.map(d => ({ name: d.codice, value: d.importoFinanziato })),
          label: { formatter: (p: any) => `${p.name}\n${p.percent}%`, fontSize: 12 },
          emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } },
          animationDuration: 1000
        }
      ]
    };
  }

  /** Esporta in CSV i dati mostrati nel grafico (separatore ';', UTF-8 con BOM, per Excel in italiano) */
  private scaricaCsv(data: VoceFondo[], nomeFile: string): void {
    const num = (v: number) => (v ?? 0).toFixed(2).replace('.', ',');
    const testo = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;

    const righe = [
      ['Codice', 'Descrizione', 'Importo assegnato', 'Importo utilizzato', 'Residuo', '% utilizzo'].join(';'),
      ...data.map(d => [
        testo(d.codice),
        testo(d.descrizione),
        num(d.importoFinanziato),
        num(d.importoUtilizzato),
        num(d.importoFinanziato - d.importoUtilizzato),
        d.importoFinanziato ? ((d.importoUtilizzato / d.importoFinanziato) * 100).toFixed(1).replace('.', ',') : '0'
      ].join(';'))
    ];

    const blob = new Blob(['\uFEFF' + righe.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeFile}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private loadChart(data: VoceFondo[]): void {
    const categories = data.map(d => d.codice);

    // per 'tipo-progetto' e 'elemento-voce' gli assi sono invertiti: categorie sulle ordinate, importi sulle ascisse
    const orizzontale = this.dimensioneCorrente === 'tipo-progetto' || this.dimensioneCorrente === 'elemento-voce';
    // 'elemento-voce' ha molte voci: all'apertura si vedono solo le prime N (già ordinate per importo), il resto con lo slider
    const finestra = this.dimensioneCorrente === 'elemento-voce' && data.length > VOCI_VISIBILI_INIZIALI
      ? { startValue: 0, endValue: VOCI_VISIBILI_INIZIALI - 1 }
      : {};
    // solo 'tipo-progetto' ha le barre affiancate (utilizzato / assegnato); le altre dimensioni sono impilate
    const affiancate = this.dimensioneCorrente === 'tipo-progetto';
    const raggioCima = orizzontale ? [0, 6, 6, 0] : [6, 6, 0, 0];
    // stile della barra evidenziata (select 'Voce'): solo per 'elemento-voce'
    const emphasis = this.dimensioneCorrente === 'elemento-voce'
      ? { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.5)', borderColor: '#d9534f', borderWidth: 2 } }
      : undefined;

    // blu = utilizzato (base della barra)
    const utilizzato = data.map(d => {
      const residuo = d.importoFinanziato - d.importoUtilizzato;
      return {
        value: d.importoUtilizzato,
        // se non c'è residuo la parte blu è anche la cima della barra
        itemStyle: { borderRadius: residuo > 0 ? 0 : raggioCima }
      };
    });

    // verde = residuo se le barre sono impilate (totale impilato = importo assegnato);
    // con barre affiancate ('tipo-progetto') = importo assegnato intero
    const residuo = data.map(d => ({
      value: affiancate ? d.importoFinanziato : Math.max(d.importoFinanziato - d.importoUtilizzato, 0),
      itemStyle: { borderRadius: raggioCima }
    }));

    let suffisso = this.filtroCorrente
      ? ` - ${this.labelDimensione(this.filtroCorrente.dimensione)} ${this.filtroCorrente.valore}`
      : ` (per ${this.labelDimensione(this.dimensioneCorrente)})`;
    if (this.filtroUoCorrente) {
      suffisso += ` - UO ${this.filtroUoCorrente}`;
    }
    if (this.filtroCdsCorrente) {
      suffisso += ` - CDS ${this.filtroCdsCorrente}`;
    }
    if (this.voceFissa) {
      // voce su una riga a parte, in grassetto (stile rich 'voce'), seguita dalla descrizione;
      // le graffe sono sintassi rich text di ECharts: si tolgono dalla descrizione
      const desc = this.descrizioneVoceFissa?.replace(/[{}]/g, '');
      suffisso += `\n{voce|Voce ${this.voceFissa}}${desc ? ' - ' + desc : ''}`;
    }

    const nomeFile = `fondi_funzionamento_${this.anno}${this.filtroCorrente ? '_' + this.filtroCorrente.valore : ''}${this.filtroUoCorrente ? '_' + this.filtroUoCorrente : ''}${this.filtroCdsCorrente ? '_' + this.filtroCdsCorrente : ''}${this.voceFissa ? '_voce_' + this.voceFissa : ''}`;

    // 'tipo-finanziamento' al primo livello (nessun filtro attivo): torta; al secondo livello restano le barre dei progetti
    this.tortaAttiva = this.dimensioneCorrente === 'tipo-finanziamento' && !this.filtroCorrente;
    if (this.tortaAttiva) {
      this.chartOptions = this.opzioniTorta(data, suffisso, nomeFile);
      return;
    }

    // asse delle categorie (codici) e asse degli importi; la loro posizione dipende da `orizzontale`
    const asseCategorie = {
      type: 'category' as const,
      data: categories,
      // inverse: la prima categoria (importo maggiore) resta in alto
      inverse: orizzontale,
      axisLabel: orizzontale ? { fontSize: 11 } : { fontSize: 11, rotate: 60 }
    };
    const asseImporti = {
      type: 'value' as const,
      axisLabel: {
        formatter: (v: number) =>
          v >= 1e6 ? (v / 1e6).toLocaleString('it-IT') + ' M€' : v.toLocaleString('it-IT') + '€'
      }
    };

    // con la voce fissata il sottotitolo occupa una riga in più: più spazio sopra il grafico
    const topGrid = this.voceFissa ? '24%' : '18%';

    this.chartOptions = {
      title: {
        text: this.translateService.instant(`global.menu.progetti.fondi-funzionamento.${this.dimensioneCorrente}`),
        subtext: `Anno ${this.anno}${suffisso}`,
        subtextStyle: { rich: { voce: { fontWeight: 'bold', color: '#333' } } },
        left: 'center'
      },
      toolbox: this.toolbox(data, nomeFile),
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
      grid: orizzontale
        ? { left: '3%', right: '8%', bottom: '3%', top: topGrid, containLabel: true }
        : { left: '3%', right: '3%', bottom: '8%', top: topGrid, containLabel: true },
      dataZoom: orizzontale
        ? [
            { type: 'inside', yAxisIndex: 0, ...finestra },
            { type: 'slider', yAxisIndex: 0, width: 38, right: 0, ...finestra }
          ]
        : [
            { type: 'inside' },
            { type: 'slider', height: 38, bottom: 0 }
          ],
      xAxis: orizzontale ? asseImporti : asseCategorie,
      yAxis: orizzontale ? asseCategorie : asseImporti,
      series: [
        {
          name: 'Importo utilizzato',
          type: 'bar',
          stack: 'fondi',
          barMaxWidth: 28,
          cursor: this.filtroCorrente ? 'default' : 'pointer',
          itemStyle: { color: COLORE_UTILIZZATO },
          emphasis,
          data: utilizzato,
          animationDuration: 1000
        },
        {
          name: 'Importo assegnato (residuo)',
          type: 'bar',
          stack: affiancate ? 'fondi2' : 'fondi',
          barMaxWidth: 28,
          cursor: this.filtroCorrente ? 'default' : 'pointer',
          itemStyle: { color: COLORE_ASSEGNATO },
          emphasis,
          data: residuo,
          animationDuration: 1000
        }
      ]
    };
  }
}