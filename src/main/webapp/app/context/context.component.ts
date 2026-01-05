import { Component, OnInit, Input, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { NgbDropdown, NgbModalRef, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import { EventManager } from '../shared/auth/event-manager.service';
import { Router } from '@angular/router';
import { ContextService } from './context.service';
import { Principal, UserContext, MessaggiModalService, Account} from '../shared';
import { LocalStateStorageService } from '../shared/auth/local-storage.service';
import { Observable ,  Subscription } from 'rxjs';
import { Pair } from './pair.model';
import { map, debounceTime } from 'rxjs/operators';

@Component({
    selector: 'jhi-context',
    templateUrl: './context.component.html',
    providers: [NgbDropdown, NgbTypeaheadConfig],
    standalone: false
})

export class ContextComponent implements OnInit, OnDestroy {
    @Input() isNavbar: boolean;
    @ViewChild('contextDrop', {static : true}) contextDrop;

    @ViewChild('cds', {static : false}) cdsInput: ElementRef;
    @ViewChild('uo', {static : false}) uoInput: ElementRef;
    @ViewChild('cdr', {static : false}) cdrInput: ElementRef;

    onSelectCdsSubscription: Subscription;
    onSelectUoSubscription: Subscription;
    onSelectCdrSubscription: Subscription;
    cdsModel: Pair;
    uoModel: Pair;
    cdrModel: Pair;
    modalRef: NgbModalRef;
    typeaheadContainer = 'body';

    constructor(
        public contextService: ContextService,
        public router: Router,
        public principal: Principal,
        private localStateStorageService: LocalStateStorageService,
        private eventManager: EventManager,
        private messaggiModalService: MessaggiModalService
    ) {
    }

    ngOnInit() {
        this.cdsModel = this.contextService.cdsModel;
        this.uoModel = this.contextService.uoModel;
        this.cdrModel = this.contextService.cdrModel;
        this.onSelectCdsSubscription = this.eventManager.subscribe('onSelectCds', (message) => {
            this.cdsModel = message;
        });
        this.onSelectUoSubscription = this.eventManager.subscribe('onSelectUo', (message) => {
            this.uoModel = message;
        });
        this.onSelectCdrSubscription = this.eventManager.subscribe('onSelectCdr', (message) => {
            this.cdrModel = message;
        });
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.onSelectCdsSubscription);
        this.eventManager.destroy(this.onSelectUoSubscription);
        this.eventManager.destroy(this.onSelectCdrSubscription);
    }

    filterPair(term: string, pairs: Pair[], type: string): Pair[] {
        if (term === '') {
            if (type === 'cds') {
                this.uoModel = undefined;
                this.cdrModel = undefined;
                this.contextService.findUo();
            }
            return pairs;
        } else {
            return pairs.filter((v) => new RegExp(term, 'gi').test(v.first + ' - ' + v.second));
        }
    }

    searchcds = (text$: Observable<string>) =>
        text$
        .pipe(debounceTime(200))
        .pipe(map((term: string) => this.filterPair(term, this.contextService.cdsPairs, 'cds')
        .slice(0, 200)));

    searchuo = (text$: Observable<string>) =>
        text$
        .pipe(debounceTime(200))
        .pipe(map((term: string) => this.filterPair(term, this.contextService.uoPairs, 'uo')
        .slice(0, 200)));

    searchcdr = (text$: Observable<string>) =>
        text$
        .pipe(debounceTime(200))
        .pipe(map((term: string) => this.filterPair(term, this.contextService.cdrPairs, 'cdr')
        .slice(0, 200)));

    formatter = (pair: Pair) => pair.first + ' - ' + pair.second;
    formatterFirst = (pair: Pair) => pair.first;

    onSelectCds = (item: Pair) => {
        this.uoModel = undefined;
        this.contextService
            .getUo(item ? item.first : '')
            .subscribe((uo) => {
                this.contextService.uoPairs = uo;
                this.uoModel = uo[0];
                this.onSelectCdr(uo[0]);
            });
    }

    onSelectUo = (item: Pair) => {
        this.contextService
            .getCds(item ? item.first : '')
            .subscribe((cds) =>  {
                if (cds.length === 1) {
                    this.cdsModel = cds[0];
                }
            });
        this.onSelectCdr(item);
    }

    onSelectCdr = (item: Pair) => {
        this.contextService
            .getCdr(item ? item.first : '')
            .subscribe((cdr) =>  {
                this.contextService.cdrPairs = cdr;
                this.cdrModel = cdr[0];
            });
    }

    setEsercizio(esercizio: number): void {
        const userContext = new UserContext(
            esercizio,
            Pair.getFirst(this.cdsModel),
            Pair.getFirst(this.uoModel),
            Pair.getFirst(this.cdrModel)
        );
        this.contextService.saveWildflyUserContext(userContext).subscribe(() => {
            this.principal.getAccount().setEsercizio(esercizio);
            this.localStateStorageService.storeEsercizio(this.principal.getAccount().username, esercizio);
            this.eventManager.broadcast({
                name: 'onRefreshTree',
                content: 'reopenView'
            });
            this.eventManager.broadcast('onRefreshTodo');
        });
    }

    resetContext(): void {
        this.cdsModel = this.contextService.cdsModel;
        this.uoModel = this.contextService.uoModel;
        this.cdrModel = this.contextService.cdrModel;
    }

    saveContext(refreshTree: boolean): void {
        const userContext = new UserContext(
                this.principal.getAccount().esercizio,
                Pair.getFirst(this.cdsModel),
                Pair.getFirst(this.uoModel),
                Pair.getFirst(this.cdrModel)
            );
        this.contextService.saveWildflyUserContext(userContext).subscribe(() => {
            this.localStateStorageService.storeUserContext(this.principal.getAccount().username, userContext);
            if (refreshTree) {
                this.eventManager.broadcast({
                    name: 'onRefreshTree',
                    content: 'reopenView'
                });
            }
            this.contextService.findEsercizi(this.cdsModel ? this.cdsModel.first : undefined);
            this.eventManager.broadcast('onRefreshTodo');
            this.contextService.setCdsModel(this.cdsModel);
            this.contextService.setUoModel(this.uoModel);
            this.contextService.setCdRModel(this.cdrModel);
            this.router.navigate(['/workspace']);
        });
    }

    getCodiceCdS(): string {
        return Pair.getFirst(this.contextService.cdsModel);
    }

    getCodiceUo(): string {
        return Pair.getFirst(this.contextService.uoModel);
    }

    openPreferiti(cdNodo: string) {
        this.eventManager.broadcast({
            name: 'onPreferitiSelected',
            content: cdNodo
        });
    }

    refreshPreferiti() {
        this.contextService.findPreferiti();
    }

    isPreferitiPresent(): boolean {
        return this.contextService.preferiti && this.contextService.preferiti.length > 0;
    }

    isMessaggiPresent(): boolean {
        return this.contextService.messaggi && this.contextService.messaggi.length > 0;
    }

    openMessaggi() {
        this.modalRef = this.messaggiModalService.open('navbar', this.contextService.messaggi);
    }

    getNumberOfMessagi(): number {
        return this.contextService.messaggi.length;
    }

    openTypeaheadCds() {
        this.cdsModel = undefined;
        this.cdsInput.nativeElement.value = '';
        this.cdsInput.nativeElement.dispatchEvent(this.createNewEvent('input'));
    }

    openTypeaheadUo() {
        this.uoModel = undefined;
        this.uoInput.nativeElement.value = '';
        this.uoInput.nativeElement.dispatchEvent(this.createNewEvent('input'));
    }

    openTypeaheadCdr() {
        this.cdrModel = undefined;
        this.cdrInput.nativeElement.value = '';
        this.cdrInput.nativeElement.dispatchEvent(this.createNewEvent('input'));
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
}
