import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ContextService } from "app/context";
import { IndiceTempestivitaPagamentiService } from "./indice-tempestivita-pagamenti.service";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import * as am5 from '@amcharts/amcharts5';
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";

@Component({
    selector: 'indice-tempestivita-pagamenti',
    templateUrl: './indice-tempestivita-pagamenti.component.html',
    standalone: false
})
export class IndiceTempestivitaPagamentiComponent implements OnInit, OnDestroy {
    protected filterForm: FormGroup;

    @ViewChild('chartdivTrimestre1', { static: true }) chartdivTrimestre1: ElementRef;
    @ViewChild('chartdivTrimestre2', { static: true }) chartdivTrimestre2: ElementRef;
    @ViewChild('chartdivTrimestre3', { static: true }) chartdivTrimestre3: ElementRef;
    @ViewChild('chartdivTrimestre4', { static: true }) chartdivTrimestre4: ElementRef;
    @ViewChild('chartdivEsercizio', { static: true }) chartdivEsercizio: ElementRef;
    
    chartDivStyle = 'height:30vh !important';
    
    private roots: Map<string, am5.Root | null> = new Map();
    private chartRefs: Map<string, ElementRef> = new Map();

    constructor(
        protected formBuilder: FormBuilder,
        protected contextService: ContextService,
        protected indiceService: IndiceTempestivitaPagamentiService,
        protected translateService: TranslateService
    ) {}

    ngOnInit(): void {
        // Inizializza la mappa dei riferimenti ai chart
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
            this.callIndice(value.esercizio, value.uo);
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
            strictMinMax: true,
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
            fontSize: "1.5em"
        }));

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

        // Animazione iniziale
        chartGauge.appear(1000, 100);
    }
}