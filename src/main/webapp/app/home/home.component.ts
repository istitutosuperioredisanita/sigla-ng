import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';
import { Router, NavigationExtras } from '@angular/router';
import { ProfileService } from '../layouts/profiles/profile.service'; // FIXME barrel doesnt work here
import { Account, MultipleUserModalService, LoginService, Principal, StateStorageService } from '../shared';
import { ContextService} from '../context';
import { LocalStateStorageService } from '../shared/auth/local-storage.service';
import { SERVER_API_URL } from '../app.constants';
import { AuthServerProvider } from '../shared/auth/auth-session.service';
import { AuthService } from '../shared/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'jhi-home',
    templateUrl: './home.component.html',
    styleUrls: [
        'home.css'
    ],
})
export class HomeComponent implements OnInit, AfterViewInit {
    account: Account;
    modalRef: NgbModalRef;
    authenticationError: boolean;
    authenticationErrorStatus = 401;
    authenticationErrorMessage: string;
    instituteAcronym: string;
    password: string;
    rememberMe: boolean;
    username: string;
    credentials: any;
    isRequesting = false;
    keycloakEnabled = true;
    @ViewChild('usernameinput', {static : true}) userNameElement: ElementRef;

    constructor(
        private principal: Principal,
        private loginService: LoginService,
        private multipleUserModalService: MultipleUserModalService,
        private authServerProvider: AuthServerProvider,
        private authService: AuthService,
        private stateStorageService: StateStorageService,
        private eventManager: JhiEventManager,
        private profileService: ProfileService,
        private router: Router,
        private context: ContextService,
        private localStateStorageService: LocalStateStorageService,
        private translateService: TranslateService
    ) {
    }

    ngOnInit() {
        this.translateService.setDefaultLang('it');
        if (this.isAuthenticated()) {
            this.principal.identity().then((account) => {
                this.account = account;
            });
        }
        this.profileService.getProfileInfo().subscribe((profileInfo) => {
            this.instituteAcronym = profileInfo.instituteAcronym;
            this.keycloakEnabled = profileInfo.keycloakEnabled;
            if (profileInfo.keycloakEnabled) {
                this.principal.identity(true).then((account: Account) => {
                    if (account && account.login) {
                        this.authService.refreshToken().subscribe(() => {
                            this.authServerProvider.initializeWildfly(account).subscribe(() => {
                                this.account = account;
                                if (account.users.length > 1) {
                                    this.context.saveUserContext(
                                        this.localStateStorageService.getUserContext(account.username)
                                    ).toPromise().then((usercontext) => {
                                        this.context.findEsercizi();
                                        this.context.findPreferiti();
                                        this.context.findMessaggi();
                                        this.context.findCds(usercontext);
                                        this.context.findUo(usercontext);
                                        this.context.findCdr(usercontext);
                                    });
                                    this.authServerProvider.loginMultiploWildfly(
                                        account.username,
                                        this.localStateStorageService.getUserContext(account.username)
                                    ).subscribe(() => {
                                        this.principal.setAuthenticated(true);
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
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
            } else if (!account.enabled) {
                this.authenticationErrorStatus = 555;
                this.principal.setAuthenticated(false);
                this.isRequesting = false;
                this.authenticationError = true;
            } else {
                 if (account.users.length === 1) {
                    this.context.saveUserContext(
                        this.localStateStorageService.getUserContext(account.username)
                    ).subscribe((usercontext) => {
                        this.principal.authenticate(usercontext);
                    });
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
                    const previousState = this.stateStorageService.getPreviousState();
                    if (previousState) {
                        this.stateStorageService.resetPreviousState();
                        this.router.navigate([previousState.name], { queryParams:  previousState.params });
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
