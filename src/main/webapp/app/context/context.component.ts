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
    providers: [LocalStateStorageService, NgbDropdown],
    styles: [
        '.navbar-typeahead span {vertical-align:top; display: inline-block;}',
        '.navbar-typeahead .text-truncate {padding: 0 5px; max-width: 220px}',
        '.nav-link, .navbar-text {color: #FFF !important}'
        ]
})

export class ContextComponent implements OnInit {
    @Input() isNavbar: boolean;

    constructor(
        public contextService: ContextService,
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
            : this.contextService.cdsPairs.filter(v => new RegExp(term, 'gi').test(v.first) || new RegExp(term, 'gi').test(v.second))
        .slice(0, 10));

    searchuo = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .map(term => term === '' ? []
            : this.contextService.uoPairs.filter(v => new RegExp(term, 'gi').test(v.first) || new RegExp(term, 'gi').test(v.second))
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
    }

    ngOnInit(): void {
        this.contextService
            .saveUserContext(this.localStateStorageService.getUserContext())
            .subscribe(identity => this.principal.authenticate(identity));
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
                this.principal.getAccount().cdr
            );
        this.contextService
            .saveUserContext(userContext)
            .subscribe(identity => this.principal.authenticate(identity));
       this.localStateStorageService.storeUserContext(userContext);
   }

}
