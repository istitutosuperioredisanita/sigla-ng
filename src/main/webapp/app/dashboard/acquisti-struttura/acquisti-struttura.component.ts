import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Input, signal, ViewEncapsulation } from "@angular/core";
import { ContextService } from "app/context";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { NgbDropdown, NgbModal, NgbTypeaheadConfig } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import { AcquistiStrutturaService } from "./acquisti-struttura.service";

import * as echarts from 'echarts';
import { LocalStateStorageService } from "../../shared/auth/local-storage.service";
import { Principal } from "../../shared/auth/principal.service";


/** Icona Font Awesome 4.7 "file-image-o" (f1c5) come tracciato SVG, per il salva-immagine della toolbox */
const ICONA_IMMAGINE = 'path://M1468 380Q1496 408 1516 456T1536 544V1696Q1536 1736 1508 1764T1440 1792H96Q56 1792 28 1764T0 1696V96Q0 56 28 28T96 0H992Q1032 0 1080 20T1156 68ZM1024 136V512H1400Q1390 483 1378 471L1065 158Q1053 146 1024 136ZM1408 1664V640H992Q952 640 924 612T896 544V128H128V1664H1408ZM1280 1216V1536H256V1344L448 1152 576 1280 960 896ZM448 1024Q368 1024 312 968T256 832 312 696 448 640 584 696 640 832 584 968 448 1024Z';

/** Icona Font Awesome 4.7 "file-excel-o" (f1c3) come tracciato SVG, per la toolbox del grafico */
const ICONA_EXCEL = 'path://M1468 380Q1496 408 1516 456T1536 544V1696Q1536 1736 1508 1764T1440 1792H96Q56 1792 28 1764T0 1696V96Q0 56 28 28T96 0H992Q1032 0 1080 20T1156 68ZM1024 136V512H1400Q1390 483 1378 471L1065 158Q1053 146 1024 136ZM1408 1664V640H992Q952 640 924 612T896 544V128H128V1664H1408ZM429 1430V1536H710V1430H635L738 1269Q743 1262 748 1252.5T755.5 1239 759 1235H761Q762 1239 766 1245 768 1249 770.5 1252.5T776.5 1260.5 783 1269L890 1430H814V1536H1105V1430H1037L845 1157 1040 875H1107V768H828V875H902L799 1034Q795 1041 789 1050.5T780 1064L778 1067H776Q775 1063 771 1057 765 1046 754 1034L648 875H724V768H434V875H502L691 1147 497 1430H429Z';

// Riga "piatta" per ogni UO terminale: usata per il CSV e per la scala colore
interface UoRow {
    key: string;
    description: string;
    cdsKey: string;
    cdsDescription: string;
    totale: number;
    acquisti: number;
    medio: number;
}

// Nodo del sunburst: value = importo totale (determina l'ampiezza dello spicchio)
interface SunburstNode {
    name: string;        // etichetta mostrata (codice)
    key: string;
    fullName: string;
    value: number;
    totale: number;
    acquisti: number;
    medio: number;       // importo medio per acquisto (determina il colore)
    isLeaf: boolean;
    itemStyle: { color: string };
    children?: SunburstNode[];
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

    // Scala colore importo medio: basso -> alto
    private readonly AVG_COLORS = ['#91cc75', '#fac858', '#ee6666'];
    // Colore per i nodi senza acquisti (importo medio non calcolabile)
    private readonly NO_DATA_COLOR = '#cccccc';

    private resizeListener!: () => void;

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected formBuilder: FormBuilder,
        protected contextService: ContextService,
        protected acquistiStrutturaService: AcquistiStrutturaService,
        protected translateService: TranslateService,
        protected modalService: NgbModal,
        private localStateStorageService: LocalStateStorageService,
        private principal: Principal,

    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['dashboard'] !== undefined) {
                this.dashboard = params['dashboard'] === 'true';
            }
            this.principal.getIdentyAccount(false).then((account) => {
                const userContext = this.localStateStorageService.getUserContext(account.username);
                this.initializeComponent(userContext?.esercizio);
            });
        });
    }

    private initializeComponent(esercizio?: number): void {
        this.contextService.getEsercizi().subscribe((esercizi: number[]) => {
            this.esercizi = esercizi;
            this.filterForm = this.formBuilder.group({
                esercizio: new FormControl(esercizio || Math.max(...this.esercizi)),
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
        const chart = echarts.init(this.chartdiv.nativeElement);
        this.chartInstance = chart;

        // Resize automatico — il listener precedente viene rimosso per non accumularne
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
        }
        this.resizeListener = () => chart.resize();
        window.addEventListener('resize', this.resizeListener);

        return chart;
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

    // ------------------------------------------------------------------
    // Preparazione dati
    // ------------------------------------------------------------------

    /** Appiattisce l'albero in una riga per ogni UO terminale (per CSV e scala colore) */
    private collectRows(data: any): UoRow[] {
        const rows: UoRow[] = [];
        const visit = (node: any, cds: any) => {
            const isLeaf = !node.children || node.children.length === 0;
            if (isLeaf) {
                const totale = node.value ?? 0;
                const acquisti = node.secondaryValue ?? 0;
                rows.push({
                    key: node.key || node.name,
                    description: node.description ?? node.name,
                    cdsKey: cds.key || cds.name,
                    cdsDescription: cds.description ?? cds.name,
                    totale,
                    acquisti,
                    medio: acquisti > 0 ? totale / acquisti : 0,
                });
            } else {
                node.children.forEach((c: any) => visit(c, cds));
            }
        };
        (data?.children ?? []).forEach((cds: any) => visit(cds, cds));
        return rows;
    }

    /** Min/max dell'importo medio (solo UO con acquisti) per la scala colore */
    private averageRange(rows: UoRow[]): { min: number; max: number } {
        const avgs = rows.filter(r => r.acquisti > 0).map(r => r.medio);
        return {
            min: avgs.length ? Math.min(...avgs) : 0,
            max: avgs.length ? Math.max(...avgs) : 1,
        };
    }

    private colorForAverage(v: number, acquisti: number, min: number, max: number): string {
        if (acquisti <= 0) {
            return this.NO_DATA_COLOR;
        }
        const t = max > min ? Math.min(1, Math.max(0, (v - min) / (max - min))) : 0;
        return echarts.color.lerp(t, this.AVG_COLORS);
    }

    /**
     * Converte ricorsivamente il nodo del service in nodo sunburst.
     * L'importo medio dei centri di spesa è ponderato: totale / numero acquisti del centro.
     */
    private buildSunburstNode(node: any, min: number, max: number): SunburstNode {
        const totale = node.value ?? 0;
        const acquisti = node.secondaryValue ?? 0;
        const medio = acquisti > 0 ? totale / acquisti : 0;
        const isLeaf = !node.children || node.children.length === 0;

        const result: SunburstNode = {
            name: node.key || node.name,
            key: node.key || node.name,
            fullName: node.name,
            value: totale,
            totale,
            acquisti,
            medio,
            isLeaf,
            itemStyle: { color: this.colorForAverage(medio, acquisti, min, max) },
        };
        if (!isLeaf) {
            result.children = node.children.map((c: any) => this.buildSunburstNode(c, min, max));
        }
        return result;
    }

    // ------------------------------------------------------------------
    // Helper
    // ------------------------------------------------------------------

    private formatEuro(v: number): string {
        return v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    private formatEuroCompact(v: number): string {
        if (v >= 1_000_000) return (v / 1_000_000).toLocaleString('it-IT', { maximumFractionDigits: 1 }) + ' M€';
        if (v >= 1_000) return (v / 1_000).toLocaleString('it-IT', { maximumFractionDigits: 0 }) + ' k€';
        return v.toLocaleString('it-IT', { maximumFractionDigits: 0 }) + ' €';
    }

    /** Legenda grafica della scala colore (gradiente basso -> alto importo medio) */
    private buildColorLegend(min: number, max: number): any {
        const stops = this.AVG_COLORS.map((color, i) => ({
            offset: i / (this.AVG_COLORS.length - 1),
            color
        }));
        return [{
            type: 'group',
            left: 'center',
            top: 8,
            silent: true,
            children: [
                {
                    type: 'text',
                    x: -8,
                    y: 6,
                    style: {
                        text: `Importo medio: ${this.formatEuroCompact(min)}`,
                        textAlign: 'right',
                        textVerticalAlign: 'middle',
                        fontSize: 12,
                        fill: '#333'
                    }
                },
                {
                    type: 'rect',
                    shape: { x: 0, y: 0, width: 180, height: 12 },
                    style: { fill: new echarts.graphic.LinearGradient(0, 0, 1, 0, stops) }
                },
                {
                    type: 'text',
                    x: 188,
                    y: 6,
                    style: {
                        text: this.formatEuroCompact(max),
                        textAlign: 'left',
                        textVerticalAlign: 'middle',
                        fontSize: 12,
                        fill: '#333'
                    }
                }
            ]
        }];
    }

    // ------------------------------------------------------------------
    // Grafico
    // ------------------------------------------------------------------

    /** Sunburst: ampiezza = importo totale, colore = importo medio per acquisto */
    private loadChart(chart: echarts.ECharts, data: any): void {
        const rows = this.collectRows(data);
        const { min, max } = this.averageRange(rows);

        // La radice "Ente" non viene disegnata: i suoi figli sono i nodi di primo livello
        const nodes: SunburstNode[] = (data.children ?? []).map((c: any) => this.buildSunburstNode(c, min, max));

        const esercizio = this.filterForm?.controls?.esercizio?.value;
        const fileName = `acquisti_per_struttura_${esercizio ?? ''}`;

        const option: echarts.EChartsOption = {
            toolbox: {
                feature: {
                    saveAsImage: {
                        title: 'Salva immagine',
                        name: fileName,
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
                        onclick: () => this.exportCsv(rows, fileName)
                    }
                }
            },
            graphic: this.buildColorLegend(min, max),
            tooltip: {
                trigger: 'item',
                textStyle: { align: 'left' },
                formatter: (params: any) => {
                    const d = params.data as SunburstNode;
                    if (!d || d.totale === undefined) return '';
                    return [
                        `<strong>${d.fullName || d.name}</strong>`,
                        `Codice: ${d.key}`,
                        `Valore Totale: ${this.formatEuro(d.totale)}`,
                        `Numero di Acquisti: ${d.acquisti.toLocaleString('it-IT')}`,
                        `Importo Medio: ${d.acquisti > 0 ? this.formatEuro(d.medio) : '-'}`,
                    ].join('<br/>');
                }
            },
            series: [
                {
                    type: 'sunburst',
                    center: ['50%', '55%'],
                    radius: ['8%', '90%'],
                    data: nodes as any,
                    // click su un centro di spesa: zoom sui suoi figli; click al centro: torna indietro
                    nodeClick: 'rootToNode',
                    sort: 'desc',
                    itemStyle: { borderColor: '#fff', borderWidth: 1 },
                    label: {
                        rotate: 'radial',
                        fontSize: 11,
                        color: '#000',
                        minAngle: 4       // nasconde le etichette degli spicchi troppo stretti
                    },
                    levels: [
                        {},
                        // Livello 1: centri di spesa
                        {
                            itemStyle: { borderWidth: 2 },
                            label: { rotate: 'tangential', fontSize: 12, fontWeight: 'bold' }
                        },
                        // Livello 2: unità operative
                        {
                            label: { rotate: 'radial', align: 'right', padding: 3 }
                        }
                    ],
                    emphasis: { focus: 'ancestor' },
                    animationDurationUpdate: 600
                } as any
            ]
        };

        chart.setOption(option, true);

        // Click: apre la modale solo per le UO terminali
        chart.on('click', (params: any) => {
            const d = params.data as SunburstNode;
            if (params.componentType === 'series' && d?.isLeaf) {
                this.openModalStato(d.key);
            }
        });

        // Cursore pointer sulle UO terminali, default sugli altri nodi
        chart.on('mouseover', (params: any) => {
            const d = params.data as SunburstNode;
            (chart as any).getZr().setCursorStyle(d?.isLeaf ? 'pointer' : 'default');
        });

        chart.on('mouseout', () => {
            (chart as any).getZr().setCursorStyle('default');
        });
    }

    // ------------------------------------------------------------------
    // Export CSV
    // ------------------------------------------------------------------

    /** Esporta tutte le UO terminali (con il centro di spesa di appartenenza) */
    private exportCsv(rows: UoRow[], fileName: string): void {
        const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const num = (v: number) => v.toFixed(2).replace('.', ',');

        const header = [
            'Codice Centro di Spesa', 'Centro di Spesa', 'Codice UO', 'Unità Operativa',
            'Numero di Acquisti', 'Valore Totale (€)', 'Importo Medio (€)'
        ];
        const lines: string[] = [header.map(esc).join(';')];

        for (const r of rows) {
            lines.push([
                esc(r.cdsKey), esc(r.cdsDescription),
                esc(r.key), esc(r.description),
                r.acquisti, num(r.totale), num(r.medio)
            ].join(';'));
        }

        // BOM + separatore ";" per l'apertura corretta in Excel italiano
        const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
}