import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { Router, NavigationExtras } from '@angular/router';
import { Account, MultipleUserModalService, LoginService, Principal, StateStorageService } from '../shared';
import { LocalStateStorageService } from '../shared/auth/local-storage.service';
import { SERVER_API_URL } from '../app.constants';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, AfterViewInit {
    account: Account;
    modalRef: NgbModalRef;
    authenticationError: boolean;
    authenticationErrorStatus = 401;
    authenticationErrorMessage: string;
    instituteAcronym: string;
    password = '';
    rememberMe: boolean;
    username = '';
    credentials: any;
    isRequesting = false;
    oidcEnable = false;
    @ViewChild('usernameinput', {static : true}) userNameElement: ElementRef;

    constructor(
        private principal: Principal,
        private loginService: LoginService,
        private multipleUserModalService: MultipleUserModalService,
        private stateStorageService: StateStorageService,
        private eventManager: JhiEventManager,
        private router: Router,
        private localStateStorageService: LocalStateStorageService,
        private translateService: TranslateService,
        private oidcSecurityService: OidcSecurityService
    ) {
    }

    ngOnInit() {
        this.oidcEnable = (environment.oidc.enable === 'true') ? true : false;
        this.translateService.setDefaultLang('it');
        if (!this.oidcEnable && this.isAuthenticated()) {
            this.principal.identity().then((account) => {
                this.account = account;
            });
        }
        this.instituteAcronym = environment.instituteAcronym;
        if (this.oidcEnable && !this.isAuthenticated()) {
            console.log('init oidc');
            this.oidcSecurityService.checkAuth().subscribe(({isAuthenticated}) => {
                if (isAuthenticated) {
                    this.login();
                }
            })
        }        
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if (this.userNameElement) {
                this.userNameElement.nativeElement.focus();
            }
        });
    }

    registerAuthenticationSuccess() {
        this.eventManager.subscribe('authenticationSuccess', (message) => {
            this.principal.identity().then((account) => {
                this.account = account;
            });
        });
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login(redirect?: string) {
        let navigate = redirect || '';
        this.isRequesting = true;
        this.loginService.login({
            username: this.username ? this.username.toLowerCase() : '',
            password: this.password,
            rememberMe: this.rememberMe
        }).then((account: Account) => {
            this.account = account;
            this.isRequesting = false;
            if (!account.accountNonLocked || !account.accountNonExpired) {
                const navigationExtras: NavigationExtras = {
                    queryParams: {
                        'accountNonLocked': account.accountNonLocked,
                        'accountNonExpired': account.accountNonExpired
                    }
                };
                this.router.navigate(['password'], navigationExtras);
            } else if (account.ldap && !account.abilitatoLdap) {
                this.authenticationErrorStatus = 556;
                this.principal.setAuthenticated(false);
                this.isRequesting = false;
                this.authenticationError = true;
                this.router.navigate(['/error', {
                    status: 'accessdenied',
                    error: 'login.messages.error.authentication.556',            
                    given_name: account.firstName,
                    family_name: account.lastName,
                    preferred_username: account.login,
                    email: account.email,
                    updatedAt: account.updatedAt||'.'
                }]);
            } else if (!account.enabled || !account.credentialsNonExpired) {
                this.authenticationErrorStatus = 555;
                this.principal.setAuthenticated(false);
                this.isRequesting = false;
                this.authenticationError = true;
                this.router.navigate(['/error', {
                    status: 'accessdenied',
                    given_name: account.firstName,
                    family_name: account.lastName,
                    preferred_username: account.login,
                    email: account.email,
                    updatedAt: account.updatedAt||'.'
                }]);
            } else {
                if (account.users.length === 1) {
                    this.principal.authenticate(account);
                    if (this.router.url === '/register' || (/activate/.test(this.router.url)) ||
                        this.router.url === '/finishReset' || this.router.url === '/requestReset') {
                        this.router.navigate(['']);
                    }
                    this.eventManager.broadcast({
                        name: 'authenticationSuccess',
                        content: 'Sending Authentication Success'
                    });
                    this.principal.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_SUPERUSER']).then((result) => {
                        if (!result) {
                            if (account.accountNonLocked && this.localStateStorageService.getUserContext(this.principal.getAccount().username).cds) {
                                navigate = SERVER_API_URL + 'workspace';
                            }
                        } else {
                            navigate = SERVER_API_URL + 'workspace';
                        }
                        this.router.navigate([navigate]);
                    });
                    // // previousState was set in the authExpiredInterceptor before being redirected to login modal.
                    // // since login is succesful, go to stored previousState and clear previousState
                    if (!this.oidcEnable) {
                        const previousState = this.stateStorageService.getPreviousState();
                        if (previousState) {
                            this.stateStorageService.resetPreviousState();
                            this.router.navigate([previousState.name], { queryParams:  previousState.params });
                        }
                    }
                    this.authenticationError = false;
                } else {
                    this.modalRef = this.multipleUserModalService.open('workspace');
                }
            }
        }).catch((error) => {
            if (error.status) {
                this.authenticationErrorStatus = error.status;
            }
            if (error.error && error.error.message) {
                this.authenticationErrorMessage = error.error.message;
            }
            if (error._body) {
                this.authenticationErrorMessage = JSON.parse(error._body).message;
            }
            this.isRequesting = false;
            this.authenticationError = true;
        });
    }

    getLogo() {
        return 'login-img-' + this.instituteAcronym;
    }
}
