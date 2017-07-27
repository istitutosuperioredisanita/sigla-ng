import { Component, OnInit, AfterViewInit, Renderer, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { JhiLanguageService, EventManager } from 'ng-jhipster';
import { Account, Principal} from '../';

import { LoginService } from '../login/login.service';
import { StateStorageService } from '../auth/state-storage.service';

@Component({
    selector: 'jhi-multiple-user-modal',
    templateUrl: './multiple-user.component.html'
})
export class JhiMultipleUserModalComponent implements OnInit {
    public account: Account;
    public selectedUser: string;

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

    ngOnInit() {
        this.languageService.addLocation('login');
    }

    confirm () {
        this.loginService.loginMultiploWildfly(this.selectedUser);
        this.activeModal.dismiss('cancel');
    }
}
