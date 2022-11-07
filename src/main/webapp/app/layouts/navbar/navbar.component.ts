import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiLanguageService } from 'ng-jhipster';
import { JhiLanguageHelper, Principal, MultipleUserModalService, LoginService } from '../../shared';
import { WorkspaceService } from '../../workspace/workspace.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'jhi-navbar',
    templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

    inProduction: boolean;
    isNavbarCollapsed: boolean;
    oidcEnabled: boolean;
    ssoAppsMenuDisplay: boolean;
    languages: any[];
    instituteAcronym: string;
    urlChangePassword: string;
    accountLabel: string;
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
        private workspaceService: WorkspaceService,
        public router: Router,
        private translateService: TranslateService
    ) {
        this.isNavbarCollapsed = true;
        workspaceService.isMenuHidden().subscribe((hidden) => this.hidden = hidden);
    }

    ngOnInit() {
        this.translateService.setDefaultLang('it');
        this.oidcEnabled = (environment.oidc.enable  === 'true') ? true : false;
        this.languageHelper.getAll().then((languages) => {
            this.languages = languages;
        });
        this.inProduction = environment.production;
        this.instituteAcronym = environment.instituteAcronym;
        this.ssoAppsMenuDisplay = (environment.ssoAppsMenuDisplay === 'true') ? true : false;
        this.urlChangePassword = environment.urlChangePassword;
        if (this.urlChangePassword) {
            this.translateService.get('login.form.manage-account').subscribe((text: string) => {
                this.accountLabel = text;
            });
        }
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
        if (this.oidcEnabled) {
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

    manageAccount() {
        location.href = this.urlChangePassword;
    }
}
