import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Input } from "@angular/core";
import { ContextService } from "app/context";
import { IndiceTempestivitaPagamentiService } from "./indice-tempestivita-pagamenti.service";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Observable ,  Subscription } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';
import { Pair } from "../../context/pair.model";

import * as am5 from '@amcharts/amcharts5';
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { NgbDropdown, NgbTypeaheadConfig } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector: 'indice-tempestivita-pagamenti',
    templateUrl: './indice-tempestivita-pagamenti.component.html',
    providers: [NgbDropdown, NgbTypeaheadConfig],
    standalone: false
})
export class IndiceTempestivitaPagamentiComponent implements OnInit, OnDestroy {
    @Input() dashboard: boolean = false;

    protected filterForm: FormGroup;

    @ViewChild('chartdivTrimestre1', { static: true }) chartdivTrimestre1: ElementRef;
    @ViewChild('chartdivTrimestre2', { static: true }) chartdivTrimestre2: ElementRef;
    @ViewChild('chartdivTrimestre3', { static: true }) chartdivTrimestre3: ElementRef;
    @ViewChild('chartdivTrimestre4', { static: true }) chartdivTrimestre4: ElementRef;
    @ViewChild('chartdivEsercizio', { static: true }) chartdivEsercizio: ElementRef;
    
    chartDivStyle = 'height:30vh !important';
    chartDivClass = 'col-md-3 font-weight-bold text-monospace text-center text-success';

    private roots: Map<string, am5.Root | null> = new Map();
    private chartRefs: Map<string, ElementRef> = new Map();
    @ViewChild('uo', {static : false}) uoInput: ElementRef;
    protected uoPairs: Pair[];

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected contextService: ContextService,
        protected indiceService: IndiceTempestivitaPagamentiService,
        protected translateService: TranslateService
    ) {}

    ngOnInit(): void {
        // Sottoscrivi ai queryParams per reagire ai cambiamenti
        this.route.queryParams.subscribe(params => {
            // Se c'è il parametro, usalo, altrimenti usa l'@Input
            if (params['dashboard'] !== undefined) {
                this.dashboard = params['dashboard'] === 'true';
            }
            
            this.initializeComponent();
        });
    }

    private initializeComponent(): void {
        // Resetta la classe se necessario
        this.chartDivClass = 'col-md-3 font-weight-bold text-monospace text-center text-success';
        if (this.dashboard) {
            this.chartDivClass += ' d-none';
        }

        this.chartRefs.set('0', this.chartdivEsercizio);
        this.chartRefs.set('1', this.chartdivTrimestre1);
        this.chartRefs.set('2', this.chartdivTrimestre2);
        this.chartRefs.set('3', this.chartdivTrimestre3);
        this.chartRefs.set('4', this.chartdivTrimestre4);

        this.filterForm = this.formBuilder.group({
            esercizio: new FormControl(new Date().getFullYear()),
            uo: new FormControl()
        });

        this.filterForm.valueChanges.subscribe((value: any) => {
            this.callIndice(value?.esercizio, value?.uo?.first);
        });

        this.contextService.getUo().subscribe((result: Pair[]) => {
            this.uoPairs = result;
        });
        this.callIndice(this.filterForm.controls['esercizio'].value);
    }

    ngOnDestroy(): void {
        // Pulisci tutti i grafici quando il componente viene distrutto
        this.roots.forEach(root => this.disposeRoot(root));
        this.roots.clear();
    }

    private disposeRoot(root: am5.Root | null): void {
        if (root) {
            root.dispose();
        }
    }

    private initializeRoot(element: ElementRef, currentRoot: am5.Root | null): am5.Root {
        if (currentRoot) {
            currentRoot.dispose();
        }
        return am5.Root.new(element.nativeElement);
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

    createNewEvent(eventName) {
        let event;
        if (typeof(Event) === 'function') {
            event = new Event(eventName);
        } else {
            event = document.createEvent('Event');
            event.initEvent(eventName, true, true);
        }
        return event;
    }

    callIndice(esercizio: number, uo?: string): void {
        this.indiceService.getIndice(esercizio, uo).subscribe((result: Map<string, number>) => {
            // Itera su tutti i possibili grafici (0=esercizio, 1-4=trimestri)
            ['0', '1', '2', '3', '4'].forEach(key => {
                const chartRef = this.chartRefs.get(key);
                
                if (result[key] && chartRef?.nativeElement) {
                    // Crea o ricrea il root e carica il grafico
                    const existingRoot = this.roots.get(key);
                    const newRoot = this.initializeRoot(chartRef, existingRoot);
                    this.roots.set(key, newRoot);
                    this.loadChart(newRoot, result[key]);
                } else {
                    // Disponi il root se esiste ma non ci sono dati
                    const existingRoot = this.roots.get(key);
                    this.disposeRoot(existingRoot);
                    this.roots.set(key, null);
                }
            });
        });
    }

    private loadChart(root: am5.Root, value: number): void {
        console.log('Caricamento grafico con valore:', value);

        root.setThemes([am5themes_Animated.new(root)]);
        root.container.children.clear();
        root.container.set("layout", root.verticalLayout);

        const chartGauge = root.container.children.push(am5radar.RadarChart.new(root, {
            startAngle: 160,
            endAngle: 380
        }));

        const axisRenderer = am5radar.AxisRendererCircular.new(root, {
            innerRadius: -40,
            minGridDistance: 50
        });

        axisRenderer.grid.template.setAll({
            stroke: root.interfaceColors.get("background"),
            visible: true,
            strokeOpacity: 0.8
        });

        axisRenderer.ticks.template.setAll({
            visible: true,
            strokeOpacity: 1,
        });

        axisRenderer.labels.template.setAll({
            fontSize: 15,
            visible: true
        });

        const xAxis = chartGauge.xAxes.push(am5xy.ValueAxis.new(root, {
            maxDeviation: 0,
            min: -30,
            max: 30,
            strictMinMax: false,
            renderer: axisRenderer
        }));

        const axisDataItem = xAxis.makeDataItem({});

        const clockHand = am5radar.ClockHand.new(root, {
            pinRadius: am5.percent(20),
            radius: am5.percent(100),
            bottomWidth: 40
        });

        const bullet = axisDataItem.set("bullet", am5xy.AxisBullet.new(root, {
            sprite: clockHand
        }));

        xAxis.createAxisRange(axisDataItem);

        const label = chartGauge.radarContainer.children.push(am5.Label.new(root, {
            fill: am5.color(0xffffff),
            centerX: am5.percent(50),
            textAlign: "center",
            centerY: am5.percent(50),
            fontSize: "1.2em"
        }));
        if (value > xAxis.get("max")) {
            xAxis.set("max", Math.ceil(value / 10) * 10);
        }
        if (value < xAxis.get("min")) {
            xAxis.set("min", Math.floor(value / 10) * 10);
        }
        axisDataItem.set("value", value);

        bullet.get("sprite").on("rotation", () => {
            const currentValue = axisDataItem.get("value");
            let fill = am5.color(0x000000);

            xAxis.axisRanges.each((axisRange) => {
                if (currentValue >= axisRange.get("value") && currentValue <= axisRange.get("endValue")) {
                    fill = axisRange.get("axisFill").get("fill");
                }
            });

            label.set("text", currentValue.toFixed(2));

            clockHand.pin.animate({
                key: "fill",
                to: fill,
                duration: 500,
                easing: am5.ease.out(am5.ease.cubic)
            });

            clockHand.hand.animate({
                key: "fill",
                to: fill,
                duration: 500,
                easing: am5.ease.out(am5.ease.cubic)
            });
        });

        chartGauge.bulletsContainer.set("mask", undefined);

        // Definizione delle bande colorate
        const bandsData = [
            { color: "#ee1f25", lowScore: 20, highScore: 30 },
            { color: "#f04922", lowScore: 10, highScore: 20 },
            { color: "#fdae19", lowScore: 0, highScore: 10 },
            { color: "#b0d136", lowScore: -10, highScore: 0 },
            { color: "#54b947", lowScore: -20, highScore: -10 },
            { color: "#0f9747", lowScore: -30, highScore: -20 }
        ];

        am5.array.each(bandsData, (data) => {
            const axisRange = xAxis.createAxisRange(xAxis.makeDataItem({}));

            axisRange.setAll({
                value: data.lowScore,
                endValue: data.highScore
            });

            axisRange.get("axisFill").setAll({
                visible: true,
                fill: am5.color(data.color),
                fillOpacity: 0.8
            });
        });
        // Trova i valori min e max dai tuoi bandsData
        const minValue = Math.min(...bandsData.map(b => b.lowScore)); // -30
        const maxValue = Math.max(...bandsData.map(b => b.highScore)); // 30
        if (value > maxValue) {
            const axisRange = xAxis.createAxisRange(xAxis.makeDataItem({}));

            axisRange.setAll({
                value: maxValue,
                endValue: Math.ceil(value / 10) * 10
            });

            axisRange.get("axisFill").setAll({
                visible: true,
                fill: am5.color(0x000000),
                fillOpacity: 0.8
            });
        }
        if (value < minValue) {
            const axisRange = xAxis.createAxisRange(xAxis.makeDataItem({}));

            axisRange.setAll({
                value: Math.floor(value / 10) * 10,
                endValue: minValue
            });

            axisRange.get("axisFill").setAll({
                visible: true,
                fill: am5.color('#007bff'),
                fillOpacity: 0.8
            });
        }
        // Animazione iniziale
        chartGauge.appear(1000, 100);
    }
}