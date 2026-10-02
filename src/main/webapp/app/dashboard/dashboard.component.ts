import { Component, OnInit, signal } from "@angular/core";

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
export class DashBoardComponent implements OnInit {
    ngOnInit(): void {}
    protected pronti = signal<ReadonlySet<string>>(new Set());
    protected segnaPronto(chiave: string): void {
    this.pronti.update(s => new Set(s).add(chiave));
    }
}