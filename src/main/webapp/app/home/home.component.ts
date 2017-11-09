import { Component, OnInit, AfterViewInit, Renderer, ElementRef } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiLanguageService } from 'ng-jhipster';
import { Router } from '@angular/router';

import { Account, MultipleUserModalService, LoginService, Principal, StateStorageService } from '../shared';
import { ContextService} from '../context';
import { LocalStateStorageService } from '../shared/auth/local-storage.service';

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
    password: string;
    rememberMe: boolean;
    username: string;
    credentials: any;

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private principal: Principal,
        private loginService: LoginService,
        private multipleUserModalService: MultipleUserModalService,
        private stateStorageService: StateStorageService,
        private eventManager: JhiEventManager,
        private elementRef: ElementRef,
        private router: Router,
        private renderer: Renderer,
        private context: ContextService,
        private localStateStorageService: LocalStateStorageService
    ) {
    }

    ngOnInit() {
        if (this.isAuthenticated()) {
            this.principal.identity().then((account) => {
                this.account = account;
            });
        }
        this.registerAuthenticationSuccess();
    }
    ngAfterViewInit() {
        const userNameElement = this.elementRef.nativeElement.querySelector('#username');
        if (userNameElement) {
            this.renderer.invokeElementMethod(
                userNameElement,
                'focus', ['']
            );
        }
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

    login() {
        this.loginService.login({
            username: this.username,
            password: this.password,
            rememberMe: this.rememberMe
        }).then((account: Account) => {
            this.account = account;
            if (account.users.length === 1) {
                this.context.saveUserContext(
                    this.localStateStorageService.getUserContext(account.username)
                ).subscribe((usercontext) => {
                    this.principal.authenticate(usercontext);
                    this.context.findEsercizi();
                    this.context.findPreferiti();
                    this.context.allCds();
                    this.context.findCds(usercontext);
                    this.context.findUo(usercontext);
                    this.context.findCdr(usercontext);
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
                        if (this.localStateStorageService.getUserContext(this.principal.getAccount().username).cds) {
                            this.router.navigate(['workspace']);
                        }
                    } else {
                        this.router.navigate(['workspace']);
                    }
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
        }).catch((error) => {
            console.log(error);
            this.authenticationError = true;
        });
    }
}
