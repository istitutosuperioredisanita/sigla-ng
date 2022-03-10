import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiLanguageService } from 'ng-jhipster';
import { ProfileService } from '../profiles/profile.service'; // FIXME barrel doesnt work here
import { JhiLanguageHelper, Principal, MultipleUserModalService, LoginService } from '../../shared';
import { WorkspaceService } from '../../workspace/workspace.service';

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
    keycloakEnabled: boolean;
    ssoAppsMenuDisplay: boolean;
    languages: any[];
    instituteAcronym: string;
    swaggerEnabled: boolean;
    modalRef: NgbModalRef;
    version: string;
    hidden: boolean;

    constructor(
        private loginService: LoginService,
        private languageHelper: JhiLanguageHelper,
        private languageService: JhiLanguageService,
        private multipleUserModalService: MultipleUserModalService,
        public principal: Principal,
        private profileService: ProfileService,
        private workspaceService: WorkspaceService,
        public router: Router
    ) {
        this.isNavbarCollapsed = true;
        workspaceService.isMenuHidden().subscribe((hidden) => this.hidden = hidden);
    }

    ngOnInit() {
        this.languageHelper.getAll().then((languages) => {
            this.languages = languages;
        });
        this.profileService.getProfileInfo().subscribe((profileInfo) => {
            this.inProduction = profileInfo.inProduction;
            this.swaggerEnabled = profileInfo.swaggerEnabled;
            this.instituteAcronym = profileInfo.instituteAcronym;
            this.keycloakEnabled = profileInfo.keycloakEnabled;
            this.ssoAppsMenuDisplay = profileInfo.ssoAppsMenuDisplay;
        });
        this.workspaceService.version().subscribe((version) => {
            this.version = version;
        });
    }

    getLogo() {
        return 'logo-img-' + this.instituteAcronym;
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

    isMultipleUser() {
        return this.principal.getAccount().users.length > 1;
    }

    logout() {
        this.collapseNavbar();
        if (this.keycloakEnabled) {
            this.loginService.logoutSSO();
        } else {
            this.loginService.logout();
            this.router.navigate(['']);
        }
    }

    changeUser() {
        this.collapseNavbar();
        this.router.navigate(['']);
        this.modalRef = this.multipleUserModalService.open('');
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
}
