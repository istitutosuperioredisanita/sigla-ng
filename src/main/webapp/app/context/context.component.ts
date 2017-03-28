import { Component, OnInit, Input, Renderer, ElementRef } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { JhiLanguageService } from 'ng-jhipster';
import { Router } from '@angular/router';
import { ContextService } from './context.service';
import { Principal, UserContext, JhiLanguageHelper} from '../shared';
import { LocalStateStorageService } from '../shared/auth/local-storage.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'jhi-context',
    templateUrl: './context.component.html',
    providers: [ContextService, LocalStateStorageService, NgbDropdown]
})
export class ContextComponent implements OnInit {
    @Input() isNavbar: boolean;
    private esercizi: number[];

    constructor(
        private contextService: ContextService,
        private principal: Principal,
        private localStateStorageService: LocalStateStorageService,
        private languageService: JhiLanguageService,
        private languageHelper: JhiLanguageHelper
    ) {
        this.languageService.setLocations(['settings', 'home', 'login']);
    }

    ngOnInit(): void {
        this.getEsercizi();
        this.contextService
            .saveUserContext(this.localStateStorageService.getUserContext())
            .subscribe(identity => this.principal.authenticate(identity));
    }

    getEsercizi(): void {
        this.contextService
        .getEsercizi()
        .subscribe(esercizi => this.esercizi = esercizi);
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
                this.principal.getAccount().cds,
                this.principal.getAccount().uo,
                this.principal.getAccount().cdr
            );
        this.contextService
            .saveUserContext(userContext)
            .subscribe(identity => this.principal.authenticate(identity));
       this.localStateStorageService.storeUserContext(userContext);
   }

}
