import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit, ViewChild, ViewChildren, QueryList, Input, Output, EventEmitter, signal } from "@angular/core";
import { ContextService } from "app/context";
import { IndiceTempestivitaPagamentiService } from "./indice-tempestivita-pagamenti.service";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Observable, Subject } from 'rxjs';
import { map, debounceTime, takeUntil } from 'rxjs/operators';
import { Pair } from "../../context/pair.model";

// Apache ECharts
import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';

import { NgbDropdown, NgbTypeaheadConfig, NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStateStorageService } from '../../shared/auth/local-storage.service';
import { Principal } from '../../shared/auth/principal.service';

/** Icona Font Awesome 4.7 "file-image-o" (f1c5) come tracciato SVG, per il salva-immagine della toolbox */
const ICONA_IMMAGINE = 'path://M1468 380Q1496 408 1516 456T1536 544V1696Q1536 1736 1508 1764T1440 1792H96Q56 1792 28 1764T0 1696V96Q0 56 28 28T96 0H992Q1032 0 1080 20T1156 68ZM1024 136V512H1400Q1390 483 1378 471L1065 158Q1053 146 1024 136ZM1408 1664V640H992Q952 640 924 612T896 544V128H128V1664H1408ZM1280 1216V1536H256V1344L448 1152 576 1280 960 896ZM448 1024Q368 1024 312 968T256 832 312 696 448 640 584 696 640 832 584 968 448 1024Z';

/** Icona Font Awesome 4.7 "file-excel-o" (f1c3) come tracciato SVG, per la toolbox del grafico */
const ICONA_EXCEL = 'path://M1468 380Q1496 408 1516 456T1536 544V1696Q1536 1736 1508 1764T1440 1792H96Q56 1792 28 1764T0 1696V96Q0 56 28 28T96 0H992Q1032 0 1080 20T1156 68ZM1024 136V512H1400Q1390 483 1378 471L1065 158Q1053 146 1024 136ZM1408 1664V640H992Q952 640 924 612T896 544V128H128V1664H1408ZM429 1430V1536H710V1430H635L738 1269Q743 1262 748 1252.5T755.5 1239 759 1235H761Q762 1239 766 1245 768 1249 770.5 1252.5T776.5 1260.5 783 1269L890 1430H814V1536H1105V1430H1037L845 1157 1040 875H1107V768H828V875H902L799 1034Q795 1041 789 1050.5T780 1064L778 1067H776Q775 1063 771 1057 765 1046 754 1034L648 875H724V768H434V875H502L691 1147 497 1430H429Z';

@Component({
    selector: 'indice-tempestivita-pagamenti',
    templateUrl: './indice-tempestivita-pagamenti.component.html',
    providers: [NgbDropdown, NgbTypeaheadConfig],
    standalone: false
})
export class IndiceTempestivitaPagamentiComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() dashboard: boolean = false;
    /** Emesso a ogni fine caricamento dati (anche in caso di errore): la dashboard lo usa per mostrare il componente solo quando è pronto */
    @Output() caricato = new EventEmitter<void>();

    protected filterForm!: FormGroup;

    @ViewChildren('chartTrimestre') chartTrimestri!: QueryList<ElementRef>;
    @ViewChild('chartdivEsercizio', { static: false }) chartdivEsercizio!: ElementRef;

    chartDivStyle = 'height:30vh !important';
    chartDivClass = 'col-md-3 font-weight-bold text-monospace text-center';

    // Mappa delle istanze ECharts (chiave: '0'=esercizio, '1'-'4'=trimestri)
    private chartInstances: Map<string, ECharts | null> = new Map();
    private chartRefs: Map<string, ElementRef> = new Map();

    @ViewChild('uo', { static: false }) uoInput!: ElementRef;
    protected uoPairs!: Pair[];
    private destroy$ = new Subject<void>();
    private lastValue: any = null;
    /** true mentre il click sul caret forza l'apertura della tendina (non è una cancellazione voluta dall'utente) */
    private aperturaTypeahead = false;
    esercizi!: number[];
    loadingChart = signal(false);
    trimestri: string[] = ['1', '2', '3', '4'];

    /** Ultimo risultato caricato, usato per l'estrazione CSV */
    private lastResult: Record<string, number> | null = null;
    private lastEsercizio!: number;
    private lastUo?: string;

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected contextService: ContextService,
        protected indiceService: IndiceTempestivitaPagamentiService,
        protected translateService: TranslateService,
        private localStateStorageService: LocalStateStorageService,
        private principal: Principal,
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['dashboard'] !== undefined) {
                this.dashboard = params['dashboard'] === 'true';
            }
            this.contextService.getEsercizi().subscribe((esercizi: number[]) => {
                this.esercizi = esercizi;
                this.principal.getIdentyAccount(false).then((account) => {
                    const userContext = this.localStateStorageService.getUserContext(account.username);
                    this.contextService.getEsercizi().subscribe((esercizi: number[]) => {
                        this.esercizi = esercizi;
                        this.initializeComponent(userContext?.esercizio);
                    });
                });
            });
        });
    }

    ngAfterViewInit(): void {
        this.chartRefs.set('0', this.chartdivEsercizio);

        this.chartTrimestri.forEach((chartRef: ElementRef) => {
            const trimestre = chartRef.nativeElement.getAttribute('data-trimestre');
            if (trimestre) {
                this.chartRefs.set(trimestre, chartRef);
            }
        });
    }

    private initializeComponent(esercizio?: number): void {
        this.chartDivClass = 'col-md-3 font-weight-bold text-monospace text-center text-success';
        if (this.dashboard) {
            this.chartDivClass += ' d-none';
        }
        this.filterForm = this.formBuilder.group({
            esercizio: new FormControl(esercizio || Math.max(...this.esercizi)),
            uo: new FormControl()
        });

        this.filterForm.controls.uo?.valueChanges
            .pipe(
                debounceTime(300),
                takeUntil(this.destroy$)
            )
            .subscribe(value => {
                if (this.aperturaTypeahead) {
                    // svuotamento provocato dal click sul caret per aprire la tendina: non è una cancellazione
                    this.aperturaTypeahead = false;
                    this.lastValue = value;
                    return;
                }
                if (!value && this.lastValue) {
                    this.callIndice(this.filterForm?.controls?.esercizio?.value);
                }
                this.lastValue = value;
            });

        this.filterForm.controls.esercizio.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe((esercizio: any) => {
                this.callIndice(esercizio, this.filterForm?.controls?.uo?.value?.first);
            });

        this.contextService.getUo().subscribe((result: Pair[]) => {
            this.uoPairs = result;
        });

        this.callIndice(this.filterForm.controls['esercizio'].value);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.chartInstances.forEach(instance => this.disposeChart(instance));
        this.chartInstances.clear();
    }

    onUoSelected(event: NgbTypeaheadSelectItemEvent) {
        this.aperturaTypeahead = false;
        this.callIndice(this.filterForm.controls.esercizio.value, event?.item?.first);
    }

    private disposeChart(instance: ECharts | null): void {
        if (instance && !instance.isDisposed()) {
            instance.dispose();
        }
    }

    private initializeChart(element: ElementRef, currentInstance: ECharts | null): ECharts {
        this.disposeChart(currentInstance);
        return echarts.init(element.nativeElement);
    }

    searchuo = (text$: Observable<string>) =>
        text$
            .pipe(debounceTime(200))
            .pipe(map((term: string) => this.filterPair(term, this.uoPairs, 'uo')
                .slice(0, 200)));

    filterPair(term: string, pairs: Pair[], type: string): Pair[] {
        if (term === '') {
            return pairs;
        } else {
            return pairs.filter((v) => new RegExp(term, 'gi').test(v.first + ' - ' + v.second));
        }
    }

    formatter = (pair: Pair) => pair.first + ' - ' + pair.second;
    formatterFirst = (pair: Pair) => pair.first;

    openTypeaheadUo() {
        this.aperturaTypeahead = true;
        this.uoInput.nativeElement.value = '';
        this.uoInput.nativeElement.dispatchEvent(this.createNewEvent('input'));
    }

    createNewEvent(eventName: string): Event {
        if (typeof Event === 'function') {
            return new Event(eventName);
        } else {
            const event = document.createEvent('Event');
            event.initEvent(eventName, true, true);
            return event;
        }
    }

    callIndice(esercizio: number, uo?: string): void {
        setTimeout(() => {
            this.loadingChart.set(true);
        }, 0);

        this.indiceService.getIndice(esercizio, uo).subscribe({
          next: (result: Map<string, number>) => {
            this.lastResult = result as unknown as Record<string, number>;
            this.lastEsercizio = esercizio;
            this.lastUo = uo;

            ['0', '1', '2', '3', '4'].forEach(key => {
                const chartRef = this.chartRefs.get(key);
                const nomeFile = this.nomeFile(key, esercizio, uo);
                // != null: il valore 0 è il risultato atteso dalla normativa e va disegnato
                if (result[key] != null && chartRef?.nativeElement) {
                    const existingInstance = this.chartInstances.get(key) ?? null;
                    const newInstance = this.initializeChart(chartRef, existingInstance);
                    this.chartInstances.set(key, newInstance);
                    this.loadChart(newInstance, result[key], nomeFile, this.titoloGrafico(key, esercizio));
                } else {
                    const existingInstance = this.chartInstances.get(key) ?? null;
                    this.disposeChart(existingInstance);
                    this.chartInstances.set(key, null);
                }
            });

            setTimeout(() => {
                this.loadingChart.set(false);
                this.caricato.emit();
            }, 0);
          },
          error: () => {
            this.loadingChart.set(false);
            this.caricato.emit();
          }
        });
    }

    private nomeFile(key: string, esercizio: number, uo?: string): string {
        const uoSuffix = uo ? `_${uo}` : '';
        return key === '0'
            ? `indice_tempestivita_${esercizio}${uoSuffix}`
            : `indice_tempestivita_${esercizio}_T${key}${uoSuffix}`;
    }

    /** Titolo mostrato dentro il grafico */
    private titoloGrafico(key: string, esercizio: number): string {
        if (key !== '0') {
            return this.translateService.instant(`dashboard.indice-tempestivita.trimestre.${key}`);
        }
        return this.dashboard
            ? `${this.translateService.instant('dashboard.indice-tempestivita.title')} ${esercizio}`
            : this.translateService.instant('dashboard.indice-tempestivita.intero-anno');
    }

    private toolbox(nomeFile: string) {
        return {
            feature: {
                saveAsImage: {
                    title: 'Salva immagine',
                    name: nomeFile,
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

    /** Esporta in CSV l'indice di tutti i periodi (separatore ';', UTF-8 con BOM, per Excel in italiano) */
    private scaricaCsv(): void {
        if (!this.lastResult) { return; }
        const num = (v: number) => (v ?? 0).toFixed(2).replace('.', ',');
        const testo = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;

        const righe = [
            ['Esercizio', 'UO', 'Periodo', 'Indice di tempestività'].join(';'),
            ...['1', '2', '3', '4', '0']
                .filter(key => this.lastResult![key] != null)
                .map(key => [
                    this.lastEsercizio,
                    testo(this.lastUo ?? 'Ente'),
                    testo(this.titoloGrafico(key, this.lastEsercizio)),
                    num(this.lastResult![key])
                ].join(';'))
        ];

        const nomeFile = `indice_tempestivita_${this.lastEsercizio}${this.lastUo ? '_' + this.lastUo : ''}`;
        const blob = new Blob(['\uFEFF' + righe.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nomeFile}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    private loadChart(chartInstance: ECharts, value: number, nomeFile: string, chartTitle: string): void {
        // Calcola min/max dinamici in base al valore, allineati a multipli di 10
        const defaultMin = -30;
        const defaultMax = 30;
        const axisMin = value < defaultMin ? Math.floor(value / 10) * 10 : defaultMin;
        const axisMax = value > defaultMax ? Math.ceil(value / 10) * 10 : defaultMax;

        const bandsData = [
            { color: '#0f9747', lowScore: -30, highScore: -20 },
            { color: '#54b947', lowScore: -20, highScore: -10 },
            { color: '#b0d136', lowScore: -10, highScore: 0 },
            { color: '#fdae19', lowScore: 0,   highScore: 10 },
            { color: '#f04922', lowScore: 10,  highScore: 20 },
            { color: '#ee1f25', lowScore: 20,  highScore: 30 }
        ];

        // Estendi le bande se il valore supera il range standard
        const extendedBands = [...bandsData];
        if (value > defaultMax) {
            extendedBands.push({ color: '#000000', lowScore: defaultMax, highScore: axisMax });
        }
        if (value < defaultMin) {
            extendedBands.push({ color: '#007bff', lowScore: axisMin, highScore: defaultMin });
        }

        // Converti le bande in axisLine colorSegments per ECharts gauge
        // ECharts vuole valori normalizzati [0, 1] sull'asse
        const totalRange = axisMax - axisMin;
        const colorSegments: [number, string][] = extendedBands
            .sort((a, b) => a.lowScore - b.lowScore)
            .map(band => [
                (band.highScore - axisMin) / totalRange,
                band.color
            ]);

        const option: EChartsOption = {
            title: {
                text: chartTitle,
                left: 'center',
                top: 8,
                textStyle: { fontSize: this.dashboard ? 20 : 16, fontWeight: 'bold' }
            },
            toolbox: this.toolbox(nomeFile),
            series: [
                {
                    type: 'gauge',
                    startAngle: 200,
                    endAngle: -20,
                    min: axisMin,
                    max: axisMax,
                    splitNumber: (axisMax - axisMin) / 10,
                    // raggio e centro ridotti rispetto a prima per lasciare spazio al titolo in alto
                    radius: this.dashboard ? '95%' : '110%',
                    center: ['50%', '74%'],
                    axisLine: {
                        lineStyle: {
                            width: 40,
                            color: colorSegments
                        }
                    },
                    anchor: {
                        show: true,
                        showAbove: true,
                        size: 25,
                        itemStyle: {
                            color: '#4e6fce',
                            borderColor: '#fff',
                            borderWidth: 3
                        }
                    },
                    pointer: {
                        length: '70%',
                        width: 12,
                        itemStyle: {
                            color: 'auto'
                        }
                    },
                    axisTick: {
                        length: 12,
                        lineStyle: {
                            color: 'auto',
                            width: 2
                        }
                    },
                    splitLine: {
                        length: 20,
                        lineStyle: {
                            color: 'auto',
                            width: 3
                        }
                    },
                    axisLabel: {
                        color: '#464646',
                        fontSize: 14,
                        distance: -50,
                        formatter: (val: number) => val.toString()
                    },
                    title: {
                        show: false
                    },
                    detail: {
                        valueAnimation: true,
                        formatter: (val: number) => val.toFixed(2),
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: 'bold',
                        offsetCenter: [0, '35%'],
                        backgroundColor: 'inherit',
                        borderRadius: 4,
                        padding: [4, 8]
                    },
                    data: [
                        {
                            value: axisMin,
                            name: ''
                        }
                    ],
                    animationDuration: 0
                }
            ]
        };

        chartInstance.setOption(option);
        setTimeout(() => {
            chartInstance.setOption({
                series: [
                    {
                        data: [{ value: value, name: '' }],
                        animationDuration: 1500,
                        animationEasingUpdate: 'cubicInOut'
                    }
                ]
            });
        }, 100);
        const resizeObserver = new ResizeObserver(() => {
            chartInstance.resize();
        });
        resizeObserver.observe(chartInstance.getDom());
    }
}