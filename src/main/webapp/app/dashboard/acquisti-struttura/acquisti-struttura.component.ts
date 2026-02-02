import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Input, signal, ViewEncapsulation } from "@angular/core";
import { ContextService } from "app/context";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { NgbDropdown, NgbModal, NgbTypeaheadConfig } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import { AcquistiStrutturaService } from "./acquisti-struttura.service";

import * as am5 from '@amcharts/amcharts5';
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5locales_it_IT from "@amcharts/amcharts5/locales/it_IT";

@Component({
    selector: 'acquisti-struttura',
    templateUrl: './acquisti-struttura.component.html',
    providers: [NgbDropdown, NgbTypeaheadConfig],
    encapsulation: ViewEncapsulation.None,
    standalone: false,
    styles: `
        .modal-backdrop {
            z-index: 1039 !important;
        }

        .modal {
            z-index: 1040 !important;
        }
    `
})
export class AcquistiStrutturaComponent implements OnInit, OnDestroy {
    @Input() dashboard: boolean = false;

    protected filterForm: FormGroup;

    @ViewChild('chartdiv', { static: true }) chartdiv: ElementRef;    
    @ViewChild('modalStato', { static: true }) modalStato: ElementRef;

    root: am5.Root;
    chartDivStyle = "height:75vh !important";
    esercizi: number[];
    loadingChart = signal(false);
    selectedCodiceUo: string; // Per passare il codice alla modale

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected contextService: ContextService,
        protected acquistiStrutturaService: AcquistiStrutturaService,
        protected translateService: TranslateService,
        protected modalService: NgbModal 
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
        this.contextService.getEsercizi().subscribe((esercizi: number[]) => {
            this.esercizi = esercizi;
            this.filterForm = this.formBuilder.group({
                esercizio: new FormControl(Math.max(...this.esercizi)),
            });
            this.filterForm.controls.esercizio.valueChanges.subscribe((esercizio: any) => {
                this.callStruttura(esercizio);
            });
            this.callStruttura(this.filterForm.controls.esercizio.value);

        });
    }

    ngOnDestroy(): void {
        if (this.root) {
            this.root.dispose();
        }
    }

    private initializeRoot(): am5.Root {
        if (this.root) {
            this.root.dispose();
        }
        this.root = am5.Root.new(this.chartdiv.nativeElement); 
        return this.root;
    }

    callStruttura(esercizio: number): void {
        setTimeout(() => {
            this.root?.container?.children?.clear();
            this.loadingChart.set(true);
        }, 0);
        this.acquistiStrutturaService.getIndice(esercizio).subscribe((result: any) => {
            this.loadChart(this.initializeRoot(), result);
            setTimeout(() => {
                this.loadingChart.set(false);
            }, 0);
        });
    }

    openModalStato(codiceUo: string): void {
        this.selectedCodiceUo = codiceUo;
        this.modalService.open(this.modalStato, { 
            size: 'xl',
            centered: true, 
            backdrop: 'static',
            windowClass: 'modal-lower-zindex'
        });
    }

    private loadChart(root: am5.Root, data: any): void {
        console.log('Caricamento grafico con valore:', data);
        // Imposta zoom iniziale
        root.container.set("scale", 2); // 1.5x zoom
        root.locale = am5locales_it_IT;
        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        let container = root.container.children.push(am5.Container.new(root, {
            width: am5.percent(100),
            height: am5.percent(100),
            layout: root.verticalLayout
        }));

        let series = container.children.push(am5hierarchy.ForceDirected.new(root, {
            singleBranchOnly: false,
            downDepth: 2,
            topDepth: 0,
            initialDepth: 2,
            valueField: "value",
            categoryField: "name",
            childDataField: "children",
            idField: "name",
            linkWithField: "linkWith",
            manyBodyStrength: -10,
            centerStrength: 0.8,
            minRadius: 10,   // dimensione minima dei nodi
        }));

        series.nodes.template.events.on("click", (ev) => {
            const dataItem = ev.target.dataItem;
            const nodeData: any = dataItem.dataContext;
            
            // Verifica se è un nodo terminale
            if (!nodeData.children || nodeData.children.length === 0) {
                console.log("Nodo terminale cliccato:", nodeData);
                // Apri la modale passando il codice (key)
                this.openModalStato(nodeData.key);
            }
        });
        
        series.nodes.template.adapters.add("cursorOverStyle", function(cursor, target) {
            const dataItem = target.dataItem;
            if (dataItem && dataItem.dataContext) {
                const nodeData: any = dataItem.dataContext;
                if (!nodeData.children || nodeData.children.length === 0) {
                return "pointer";
                }
            }
            return "default";
        });        

        // Configurazione della label per mostrare il codice
        series.labels.template.setAll({
            text: "{key}",
            fontSize: 12,
            fill: am5.color(0xffffff)
        });

        series.get("colors").setAll({
            step: 2
        });
        
        series.links.template.set("strength", 0.5);
        series.data.setAll([data]);
        series.set("selectedDataItem", series.dataItems[0]);

        series.events.once("datavalidated", () => {
            // Attendi che il layout sia completato
            setTimeout(() => {
                const zoomLevel = 2;
                root.container.setAll({
                    scale: zoomLevel,
                    x: root.container.width() * (1 - zoomLevel) / 2,
                    y: root.container.height() * (1 - zoomLevel) / 2
                });
            }, 100);
        });
        series.appear(1000, 100);
    }
}