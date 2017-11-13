import { Component, OnInit, AfterViewInit, Renderer, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { JhiLanguageService, JhiEventManager } from 'ng-jhipster';
import { Account, Principal} from '../';

import { LoginService } from '../login/login.service';
import { StateStorageService } from '../auth/state-storage.service';

@Component({
    selector: 'jhi-messaggi-modal',
    templateUrl: './messaggi.component.html'
})
export class JhiMessaggiModalComponent {
    public account: Account;
    public page: string;
    public html: string;

    constructor(
        private languageService: JhiLanguageService,
        private loginService: LoginService,
        private principal: Principal,
        public activeModal: NgbActiveModal
    ) {
        this.principal.identity().then((account) => {
            this.account = account;
        });
    }

    confirm() {
        this.activeModal.dismiss('cancel');
    }
}
