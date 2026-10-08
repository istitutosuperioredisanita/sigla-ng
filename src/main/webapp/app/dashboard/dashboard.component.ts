import { Component, OnDestroy, OnInit, computed, signal } from "@angular/core";
// Adatta i percorsi alla posizione reale del componente dashboard
import { FondiFunzionamentoService } from "./progetti/fondi-funzionamento.service";
import { DatiFondi } from "./progetti/fondi-funzionamento.component";
import { DatiIndice } from "./indice-tempestivita-pagamenti/indice-tempestivita-pagamenti.component";
import { IndiceTempestivitaPagamentiService } from "./indice-tempestivita-pagamenti/indice-tempestivita-pagamenti.service";
import { EventManager } from '../shared/auth/event-manager.service';
import { Subscription } from 'rxjs';

/** Una UO è "sotto soglia" se ha utilizzato meno di questa quota dell'assegnato */
const SOGLIA_UTILIZZO_BASSO = 0.30;

const somma = (righe: any[] | undefined, campo: string): number =>
    (righe ?? []).reduce((acc, r) => acc + (r?.[campo] ?? 0), 0);

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    standalone: false,
    styles:`
        .in-caricamento {
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border-width: 0 !important;
            overflow: hidden;
            visibility: hidden;
        }
        .comparsa { animation: comparsa .8s ease-out; }
            @keyframes comparsa {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: none; }
        }
    `
})
export class DashBoardComponent implements OnInit, OnDestroy {
    constructor(
        private fondiService: FondiFunzionamentoService,
        private indiceService: IndiceTempestivitaPagamentiService,
        private eventManager: EventManager,
    ) {}
    private refreshSub?: Subscription;
    /** Cambia a ogni ricarica: serve a distruggere e ricreare i widget */
    protected chiaveRicarica = signal(0);
    
    ngOnInit(): void {
        this.refreshSub = this.eventManager.subscribe('onRefreshDashboard', () => this.ricarica());
    }

    ngOnDestroy(): void {
        this.refreshSub?.unsubscribe();
    }

    private ricarica(): void {
        // i widget tornano nascosti finché non hanno ricaricato i dati
        this.pronti.set(new Set());
        // i KPI tornano a "…" invece di mostrare i valori del vecchio esercizio
        this.tipoFin.set(undefined);
        this.perUo.set(undefined);
        this.indice.set(undefined);
        this.acquisti.set([]);
        this.acquistiStruttura.set([]);
        this.assegnatoPrec.set(undefined);
        this.indicePrec.set(undefined);
        // forza la ricreazione dei widget
        this.chiaveRicarica.update(k => k + 1);
    }

    protected pronti = signal<ReadonlySet<string>>(new Set());
    protected segnaPronto(chiave: string): void {
        this.pronti.update(s => new Set(s).add(chiave));
    }

    protected readonly oggi = new Date();
    protected readonly sogliaPercentuale = SOGLIA_UTILIZZO_BASSO * 100;

    // ---- dati ricevuti dai widget -------------------------------------------------
    private tipoFin = signal<DatiFondi | undefined>(undefined);
    private perUo = signal<DatiFondi | undefined>(undefined);
    private indice = signal<DatiIndice | undefined>(undefined);
    private acquisti = signal<any[]>([]);
    private acquistiStruttura = signal<any[]>([]);
    // ---- anno precedente (per i delta) -------------------------------------------
    private assegnatoPrec = signal<number | undefined>(undefined);
    private indicePrec = signal<number | null | undefined>(undefined);

    protected onTipoFinanziamento(d: DatiFondi): void {
        this.tipoFin.set(d);
        this.fondiService.getFondi(d.anno - 1, 'tipo-finanziamento').subscribe({
            next: (r: any[]) => this.assegnatoPrec.set(somma(r, 'importoFinanziato')),
            error: () => this.assegnatoPrec.set(undefined)
        });
    }
    protected onUo(d: DatiFondi): void { this.perUo.set(d); }
    protected onAcquisti(d: any[]): void { this.acquisti.set(d ?? []); }
    protected onAcquistiStruttura(d: any[]): void { this.acquistiStruttura.set(d ?? []); }
    protected onIndice(d: DatiIndice): void {
        this.indice.set(d);
        this.indiceService.getIndice(d.esercizio - 1, d.uo).subscribe({
            next: (r: any) => this.indicePrec.set(r?.['0'] ?? null),
            error: () => this.indicePrec.set(undefined)
        });
    }

    // ---- KPI ----------------------------------------------------------------------
    protected esercizio = computed(() => this.tipoFin()?.anno);

    protected assegnato = computed(() => {
        const d = this.tipoFin();
        return d ? somma(d.voci, 'importoFinanziato') : undefined;
    });

    protected utilizzato = computed(() => {
        const d = this.tipoFin();
        return d ? somma(d.voci, 'importoUtilizzato') : undefined;
    });

    /** Utilizzato / assegnato, in punti percentuali */
    protected percUtilizzo = computed(() => {
        const a = this.assegnato(), u = this.utilizzato();
        return a ? (u! / a) * 100 : undefined;
    });

    /** Variazione percentuale dell'assegnato rispetto all'anno precedente */
    protected deltaAssegnato = computed(() => {
        const a = this.assegnato(), p = this.assegnatoPrec();
        return a != null && p ? ((a - p) / p) * 100 : undefined;
    });

    protected indiceCorrente = computed(() => this.indice()?.indice);

    /** Differenza in giorni rispetto all'anno precedente (negativo = più tempestivi) */
    protected deltaIndice = computed(() => {
        const c = this.indiceCorrente(), p = this.indicePrec();
        return c != null && p != null ? c - p : undefined;
    });

    protected uoSottoSoglia = computed(() => {
        const d = this.perUo();
        if (!d) { return undefined; }
        const conFondi = d.voci.filter(v => v.importoFinanziato > 0);
        const sotto = conFondi.filter(v => v.importoUtilizzato / v.importoFinanziato < SOGLIA_UTILIZZO_BASSO).length;
        return { sotto, totale: conFondi.length, cds: d.cds };
    });

    protected pagato = computed(() => {
        const ultimo = this.acquisti().at(-1);
        return ultimo
            ? { esercizio: ultimo.riepilogo_stato_esercizio as string, importo: (ultimo.riepilogo_stato_importo_pagate ?? 0) as number }
            : undefined;
    });

    // ---- formattazione ------------------------------------------------------------
    protected mln(v?: number): string {
        return v == null ? '…' : (v / 1e6).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' M€';
    }
    protected pct(v?: number, decimali = 0): string {
        return v == null ? '…' : v.toLocaleString('it-IT', { minimumFractionDigits: decimali, maximumFractionDigits: decimali }) + '%';
    }
    protected giorni(v?: number | null): string {
        return v == null ? '…' : v.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' gg';
    }
    protected segno(v: number): string { return v > 0 ? '+' : ''; }
}