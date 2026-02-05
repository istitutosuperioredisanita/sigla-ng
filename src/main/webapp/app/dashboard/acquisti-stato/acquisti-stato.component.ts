import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Input, signal } from "@angular/core";
import { ContextService } from "app/context";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { NgbDropdown, NgbTypeaheadConfig, NgbTypeaheadSelectItemEvent } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import { AcquistiStatoService } from "./acquisti-stato.service";
import { Observable, Subject } from 'rxjs';
import { map, debounceTime, takeUntil} from 'rxjs/operators';
import { Pair } from "../../context/pair.model";

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5locales_it_IT from "@amcharts/amcharts5/locales/it_IT";

@Component({
    selector: 'acquisti-stato',
    templateUrl: './acquisti-stato.component.html',
    providers: [NgbDropdown, NgbTypeaheadConfig],
    standalone: false
})
export class AcquistiStatoComponent implements OnInit, OnDestroy {
    @Input() dashboard: boolean = false;
    @Input() codiceUo: string;

    protected filterForm: FormGroup;

    @ViewChild('chartdiv', { static: true }) chartdiv: ElementRef;    
    root: am5.Root;
    esercizi: number[];
    loadingChart = signal(false);
    private lastValue: any = null;
    private destroy$ = new Subject<void>();
    protected uoPairs: Pair[];
    @ViewChild('codice', {static : false}) codiceInput: ElementRef;

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected contextService: ContextService,
        protected acquistiStatoService: AcquistiStatoService,
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
        this.filterForm = this.formBuilder.group({
            codice: new FormControl(this.codiceUo),
        });
        // Monitora i cambiamenti del campo 'uo'
        this.filterForm.controls.codice?.valueChanges
            .pipe(
                debounceTime(300),
                takeUntil(this.destroy$)
            )
            .subscribe(value => {
                // Se il valore è vuoto/null e prima c'era qualcosa
                if (!value && this.lastValue) {
                    this.callStato();
                }
                this.lastValue = value;
            });
        this.contextService.getUo().subscribe((result: Pair[]) => {
            this.uoPairs = result;
        });
        this.callStato(this.codiceUo || this.filterForm.controls.codice.value);
    }

    ngOnDestroy(): void {
        if (this.root) {
            this.root.dispose();
        }
    }

    onUoSelected(event: NgbTypeaheadSelectItemEvent) {  
        this.callStato(event?.item?.first);
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
        this.codiceInput.nativeElement.value = '';
        this.codiceInput.nativeElement.dispatchEvent(this.createNewEvent('input'));
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

    private initializeRoot(): am5.Root {
        if (this.root) {
            this.root.dispose();
        }
        this.root = am5.Root.new(this.chartdiv.nativeElement); 
        return this.root;
    }

    callStato(codice?: string): void {
        setTimeout(() => {
            this.root?.container?.children?.clear();
            this.loadingChart.set(true);
        }, 0);
        this.acquistiStatoService.getIndice(codice).subscribe((result: any[]) => {
            this.loadChart(this.initializeRoot(), result?.slice(-4));
            setTimeout(() => {
                this.loadingChart.set(false);
            }, 0);
        });
    }

    
    private loadChart(root: am5.Root, chartData: any): void {
        console.log('Caricamento grafico con valore:', chartData);
        // Converti gli esercizi in stringhe
        let data = chartData.map(item => ({
            ...item,
            riepilogo_stato_esercizio: String(item.riepilogo_stato_esercizio)
        }));

        root.setThemes([
            am5themes_Animated.new(root)
        ]);
        root.locale = am5locales_it_IT;

        let chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            paddingLeft: 0,
            wheelX: "panX",
            wheelY: "zoomX",
            layout: root.verticalLayout
        }));

        let legend = chart.children.push(
            am5.Legend.new(root, {
                centerX: am5.p50,
                x: am5.p50
            })
        );

        let xRenderer = am5xy.AxisRendererX.new(root, {
            cellStartLocation: 0.1,
            cellEndLocation: 0.9,
            minorGridEnabled: true
        })

        // Per l'asse X (anni) - rimuovi il separatore delle migliaia
        let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
            categoryField: "riepilogo_stato_esercizio",
            renderer: xRenderer,
            tooltip: am5.Tooltip.new(root, {})
        }));

        xRenderer.labels.template.setAll({
            text: "{category}"  // Mostra la categoria come stringa semplice
        });

        xAxis.data.setAll(data);

        let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererY.new(root, {
                strokeOpacity: 0.1
            }),
            numberFormat: "#,###€"  // Formatta con separatore migliaia e simbolo €
        }));

        function makeSeries(name, fieldName, countFieldName) {
            let series = chart.series.push(am5xy.ColumnSeries.new(root, {
                name: name,
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: fieldName,
                categoryXField: "riepilogo_stato_esercizio"
            }));

            series.columns.template.setAll({
                tooltipText: "N. {" + countFieldName + "}" + " {name} per un Totale di {valueY}€",
                width: am5.percent(90),
                tooltipY: 0,
                strokeOpacity: 0
            });

            series.data.setAll(data);
            series.appear();

            series.bullets.push(function () {
                return am5.Bullet.new(root, {
                    locationY: 0,
                    sprite: am5.Label.new(root, {
                        text: "{valueY}€",
                        fill: root.interfaceColors.get("alternativeText"),
                        centerY: 0,
                        centerX: am5.p50,
                        populateText: true
                    })
                });
            });

            legend.data.push(series);
        }

        makeSeries("RICEVUTE", "riepilogo_stato_importo_ricevute", "riepilogo_stato_num_ricevute");
        makeSeries("REGISTRATE", "riepilogo_stato_importo_registrate", "riepilogo_stato_num_registrate");
        makeSeries("PAGATE", "riepilogo_stato_importo_pagate", "riepilogo_stato_num_pagate");

        chart.appear(1000, 100);

    }
}
