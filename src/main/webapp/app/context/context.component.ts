import { Component, OnInit, Input, Renderer, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiLanguageService } from 'ng-jhipster';
import { Router } from '@angular/router';
import { ContextService } from './context.service';
import { Principal, UserContext, JhiLanguageHelper} from '../shared';
import { LocalStateStorageService } from '../shared/auth/local-storage.service';
import { Observable } from 'rxjs/Observable';
import { Pair } from './pair.model';
import { WorkspaceService } from '../workspace/workspace.service';
import { Subscription } from 'rxjs/Rx';

@Component({
    selector: 'jhi-context',
    templateUrl: './context.component.html',
    providers: [NgbDropdown],
    styleUrls: ['../layouts/navbar/navbar.css']
})

export class ContextComponent implements OnInit, OnDestroy {
    @Input() isNavbar: boolean;
    @ViewChild('contextDrop') contextDrop;
    onSelectCdsSubscription: Subscription;
    onSelectUoSubscription: Subscription;
    cdsModel: Pair;
    uoModel: Pair;
    cdrModel: Pair;

    constructor(
        public contextService: ContextService,
        public router: Router,
        public principal: Principal,
        private localStateStorageService: LocalStateStorageService,
        private languageService: JhiLanguageService,
        private languageHelper: JhiLanguageHelper,
        private workspaceService: WorkspaceService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.cdsModel = this.contextService.cdsModel;
        this.uoModel = this.contextService.uoModel;
        this.cdrModel = this.contextService.cdrModel;
        this.onSelectCdsSubscription = this.eventManager.subscribe('onSelectCds', (message) => {
            this.cdsModel = message.content;
        });
        this.onSelectUoSubscription = this.eventManager.subscribe('onSelectUo', (message) => {
            this.uoModel = message.content;
        });
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.onSelectCdsSubscription);
        this.eventManager.destroy(this.onSelectUoSubscription);
    }

    filterPair(term: string, pairs: Pair[], type: string): Pair[] {
        if (term === '') {
            if (type === 'cds') {
                this.uoModel = undefined;
                this.cdrModel = undefined;
                return this.contextService.resetCds();
            } else {
                return pairs;
            }
        } else {
            return pairs.filter((v) => new RegExp(term, 'gi').test(v.first) || new RegExp(term, 'gi').test(v.second));
        }
    }

    searchcds = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .map((term) => this.filterPair(term, this.contextService.cdsPairs, 'cds')
        .slice(0, 10));

    searchuo = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .map((term) => this.filterPair(term, this.contextService.uoPairs, 'uo')
        .slice(0, 10));

    searchcdr = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .map((term) => this.filterPair(term, this.contextService.cdrPairs, 'cdr')
        .slice(0, 10));

    formatter = (pair: Pair) => pair.first + ' - ' + pair.second;
    formatterFirst = (pair: Pair) => pair.first;

    onSelectCds = (item: Pair) => {
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
                this.contextService.cdsPairs = cds;
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
        this.contextService
            .saveEsecizio(esercizio)
            .subscribe((identity) => {
                this.principal.authenticate(identity);
                this.contextService.saveWildflyEsercizio(esercizio).subscribe();
                this.localStateStorageService.storeEsercizio(this.principal.getAccount().username, esercizio);
                this.eventManager.broadcast({
                    name: 'onRefreshTree',
                    content: 'reopenView'
                });
            });
    }

    saveContext(refreshTree: boolean): void {
        const userContext = new UserContext(
                this.principal.getAccount().esercizio,
                Pair.getFirst(this.cdsModel),
                Pair.getFirst(this.uoModel),
                Pair.getFirst(this.cdrModel)
            );
        this.contextService
            .saveUserContext(userContext)
            .subscribe((identity) => {
                this.principal.authenticate(identity);
                this.contextService.saveWildflyUserContext(userContext).subscribe();
                this.localStateStorageService.storeUserContext(this.principal.getAccount().username, userContext);
                if (refreshTree) {
                    this.eventManager.broadcast({
                        name: 'onRefreshTree',
                        content: 'reopenView'
                    });
                }
            });
        this.contextService.setCdsModel(this.cdsModel);
        this.contextService.setUoModel(this.uoModel);
        this.contextService.setCdRModel(this.cdrModel);
        this.router.navigate(['/workspace']);
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

    isPreferitiPresent(): boolean {
        return this.contextService.preferiti && this.contextService.preferiti.length > 0;
    }
}
