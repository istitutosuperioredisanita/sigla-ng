import { Component, OnInit, Input, Renderer, ElementRef, ViewChild } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiLanguageService } from 'ng-jhipster';
import { Router } from '@angular/router';
import { ContextService } from './context.service';
import { Principal, UserContext, JhiLanguageHelper} from '../shared';
import { LocalStateStorageService } from '../shared/auth/local-storage.service';
import { Observable } from 'rxjs/Observable';
import { Pair } from './pair.model';
import { WorkspaceService } from '../workspace/workspace.service';

@Component({
    selector: 'jhi-context',
    templateUrl: './context.component.html',
    providers: [NgbDropdown],
    styleUrls: ['../layouts/navbar/navbar.css']
})

export class ContextComponent {
    @Input() isNavbar: boolean;
    @ViewChild('contextDrop') contextDrop;

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

    filterPair(term: string, pairs: Pair[], type: string): Pair[] {
        if (term === '') {
            if (type === 'cds') {
                return this.contextService.resetCds();
            } else {
                return pairs;
            }
        } else {
            return pairs.filter(v => new RegExp(term, 'gi').test(v.first) || new RegExp(term, 'gi').test(v.second));
        }
    }

    searchcds = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .map(term => this.filterPair(term, this.contextService.cdsPairs, 'cds')
        .slice(0, 10));

    searchuo = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .map(term => this.filterPair(term, this.contextService.uoPairs, 'uo')
        .slice(0, 10));

    searchcdr = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .map(term => this.filterPair(term, this.contextService.cdrPairs, 'cdr')
        .slice(0, 10));

    formatter = (pair: Pair) => pair.first + ' - ' + pair.second;
    formatterFirst = (pair: Pair) => pair.first;

    onSelectCds = (item: Pair) => {
        this.contextService
            .getUo(item ? item.first : '')
            .subscribe(uo => {
                this.contextService.uoPairs = uo;
                if (uo.length === 1) {
                    this.contextService.uoModel = uo[0];
                    this.onSelectCdr(uo[0]);
                }
            });
    }

    onSelectUo = (item: Pair) => {
        this.contextService
            .getCds(item ? item.first : '')
            .subscribe(cds =>  {
                this.contextService.cdsPairs = cds;
                if (cds.length === 1) {
                    this.contextService.cdsModel = cds[0];
                }
            });
        this.onSelectCdr(item);
    }

    onSelectCdr = (item: Pair) => {
        this.contextService
            .getCdr(item ? item.first : '')
            .subscribe(cdr =>  {
                this.contextService.cdrPairs = cdr;
                this.contextService.cdrModel = cdr[0];
            });
    }

    setEsercizio(esercizio: number): void {
        this.contextService
            .saveEsecizio(esercizio)
            .subscribe(identity => {
                this.principal.authenticate(identity);
                this.contextService.saveWildflyEsercizio(esercizio).subscribe();
                this.localStateStorageService.storeEsercizio(this.principal.getAccount().username, esercizio);
            });
    }

    saveContext(): void {
        let userContext = new UserContext(
                this.principal.getAccount().esercizio,
                Pair.getFirst(this.contextService.cdsModel),
                Pair.getFirst(this.contextService.uoModel),
                Pair.getFirst(this.contextService.cdrModel)
            );
        this.contextService
            .saveUserContext(userContext)
            .subscribe(identity => {
                this.principal.authenticate(identity);
                this.contextService.saveWildflyUserContext(userContext).subscribe();
                this.localStateStorageService.storeUserContext(this.principal.getAccount().username, userContext);
            });
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
