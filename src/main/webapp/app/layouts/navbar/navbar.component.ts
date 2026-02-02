import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService, LanguageHelper, Principal, MultipleUserModalService, LoginService } from '../../shared';
import { WorkspaceService } from '../../workspace/workspace.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { MenuService } from './menu.service';
import { filter, map } from 'rxjs/operators';
@Component({
    selector: 'jhi-navbar',
    templateUrl: './navbar.component.html',
    standalone: false
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
        protected menuService: MenuService,
        protected activatedRoute: ActivatedRoute,
        protected loginService: LoginService,
        protected languageHelper: LanguageHelper,
        protected languageService: LanguageService,
        protected multipleUserModalService: MultipleUserModalService,
        protected principal: Principal,
        protected workspaceService: WorkspaceService,
        protected router: Router,
        protected translateService: TranslateService
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
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => this.getMenuKeyFromRoute())
        ).subscribe(menuKey => {
            this.menuService.setMenu(menuKey);
        });

        // Imposta il menu al caricamento iniziale
        const menuKey = this.getMenuKeyFromRoute();
        if (menuKey) {
            this.menuService.setMenu(menuKey);
        }
    }

    private getMenuKeyFromRoute(): string | null {
        let route = this.activatedRoute.root;        
        // Naviga attraverso l'albero delle route
        while (route.firstChild) {
            route = route.firstChild;
        }
        // Cerca il data 'menu' risalendo l'albero
        let currentRoute = route;
        while (currentRoute) {
            if (currentRoute.snapshot.data['menu']) {
                return currentRoute.snapshot.data['menu'];
            }
            currentRoute = currentRoute.parent!;
        }        
        return null;
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
