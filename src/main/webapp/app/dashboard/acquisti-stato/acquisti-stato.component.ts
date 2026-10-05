import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal } from "@angular/core";
import { ContextService } from "app/context";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { NgbDropdown, NgbTypeaheadConfig, NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import { AcquistiStatoService } from "./acquisti-stato.service";
import { Observable, Subject } from 'rxjs';
import { map, debounceTime, takeUntil } from 'rxjs/operators';
import { Pair } from "../../context/pair.model";
import { EChartsOption } from "echarts";

/** Icona Font Awesome 4.7 "file-image-o" (f1c5) come tracciato SVG, per il salva-immagine della toolbox */
const ICONA_IMMAGINE = 'path://M1468 380Q1496 408 1516 456T1536 544V1696Q1536 1736 1508 1764T1440 1792H96Q56 1792 28 1764T0 1696V96Q0 56 28 28T96 0H992Q1032 0 1080 20T1156 68ZM1024 136V512H1400Q1390 483 1378 471L1065 158Q1053 146 1024 136ZM1408 1664V640H992Q952 640 924 612T896 544V128H128V1664H1408ZM1280 1216V1536H256V1344L448 1152 576 1280 960 896ZM448 1024Q368 1024 312 968T256 832 312 696 448 640 584 696 640 832 584 968 448 1024Z';

/** Icona Font Awesome 4.7 "file-excel-o" (f1c3) come tracciato SVG, per la toolbox del grafico */
const ICONA_EXCEL = 'path://M1468 380Q1496 408 1516 456T1536 544V1696Q1536 1736 1508 1764T1440 1792H96Q56 1792 28 1764T0 1696V96Q0 56 28 28T96 0H992Q1032 0 1080 20T1156 68ZM1024 136V512H1400Q1390 483 1378 471L1065 158Q1053 146 1024 136ZM1408 1664V640H992Q952 640 924 612T896 544V128H128V1664H1408ZM429 1430V1536H710V1430H635L738 1269Q743 1262 748 1252.5T755.5 1239 759 1235H761Q762 1239 766 1245 768 1249 770.5 1252.5T776.5 1260.5 783 1269L890 1430H814V1536H1105V1430H1037L845 1157 1040 875H1107V768H828V875H902L799 1034Q795 1041 789 1050.5T780 1064L778 1067H776Q775 1063 771 1057 765 1046 754 1034L648 875H724V768H434V875H502L691 1147 497 1430H429Z';

@Component({
  selector: 'acquisti-stato',
  templateUrl: './acquisti-stato.component.html',
  providers: [NgbDropdown, NgbTypeaheadConfig],
  standalone: false
})
export class AcquistiStatoComponent implements OnInit, OnDestroy {
  @Input() dashboard: boolean = false;
  @Input() codiceUo: string;
  /** Emesso a ogni fine caricamento dati (anche in caso di errore): la dashboard lo usa per mostrare il componente solo quando è pronto */
  @Output() caricato = new EventEmitter<void>();

  protected filterForm: FormGroup;

  protected chartOptions: EChartsOption = {};

  esercizi: number[];
  loadingChart = signal(false);
  private lastValue: any = null;
  /** true mentre il click sul caret forza l'apertura della tendina (non è una cancellazione voluta dall'utente) */
  private aperturaTypeahead = false;
  private destroy$ = new Subject<void>();
  protected uoPairs: Pair[];

  /** Ultimi dati caricati e UO corrente, usati per titolo e CSV */
  private lastData: any[] = [];
  private codiceCorrente?: string;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected formBuilder: FormBuilder,
    protected contextService: ContextService,
    protected acquistiStatoService: AcquistiStatoService,
    protected translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['dashboard'] !== undefined) {
        this.dashboard = params['dashboard'] === 'true';
      }
      this.initializeComponent();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.filterForm = this.formBuilder.group({
      codice: new FormControl(this.codiceUo)
    });

    this.filterForm.controls['codice']?.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (this.aperturaTypeahead) {
        // svuotamento provocato dal click sul caret per aprire la tendina: non è una cancellazione
        this.aperturaTypeahead = false;
        this.lastValue = value;
        return;
      }
      if (!value && this.lastValue) {
        this.callStato();
      }
      this.lastValue = value;
    });

    this.contextService.getUo().subscribe((result: Pair[]) => {
      this.uoPairs = result;
    });

    this.callStato(this.codiceUo || this.filterForm.controls['codice'].value);
  }

  onUoSelected(event: NgbTypeaheadSelectItemEvent) {
    this.aperturaTypeahead = false;
    this.callStato(event?.item?.first);
  }

  searchuo = (text$: Observable<string>) =>
    text$.pipe(debounceTime(200)).pipe(
      map((term: string) => this.filterPair(term, this.uoPairs, 'uo').slice(0, 200))
    );

  filterPair(term: string, pairs: Pair[], type: string): Pair[] {
    if (term === '') return pairs;
    return pairs.filter(v => new RegExp(term, 'gi').test(v.first + ' - ' + v.second));
  }

  formatter = (pair: Pair) => pair.first + ' - ' + pair.second;
  formatterFirst = (pair: Pair) => pair.first;

  openTypeaheadUo() {
    const input = document.getElementById('codice') as HTMLInputElement;
    if (input) {
      this.aperturaTypeahead = true;
      input.value = '';
      input.dispatchEvent(this.createNewEvent('input'));
    }
  }

  createNewEvent(eventName: string): Event {
    if (typeof Event === 'function') return new Event(eventName);
    const event = document.createEvent('Event');
    event.initEvent(eventName, true, true);
    return event;
  }

  callStato(codice?: string): void {
    this.codiceCorrente = codice;
    this.loadingChart.set(true);
    this.acquistiStatoService.getIndice(codice).subscribe({
      next: (result: any[]) => {
        const data = result?.slice(-4).map(item => ({
          ...item,
          riepilogo_stato_esercizio: String(item.riepilogo_stato_esercizio)
        })) ?? [];
        this.lastData = data;
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

  private nomeFile(): string {
    return `acquisti_per_stato${this.codiceCorrente ? '_' + this.codiceCorrente : ''}`;
  }

  private toolbox() {
    return {
      feature: {
        saveAsImage: {
          title: 'Salva immagine',
          name: this.nomeFile(),
          icon: ICONA_IMMAGINE,
          iconStyle: { color: '#2c6fbb', borderWidth: 0 },
          emphasis: { iconStyle: { color: '#1f5291', borderWidth: 0 } }
        },
        myScaricaCsv: {
          show: true,
          title: 'Scarica CSV',
          icon: ICONA_EXCEL,
          iconStyle: { color: '#217346', borderWidth: 0 },
          emphasis: { iconStyle: { color: '#185c37', borderWidth: 0 } },
          onclick: () => this.scaricaCsv()
        }
      }
    };
  }

  /** Esporta in CSV i dati mostrati nel grafico (separatore ';', UTF-8 con BOM, per Excel in italiano) */
  private scaricaCsv(): void {
    if (!this.lastData?.length) { return; }
    const num = (v: number) => (v ?? 0).toFixed(2).replace('.', ',');
    const testo = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;

    const righe = [
      ['Esercizio', 'UO',
        'N. ricevute', 'Importo ricevute',
        'N. registrate', 'Importo registrate',
        'N. pagate', 'Importo pagate'].join(';'),
      ...this.lastData.map(d => [
        testo(d.riepilogo_stato_esercizio),
        testo(this.codiceCorrente ?? 'Ente'),
        d.riepilogo_stato_num_ricevute ?? 0,   num(d.riepilogo_stato_importo_ricevute),
        d.riepilogo_stato_num_registrate ?? 0, num(d.riepilogo_stato_importo_registrate),
        d.riepilogo_stato_num_pagate ?? 0,     num(d.riepilogo_stato_importo_pagate)
      ].join(';'))
    ];

    const blob = new Blob(['\uFEFF' + righe.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.nomeFile()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private loadChart(data: any[]): void {
    const categories = data.map(d => d.riepilogo_stato_esercizio);

    const formatEur = (v: number) =>
      v != null ? v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€' : '-';

    const series: any[] = [
      {
        label: 'RICEVUTE',
        valueField: 'riepilogo_stato_importo_ricevute',
        countField: 'riepilogo_stato_num_ricevute'
      },
      {
        label: 'REGISTRATE',
        valueField: 'riepilogo_stato_importo_registrate',
        countField: 'riepilogo_stato_num_registrate'
      },
      {
        label: 'PAGATE',
        valueField: 'riepilogo_stato_importo_pagate',
        countField: 'riepilogo_stato_num_pagate'
      }
    ].map(s => ({
      name: s.label,
      type: 'bar',
      barMaxWidth: '30%',
      label: {
        show: true,
        position: 'insideBottom',
        rotate: 90,
        align: 'left',
        verticalAlign: 'middle',
        formatter: (params: any) => formatEur(params.value),
        fontSize: 11,
        color: '#fff'
      },
      tooltip: {
        valueFormatter: (value: number, dataIndex: number) => {
          const row = data[dataIndex];
          const count = row?.[s.countField];
          return `N. ${count} ${s.label} — Totale: ${formatEur(value)}`;
        }
      },
      data: data.map(d => d[s.valueField] ?? 0),
      animationDuration: 1000
    }));

    this.chartOptions = {
      title: {
        text: this.translateService.instant('dashboard.acquisti-stato.title')
              + (this.codiceCorrente ? ` della UO: ${this.codiceCorrente}` : ''),
        subtext: this.translateService.instant('dashboard.acquisti-stato.descrizione'),
        left: 'center',
        top: 8,
        textStyle: { fontSize: this.dashboard ? 20 : 16, fontWeight: 'bold' },
        subtextStyle: {
          fontSize: 12,
          color: '#555',
          fontStyle: 'italic',
          align: 'center'
        }
      },
      toolbox: this.toolbox(),
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        textStyle: { align: 'left' },
        formatter: (params: any) => {
          const year = params[0]?.axisValue;
          const row = data.find(d => d.riepilogo_stato_esercizio === year);
          if (!row) return '';
          return [
            `<b>${year}</b>`,
            ...params.map(p => {
              const s = [
                { label: 'RICEVUTE',   countField: 'riepilogo_stato_num_ricevute'    },
                { label: 'REGISTRATE', countField: 'riepilogo_stato_num_registrate'  },
                { label: 'PAGATE',     countField: 'riepilogo_stato_num_pagate'      }
              ].find(x => x.label === p.seriesName);
              const count = s ? row[s.countField] : '-';
              return `${p.marker} ${p.seriesName}: N. ${count} — ${formatEur(p.value)}`;
            })
          ].join('<br/>');
        }
      },
      legend: {
        bottom: 0,
        data: ['RICEVUTE', 'REGISTRATE', 'PAGATE']
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '10%',
        top: '25%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          fontSize: 13,
          fontWeight: 'bold'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v: number) => v.toLocaleString('it-IT') + '€'
        }
      },
      series
    };
  }
}