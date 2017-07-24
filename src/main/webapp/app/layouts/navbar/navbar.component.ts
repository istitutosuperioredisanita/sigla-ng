import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiLanguageService } from 'ng-jhipster';

import { ProfileService } from '../profiles/profile.service'; // FIXME barrel doesnt work here
import { JhiLanguageHelper, Principal, LoginModalService, LoginService, EventsService } from '../../shared';
import { ContextComponent} from '../../context';
import { Preferiti } from '../../context/preferiti.model';

import { VERSION, DEBUG_INFO_ENABLED } from '../../app.constants';

import { WorkspaceService } from '../../workspace/workspace.service';
import { NavbarService } from './navbar.service';

@Component({
    selector: 'jhi-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: [
        'navbar.css'
    ]
})
export class NavbarComponent implements OnInit {

    inProduction: boolean;
    isNavbarCollapsed: boolean;
    languages: any[];
    swaggerEnabled: boolean;
    modalRef: NgbModalRef;
    version: string;
    hidden: boolean;
    preferiti: Preferiti[];
    
    constructor(
        private loginService: LoginService,
        private languageHelper: JhiLanguageHelper,
        private languageService: JhiLanguageService,
        public principal: Principal,
        private loginModalService: LoginModalService,
        private profileService: ProfileService,
        private router: Router,
        private workspaceService: WorkspaceService,
        public nav: NavbarService,
        public eventsService: EventsService
    ) {
        this.version = DEBUG_INFO_ENABLED ? 'v. ' + VERSION : '';
        this.isNavbarCollapsed = true;
        this.languageService.addLocation('home');
        workspaceService.isMenuHidden()
            .subscribe(hidden => this.hidden = hidden);

    }

    ngOnInit() {
        this.languageHelper.getAll().then((languages) => {
            this.languages = languages;
        });
        if (this.isAuthenticated()) {
            this.profileService.getProfileInfo().subscribe(profileInfo => {
                this.inProduction = profileInfo.inProduction;
                this.swaggerEnabled = profileInfo.swaggerEnabled;
            });
            this.workspaceService.getPreferiti().subscribe(preferiti => {
                this.preferiti = preferiti;
            });
        }
    }

    changeLanguage(languageKey: string) {
      this.languageService.changeLanguage(languageKey);
    }

    collapseNavbar() {
        this.isNavbarCollapsed = true;
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }

    logout() {
        this.collapseNavbar();
        this.loginService.logout();
        this.router.navigate(['']);
    }

    toggleNavbar() {
        this.isNavbarCollapsed = !this.isNavbarCollapsed;
    }

    getImageUrl() {
        return this.isAuthenticated() ? this.principal.getImageUrl() : null;
    }

    setHidden(hidden: boolean) {
        this.workspaceService.menuHidden(hidden);
    }

    openPreferiti(cdNodo: string) {
        this.eventsService.broadcast('onPreferitiSelected', cdNodo);
    }
}
