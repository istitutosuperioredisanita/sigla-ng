import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Input, signal, ViewEncapsulation } from "@angular/core";
import { ContextService } from "app/context";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { NgbDropdown, NgbModal, NgbTypeaheadConfig } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import { AcquistiStrutturaService } from "./acquisti-struttura.service";

import * as echarts from 'echarts';

// Struttura interna per nodi e link del grafo
interface GraphNode {
    id: string;
    name: string;
    fullName: string;
    value: number;
    secondaryValue: number;
    symbolSize: number;
    isLeaf: boolean;
    itemStyle: { color: string; borderColor: string; borderWidth: number };
    label: { show: boolean; fontSize: number; color: string };
}

interface GraphLink {
    source: string;
    target: string;
}

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

    protected filterForm!: FormGroup;

    @ViewChild('chartdiv', { static: true }) chartdiv!: ElementRef;
    @ViewChild('modalStato', { static: true }) modalStato!: ElementRef;

    chartInstance: echarts.ECharts | null = null;
    chartDivStyle = "height:75vh !important";
    esercizi!: number[];
    loadingChart = signal(false);
    selectedCodiceUo!: string;

    private resizeListener!: () => void;

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
        this.route.queryParams.subscribe(params => {
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
        if (this.chartInstance) {
            this.chartInstance.dispose();
            this.chartInstance = null;
        }
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
        }
    }

    private initializeChart(): echarts.ECharts {
        if (this.chartInstance) {
            this.chartInstance.dispose();
        }
        this.chartInstance = echarts.init(this.chartdiv.nativeElement);
        return this.chartInstance;
    }

    callStruttura(esercizio: number): void {
        setTimeout(() => {
            this.loadingChart.set(true);
        }, 0);
        this.acquistiStrutturaService.getIndice(esercizio).subscribe((result: any) => {
            const chart = this.initializeChart();
            this.loadChart(chart, result);
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

    /**
     * Visita l'albero e raccoglie tutti i valori per calcolare min/max
     * prima di costruire i nodi (necessario per normalizzare i raggi).
     */
    private collectAllValues(node: any, values: number[]): void {
        if (node.value != null && node.value > 0) {
            values.push(node.value);
        }
        if (node.children) {
            node.children.forEach((child: any) => this.collectAllValues(child, values));
        }
    }

    private flattenToGraph(
        node: any,
        nodes: GraphNode[],
        links: GraphLink[],
        minVal: number,
        maxVal: number,
        minRadius: number,
        maxRadius: number
    ): void {
        const isLeaf = !node.children || node.children.length === 0;
        const id = node.key || node.name;
        const v = node.value ?? 0;

        // Calcolo raggio proporzionale al valore
        let size: number;
        if (maxVal === minVal || v <= 0) {
            size = (minRadius + maxRadius) / 2;
        } else {
            size = minRadius + ((v - minVal) / (maxVal - minVal)) * (maxRadius - minRadius);
        }

        nodes.push({
            id,
            name: id,
            fullName: node.name,
            value: v,
            secondaryValue: node.secondaryValue ?? 0,
            symbolSize: size,
            isLeaf,
            itemStyle: isLeaf
                ? { color: '#5470c6', borderColor: '#fff', borderWidth: 2 }
                : { color: '#91cc75', borderColor: '#fff', borderWidth: 2 },
            label: {
                show: true,
                fontSize: 12,
                color: '#000',
            },
        });

        if (!isLeaf) {
            for (const child of node.children) {
                const childId = child.key || child.name;
                links.push({ source: id, target: childId });
                this.flattenToGraph(child, nodes, links, minVal, maxVal, minRadius, maxRadius);
            }
        }
    }

    private loadChart(chart: echarts.ECharts, data: any): void {
        console.log('Caricamento grafico ECharts force-directed con valore:', data);

        // Prima passata: calcola min/max per normalizzare i raggi
        const allValues: number[] = [];
        this.collectAllValues(data, allValues);
        const minVal = allValues.length ? Math.min(...allValues) : 0;
        const maxVal = allValues.length ? Math.max(...allValues) : 1;
        const minRadius = 5;
        const maxRadius = 230;

        // Seconda passata: costruisce nodi e link
        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];
        this.flattenToGraph(data, nodes, links, minVal, maxVal, minRadius, maxRadius);

        const option: echarts.EChartsOption = {
            toolbox: {
                feature: {
                    saveAsImage: {
                    title: 'Salva immagine',
                    name: `acquisti_per_struttura`
                    }
                }
            },
            tooltip: {
                trigger: 'item',
                axisPointer: { type: 'shadow' },
                textStyle: { align: 'left' },
                formatter: (params: any) => {
                    if (params.dataType === 'edge') return '';
                    const d = params.data as GraphNode;
                    return [
                        `<strong>${d.fullName || d.name}</strong>`,
                        `Codice: ${d.name}`,
                        `Numero di Acquisti: ${d.secondaryValue ?? '-'}`,
                        `Valore Totale: ${d.value != null ? d.value.toLocaleString('it-IT') + ' €' : '-'}`,
                    ].join('<br/>');
                }
            },
            legend: [{
                data: [
                    { name: 'Centro Di Spesa', icon: 'circle', itemStyle: { color: '#91cc75' } },
                    { name: 'Unità Operativa', icon: 'circle', itemStyle: { color: '#5470c6' } },
                ],
                top: 10,
                right: 35,
                textStyle: { fontSize: 12 }
            }],
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    data: nodes.map(n => ({
                        ...n,
                        // La categoria guida la voce di legenda
                        category: n.isLeaf ? 1 : 0,
                    })),
                    links,
                    categories: [
                        { name: 'Centro Di Spesa' },
                        { name: 'Unità Operativa' },
                    ],
                    roam: true,           // pan + zoom con mouse/touch
                    draggable: true,      // nodi trascinabili
                    label: {
                        show: true,
                        position: 'right',
                        formatter: '{b}',
                        fontSize: 11,
                    },
                    force: {
                        repulsion: 300,        // forza di repulsione tra nodi (≈ manyBodyStrength)
                        gravity: 0.1,          // attrazione verso il centro (≈ centerStrength)
                        edgeLength: [80, 200], // lunghezza minima e massima dei link
                        layoutAnimation: true,
                    },
                    lineStyle: {
                        color: 'source',
                        curveness: 0.1,
                        opacity: 0.6,
                        width: 1.5,
                    },
                    emphasis: {
                        focus: 'adjacency',   // evidenzia nodo + vicini al mouseover
                        lineStyle: { width: 3 },
                    },
                    animationDuration: 1000,
                    animationEasingUpdate: 'quinticInOut',
                }
            ]
        };

        chart.setOption(option);

        // Click: apre modale solo per nodi foglia (UO terminali)
        chart.on('click', (params: any) => {
            if (params.dataType !== 'node') return;
            const nodeData = params.data as GraphNode;
            if (nodeData.isLeaf) {
                console.log('Nodo terminale cliccato:', nodeData);
                this.openModalStato(nodeData.name);
            }
        });

        // Cursore pointer sui nodi foglia, default sugli altri
        chart.on('mouseover', (params: any) => {
            if (params.dataType !== 'node') return;
            const nodeData = params.data as GraphNode;
            (chart as any).getZr().setCursorStyle(nodeData.isLeaf ? 'pointer' : 'default');
        });

        chart.on('mouseout', () => {
            (chart as any).getZr().setCursorStyle('default');
        });

        // Resize automatico — listener salvato per poterlo rimuovere in ngOnDestroy
        this.resizeListener = () => chart.resize();
        window.addEventListener('resize', this.resizeListener);
    }
}