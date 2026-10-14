import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { ContextService } from 'app/context';
import { Pair } from '../../context/pair.model';
import { EChartsOption, ECharts } from 'echarts';
import { CespitiStrutturaService } from './cespiti-struttura.service';
import { LocalStateStorageService } from '../../shared/auth/local-storage.service';
import { Principal } from '../../shared/auth/principal.service';
import { helpToolboxFeature } from '../../shared/helpers/help-toolbox';

/** Forma usata dal grafico: una riga per CDS (livello 1) o per UO del CDS fissato (livello 2) */
interface VoceInventario {
  codice: string;
  descrizione: string;
  numeroBeni: number;
  valore: number;
}

export interface DatiInventario {
  anno: number;
  cds?: string;
  uo?: string;
  voci: VoceInventario[];
}

/** Elemento della breadcrumb: se ha `azione` è cliccabile, altrimenti è un livello non navigabile (o quello corrente) */
interface BreadcrumbItem {
  label: string;
  title?: string;
  azione?: () => void;
}

const COLORE_BENI = '#516fdb';   // blu: barre, numero beni
const COLORE_VALORE = '#e8890c'; // arancio: linea, valore totale


/** Icona Font Awesome 4.7 "file-image-o" (f1c5) come tracciato SVG, per il salva-immagine della toolbox */
const ICONA_IMMAGINE = 'path://M1468 380Q1496 408 1516 456T1536 544V1696Q1536 1736 1508 1764T1440 1792H96Q56 1792 28 1764T0 1696V96Q0 56 28 28T96 0H992Q1032 0 1080 20T1156 68ZM1024 136V512H1400Q1390 483 1378 471L1065 158Q1053 146 1024 136ZM1408 1664V640H992Q952 640 924 612T896 544V128H128V1664H1408ZM1280 1216V1536H256V1344L448 1152 576 1280 960 896ZM448 1024Q368 1024 312 968T256 832 312 696 448 640 584 696 640 832 584 968 448 1024Z';

/** Icona Font Awesome 4.7 "file-excel-o" (f1c3) come tracciato SVG, per la toolbox del grafico */
const ICONA_EXCEL = 'path://M1468 380Q1496 408 1516 456T1536 544V1696Q1536 1736 1508 1764T1440 1792H96Q56 1792 28 1764T0 1696V96Q0 56 28 28T96 0H992Q1032 0 1080 20T1156 68ZM1024 136V512H1400Q1390 483 1378 471L1065 158Q1053 146 1024 136ZM1408 1664V640H992Q952 640 924 612T896 544V128H128V1664H1408ZM429 1430V1536H710V1430H635L738 1269Q743 1262 748 1252.5T755.5 1239 759 1235H761Q762 1239 766 1245 768 1249 770.5 1252.5T776.5 1260.5 783 1269L890 1430H814V1536H1105V1430H1037L845 1157 1040 875H1107V768H828V875H902L799 1034Q795 1041 789 1050.5T780 1064L778 1067H776Q775 1063 771 1057 765 1046 754 1034L648 875H724V768H434V875H502L691 1147 497 1430H429Z';

/** Numero di strutture mostrate all'apertura del grafico (le altre si raggiungono con lo slider) */
const VOCI_VISIBILI_INIZIALI = 50;

/*__ICONE__*/

@Component({
  selector: 'cespiti-struttura',
  templateUrl: './cespiti-struttura.component.html',
  standalone: false
})
export class CespitiStrutturaComponent implements OnInit, OnDestroy {
  @Input() dashboard: boolean = false;
  /** Emesso a ogni fine caricamento dati (anche in caso di errore): la dashboard lo usa per mostrare il componente solo quando è pronto */
  @Output() caricato = new EventEmitter<void>();
  @Output() datiCaricati = new EventEmitter<DatiInventario>();

  protected filterForm!: FormGroup;
  esercizi: number[] = [];
  private anno!: number;

  /** CDS fissato (query param 'cds'): dal click su una barra o dalla scelta nel typeahead. Con CDS fissato il grafico mostra le sue UO */
  protected cdsFisso?: string;
  /** UO fissata (query param 'uo'): dal click su una barra a livello UO. Con UO fissata il grafico mostra le categorie gruppo */
  protected uoFissa?: string;
  /** descrizioni delle UO viste a livello 2, per il title della breadcrumb */
  private descrizioniUo = new Map<string, string>();

  @ViewChild('cdsFiltroInput', { static: false }) cdsFiltroInput!: ElementRef;
  protected cdsPairs: Pair[] = [];
  private lastValueCds: any = null;
  /** true mentre il click sul caret forza l'apertura della tendina (non è una cancellazione voluta dall'utente) */
  private aperturaTypeaheadCds = false;

  private destroy$ = new Subject<void>();
  private dataSub?: Subscription;

  protected chartOptions: EChartsOption = {};
  private chartInstance?: ECharts;
  protected legenda: VoceInventario[] = [];

  protected readonly coloreBeni = COLORE_BENI;
  protected readonly coloreValore = COLORE_VALORE;

  loadingChart = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private contextService: ContextService,
    private inventarioService: CespitiStrutturaService,
    private localStateStorageService: LocalStateStorageService,
    private principal: Principal
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['dashboard'] !== undefined) {
          this.dashboard = params['dashboard'] === 'true';
        }

        // CDS fissato: query param 'cds'
        this.cdsFisso = params['cds'] ?? undefined;
        // UO fissata: query param 'uo' (ha senso solo con un CDS fissato)
        this.uoFissa = this.cdsFisso ? (params['uo'] ?? undefined) : undefined;

        const annoParam = params['anno'] ? Number(params['anno']) : undefined;

        if (this.filterForm) {
          // componente già inizializzato: se l'URL porta un anno diverso, allinea il select
          if (annoParam && this.filterForm.controls['esercizio'].value !== annoParam) {
            this.filterForm.controls['esercizio'].setValue(annoParam, { emitEvent: false });
          }
          this.allineaFiltroCds();
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

  ngOnDestroy(): void {
    this.dataSub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(annoIniziale?: number): void {
    this.filterForm = this.formBuilder.group({
      esercizio: new FormControl(annoIniziale ?? Math.max(...this.esercizi)),
      cdsFiltro: new FormControl()
    });

    this.filterForm.controls['esercizio'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((esercizio: number) => this.loadData(esercizio));

    // svuotando il typeahead si toglie il CDS fissato (la scelta dalla tendina è gestita da onCdsSelected)
    this.filterForm.controls['cdsFiltro'].valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(value => {
        if (this.aperturaTypeaheadCds) {
          // svuotamento provocato dal click sul caret per aprire la tendina: non è una cancellazione
          this.aperturaTypeaheadCds = false;
          this.lastValueCds = value;
          return;
        }
        if (!value && this.lastValueCds) {
          this.fissaCds(null);
        }
        this.lastValueCds = value;
      });

    const esercizio = this.filterForm.controls['esercizio'].value;
    const caricaConCds = (cds: Pair[]) => {
      this.cdsPairs = cds ?? [];
      this.allineaFiltroCds();
      this.loadData(esercizio);
    };

    this.contextService.getCds().subscribe({
      next: caricaConCds,
      error: () => caricaConCds([])
    });
  }

  /** Allinea il valore del typeahead al CDS fissato (senza far scattare valueChanges) */
  private allineaFiltroCds(): void {
    const pair = this.cdsFisso ? this.cdsPairs.find(p => p.first === this.cdsFisso) : undefined;
    this.lastValueCds = pair ?? null;
    this.filterForm.controls['cdsFiltro'].setValue(pair ?? null, { emitEvent: false });
  }

  /**
   * Fissa (o, con null, rimuove) il CDS: lo scrive nei query param, che è l'unica fonte di verità.
   * La sottoscrizione a queryParams ricarica poi i dati.
   */
  private fissaCds(cds: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      // cambiando (o togliendo) il CDS si azzera anche la UO
      queryParams: { cds, uo: null, anno: this.anno },
      queryParamsHandling: 'merge'
    });
  }

  /** Fissa (o, con null, rimuove) la UO del CDS corrente e mostra le categorie gruppo */
  private fissaUo(uo: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { uo, anno: this.anno },
      queryParamsHandling: 'merge'
    });
  }

  onCdsSelected(event: NgbTypeaheadSelectItemEvent): void {
    this.aperturaTypeaheadCds = false;
    const cds: string | undefined = event?.item?.first;
    if (cds) {
      this.fissaCds(cds);
    }
  }

  onChartInit(chart: ECharts): void {
    this.chartInstance = chart;
  }

  /**
   * Click su una barra (o su un punto della linea):
   * - livello CDS: fissa il CDS cliccato e mostra le sue UO
   * - livello UO: fissa la UO cliccata e mostra le sue categorie gruppo
   * - livello categoria: nessuna azione
   */
  onChartClick(params: any): void {
    if (this.dashboard || this.uoFissa) {
      return;
    }
    const voce = this.legenda[params?.dataIndex];
    if (!voce) {
      return;
    }
    if (this.cdsFisso) {
      this.fissaUo(voce.codice);
    } else {
      this.fissaCds(voce.codice);
    }
  }

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

  openTypeaheadCds(): void {
    if (this.cdsFiltroInput) {
      this.aperturaTypeaheadCds = true;
      this.cdsFiltroInput.nativeElement.value = '';
      this.cdsFiltroInput.nativeElement.dispatchEvent(this.createNewEvent('input'));
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
    // annulla la chiamata precedente per evitare risposte fuori ordine
    this.dataSub?.unsubscribe();
    this.anno = anno;
    this.loadingChart.set(true);
    const livelloCds = !this.cdsFisso;
    const livelloUo = !!this.cdsFisso && !this.uoFissa;
    const richiesta$ = this.uoFissa
      ? this.inventarioService.getCategoria(anno, this.uoFissa)
      : this.inventarioService.getStruttura(anno, this.cdsFisso);
    this.dataSub = richiesta$
      .subscribe({
        next: (result) => {
          const data: VoceInventario[] = (result ?? [])
            .map(r => ({
              codice: r.codice,
              // a livello CDS la descrizione dell'unità padre può essere null: si recupera dall'elenco dei CDS
              descrizione: (r.descrizione
                ?? (livelloCds ? this.cdsPairs.find(p => p.first === r.codice)?.second : undefined)
                ?? '').trim(),
              numeroBeni: r.numeroTotaleBeni ?? 0,
              valore: r.valoreTotaleBeni ?? 0
            }))
            .sort((a, b) => a.codice.localeCompare(b.codice));
          if (livelloUo) {
            data.forEach(d => this.descrizioniUo.set(d.codice, d.descrizione));
          }
          this.legenda = data;
          this.loadChart(data);
          this.loadingChart.set(false);
          this.datiCaricati.emit({ anno, cds: this.cdsFisso, uo: this.uoFissa, voci: data });
          this.caricato.emit();
        },
        error: () => {
          this.loadingChart.set(false);
          this.caricato.emit();
        }
      });
  }

  /** Percorso di navigazione corrente, ad es.: Cespiti / Struttura / 002 */
  protected get breadcrumb(): BreadcrumbItem[] {
    const percorso: BreadcrumbItem[] = [{ label: 'Cespiti' }];

    percorso.push({
      label: 'Struttura',
      azione: this.cdsFisso ? () => this.fissaCds(null) : undefined
    });

    if (this.cdsFisso) {
      percorso.push({
        label: this.cdsFisso,
        title: this.cdsPairs.find(p => p.first === this.cdsFisso)?.second,
        azione: this.uoFissa ? () => this.fissaUo(null) : undefined
      });
    }

    if (this.uoFissa) {
      percorso.push({
        label: this.uoFissa,
        title: this.descrizioniUo.get(this.uoFissa)
      });
    }
    return percorso;
  }

  protected formatEur(v: number): string {
    return v != null
      ? v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€'
      : '-';
  }

  protected formatNum(v: number): string {
    return (v ?? 0).toLocaleString('it-IT');
  }

  /** Toolbox: salva immagine (blu) e scarica CSV (verde) */
  private toolbox(data: VoceInventario[], nomeFile: string) {
    return {
      feature: {
        myHelp: this.dashboard ? {} : helpToolboxFeature(this.router),
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
          iconStyle: { color: '#217346', borderWidth: 0 },          // verde Excel
          emphasis: { iconStyle: { color: '#185c37', borderWidth: 0 } },
          onclick: () => this.scaricaCsv(data, nomeFile)
        }
      }
    };
  }

  /** Esporta in CSV i dati mostrati nel grafico (separatore ';', UTF-8 con BOM, per Excel in italiano) */
  private scaricaCsv(data: VoceInventario[], nomeFile: string): void {
    const num = (v: number) => (v ?? 0).toFixed(2).replace('.', ',');
    const testo = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;

    const righe = [
      ['Codice', 'Descrizione', 'Numero beni', 'Valore totale'].join(';'),
      ...data.map(d => [
        testo(d.codice),
        testo(d.descrizione),
        String(d.numeroBeni ?? 0),
        num(d.valore)
      ].join(';'))
    ];

    const blob = new Blob(['﻿' + righe.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeFile}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Grafico misto: barre = numero beni (asse sinistro), linea = valore totale in € (asse destro) */
  private loadChart(data: VoceInventario[]): void {
    const categories = data.map(d => d.codice);
    const finestra = data.length > VOCI_VISIBILI_INIZIALI
      ? { startValue: 0, endValue: VOCI_VISIBILI_INIZIALI - 1 }
      : {};
    const cursor = this.uoFissa ? 'default' : 'pointer';

    const suffisso = this.uoFissa
      ? ` - CDS ${this.cdsFisso} - UO ${this.uoFissa}`
      : this.cdsFisso ? ` - CDS ${this.cdsFisso}` : ' (per CDS)';
    const nomeFile = this.uoFissa
      ? `cespiti_categoria_${this.anno}_${this.uoFissa}`
      : `cespiti_struttura_${this.anno}${this.cdsFisso ? '_' + this.cdsFisso : ''}`;

    this.chartOptions = {
      title: {
        text: this.uoFissa ? 'Cespiti per Categoria Gruppo' : 'Cespiti per Struttura',
        subtext: `Anno ${this.anno}${suffisso}`,
        left: 'center'
      },
      toolbox: this.toolbox(data, nomeFile),
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        textStyle: { align: 'left' },
        confine: true,
        formatter: (params: any) => {
          const row = data[params[0]?.dataIndex];
          if (!row) return '';
          return [
            `<b>${row.codice}</b>`,
            `<div style="max-width:320px;white-space:normal">${row.descrizione}</div>`,
            `<span style="color:${COLORE_BENI}">■</span> Numero beni: ${this.formatNum(row.numeroBeni)}`,
            `<span style="color:${COLORE_VALORE}">●</span> Valore totale: ${this.formatEur(row.valore)}`
          ].join('<br/>');
        }
      },
      // la legenda delle serie e quella codice/descrizione sono rese in HTML sotto il grafico
      legend: { show: false },
      grid: { left: '3%', right: '3%', bottom: '8%', top: '18%', containLabel: true },
      dataZoom: [
        { type: 'inside', ...finestra },
        { type: 'slider', height: 38, bottom: 0, ...finestra }
      ],
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { fontSize: 11, rotate: 60 }
      },
      // doppio asse Y: indice 0 = quantità (sx), indice 1 = valore economico (dx, senza griglia per non sovrapporla)
      yAxis: [
        {
          type: 'value',
          name: 'N. beni',
          position: 'left',
          axisLabel: { formatter: (v: number) => v.toLocaleString('it-IT') }
        },
        {
          type: 'value',
          name: 'Valore (€)',
          position: 'right',
          splitLine: { show: false },
          axisLabel: {
            formatter: (v: number) =>
              v >= 1e6 ? (v / 1e6).toLocaleString('it-IT') + ' M€' : v.toLocaleString('it-IT') + '€'
          }
        }
      ],
      series: [
        {
          name: 'Numero beni',
          type: 'bar',
          yAxisIndex: 0,
          barMaxWidth: 28,
          cursor,
          itemStyle: { color: COLORE_BENI, borderRadius: [6, 6, 0, 0] },
          data: data.map(d => d.numeroBeni),
          animationDuration: 1000
        },
        {
          name: 'Valore totale',
          type: 'line',
          yAxisIndex: 1,
          cursor,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3, color: COLORE_VALORE },
          itemStyle: { color: COLORE_VALORE },
          data: data.map(d => d.valore),
          animationDuration: 1000
        }
      ]
    };
  }
}