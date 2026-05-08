import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit, ViewChild, ViewChildren, QueryList, Input, signal } from "@angular/core";
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

@Component({
    selector: 'indice-tempestivita-pagamenti',
    templateUrl: './indice-tempestivita-pagamenti.component.html',
    providers: [NgbDropdown, NgbTypeaheadConfig],
    standalone: false
})
export class IndiceTempestivitaPagamentiComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() dashboard: boolean = false;

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
    esercizi!: number[];
    loadingChart = signal(false);
    trimestri: string[] = ['1', '2', '3', '4'];

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected contextService: ContextService,
        protected indiceService: IndiceTempestivitaPagamentiService,
        protected translateService: TranslateService
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['dashboard'] !== undefined) {
                this.dashboard = params['dashboard'] === 'true';
            }
            this.contextService.getEsercizi().subscribe((esercizi: number[]) => {
                this.esercizi = esercizi;
                this.initializeComponent();
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

    private initializeComponent(): void {
        this.chartDivClass = 'col-md-3 font-weight-bold text-monospace text-center text-success';
        if (this.dashboard) {
            this.chartDivClass += ' d-none';
        }

        this.filterForm = this.formBuilder.group({
            esercizio: new FormControl(Math.max(...this.esercizi)),
            uo: new FormControl()
        });

        this.filterForm.controls.uo?.valueChanges
            .pipe(
                debounceTime(300),
                takeUntil(this.destroy$)
            )
            .subscribe(value => {
                if (!value && this.lastValue) {
                    this.callIndice(this.filterForm?.controls?.esercizio?.value);
                }
                this.lastValue = value;
            });

        this.filterForm.controls.esercizio.valueChanges.subscribe((esercizio: any) => {
            this.callIndice(esercizio, this.filterForm?.controls?.uo?.value?.first);
        });

        this.contextService.getUo().subscribe((result: Pair[]) => {
            this.uoPairs = result;
        });

        this.callIndice(this.filterForm.controls['esercizio'].value);
    }

    ngOnDestroy(): void {
        this.chartInstances.forEach(instance => this.disposeChart(instance));
        this.chartInstances.clear();
    }

    onUoSelected(event: NgbTypeaheadSelectItemEvent) {
        console.log(event);
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

        this.indiceService.getIndice(esercizio, uo).subscribe((result: Map<string, number>) => {
            ['0', '1', '2', '3', '4'].forEach(key => {
                const chartRef = this.chartRefs.get(key);
                const uoSuffix = uo ? `_${uo}` : '';
                const title = key === '0'
                    ? `indice_tempestivita_${esercizio}${uoSuffix}`
                    : `indice_tempestivita_${esercizio}_T${key}${uoSuffix}`;
                if (result[key] && chartRef?.nativeElement) {
                    const existingInstance = this.chartInstances.get(key) ?? null;
                    const newInstance = this.initializeChart(chartRef, existingInstance);
                    this.chartInstances.set(key, newInstance);
                    this.loadChart(newInstance, result[key], title);
                } else {
                    const existingInstance = this.chartInstances.get(key) ?? null;
                    this.disposeChart(existingInstance);
                    this.chartInstances.set(key, null);
                }
            });

            setTimeout(() => {
                this.loadingChart.set(false);
            }, 0);
        });
    }

    private loadChart(chartInstance: ECharts, value: number, title: string): void {
        console.log('Caricamento grafico con valore:', value);

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

        // Normalizza il valore per il pointer (ECharts gauge usa i valori reali con min/max)
        const option: EChartsOption = {
            toolbox: {
                feature: {
                    saveAsImage: {
                    title: 'Salva immagine',
                    name: `indicatore_${title}`
                    }
                }
            },
            series: [
                {
                    type: 'gauge',
                    startAngle: 200,
                    endAngle: -20,
                    min: axisMin,
                    max: axisMax,
                    splitNumber: (axisMax - axisMin) / 10,
                    radius: this.dashboard ? '100%':'120%',
                    center: ['50%', '70%'],
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