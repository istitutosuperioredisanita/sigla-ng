import { Component, OnInit, Input, Renderer, ElementRef } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { JhiLanguageService } from 'ng-jhipster';
import { Router } from '@angular/router';
import { ContextService } from './context.service';
import { Principal, UserContext, JhiLanguageHelper} from '../shared';
import { LocalStateStorageService } from '../shared/auth/local-storage.service';
import { Observable } from 'rxjs/Observable';
import { Pair } from './pair.model';

@Component({
    selector: 'jhi-context',
    templateUrl: './context.component.html',
    providers: [NgbDropdown],
    styleUrls: ['../layouts/navbar/navbar.css']
})

export class ContextComponent {
    @Input() isNavbar: boolean;

    constructor(
        public contextService: ContextService,
        private router: Router,
        public principal: Principal,
        private localStateStorageService: LocalStateStorageService,
        private languageService: JhiLanguageService,
        private languageHelper: JhiLanguageHelper
    ) {
        this.languageService.setLocations(['settings', 'home', 'login']);
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
        this.contextService
            .getCdr(item ? item.first : '')
            .subscribe(cdr =>  {
                this.contextService.cdrPairs = cdr;
                if (cdr.length === 1) {
                    this.contextService.cdrModel = cdr[0];
                }
            });
    }

    setEsercizio(esercizio: number): void {
        this.contextService
            .saveEsecizio(esercizio)
            .subscribe(identity => this.principal.authenticate(identity));
        this.localStateStorageService.storeEsercizio(esercizio);
    }

    saveContext(): void {
        let userContext = new UserContext(
                this.principal.getAccount().esercizio,
                this.contextService.cdsModel.first,
                this.contextService.uoModel.first,
                this.contextService.cdrModel.first
            );
        this.contextService
            .saveUserContext(userContext)
            .subscribe(identity => this.principal.authenticate(identity));
        this.localStateStorageService.storeUserContext(userContext);
        this.router.navigate(['workspace']);
    }

    getCodiceCdS(): string {
        return this.contextService.cdsModel !== undefined ? this.contextService.cdsModel.first : '';
    }

    getCodiceUo(): string {
        return this.contextService.uoModel !== undefined ? this.contextService.uoModel.first : '';
    }

}
