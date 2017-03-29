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
    providers: [ContextService, LocalStateStorageService, NgbDropdown]
})
export class ContextComponent implements OnInit {
    @Input() isNavbar: boolean;
    esercizi: number[];
    cdsPairs: Pair[];
    uoPairs: Pair[];
    cdrPairs: Pair[];
    cdsModel: Pair;
    uoModel: Pair;
    cdrModel: Pair;

    constructor(
        private contextService: ContextService,
        public principal: Principal,
        private localStateStorageService: LocalStateStorageService,
        private languageService: JhiLanguageService,
        private languageHelper: JhiLanguageHelper
    ) {
        this.languageService.setLocations(['settings', 'home', 'login']);
    }

    searchcds = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .map(term => term === '' ? []
            : this.cdsPairs.filter(v => new RegExp(term, 'gi').test(v.first) || new RegExp(term, 'gi').test(v.second))
        .slice(0, 10));

    searchuo = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .map(term => term === '' ? []
            : this.uoPairs.filter(v => new RegExp(term, 'gi').test(v.first) || new RegExp(term, 'gi').test(v.second))
        .slice(0, 10));

    formatter = (pair: Pair) => pair.first + ' - ' + pair.second;
    formatterFirst = (pair: Pair) => pair.first;

    onSelectCds = (item: Pair) => {
        this.contextService
            .getUo(item ? item.first : '')
            .subscribe(uo => {
                this.uoPairs = uo;
                if (uo.length === 1) {
                    this.uoModel = uo[0];
                }
            });
    }
    onSelectUo = (item: Pair) => {
        this.contextService
            .getCds(item ? item.first : '')
            .subscribe(cds =>  {
                this.cdsPairs = cds;
                if (cds.length === 1) {
                    this.cdsModel = cds[0];
                }
            });
    }

    ngOnInit(): void {
        this.contextService
            .getEsercizi()
            .subscribe(esercizi => this.esercizi = esercizi);
        this.contextService
            .saveUserContext(this.localStateStorageService.getUserContext())
            .subscribe(identity => this.principal.authenticate(identity));

        this.contextService
            .getCds(this.principal.getAccount().uo)
            .subscribe(cds => {
                let that = this;
                this.cdsPairs = cds;
                this.cdsModel = cds.filter(function(v) {
                    return v.first === that.principal.getAccount().cds;
                })[0];
            });
        this.contextService
            .getUo(this.principal.getAccount().cds)
            .subscribe(uo => {
                let that = this;
                this.uoPairs = uo;
                this.uoModel = uo.filter(function(v) {
                    return v.first === that.principal.getAccount().uo;
                })[0];
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
                this.cdsModel.first,
                this.uoModel.first,
                this.principal.getAccount().cdr
            );
        this.contextService
            .saveUserContext(userContext)
            .subscribe(identity => this.principal.authenticate(identity));
       this.localStateStorageService.storeUserContext(userContext);
   }

}
