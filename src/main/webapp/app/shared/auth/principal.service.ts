import { Injectable } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';
import { AccountService } from './account.service';
import { Account } from '../user/account.model';
import { ContextService } from '../../context/context.service';
import { LocalStateStorageService } from './local-storage.service';
import { JhiEventManager } from 'ng-jhipster';

@Injectable()
export class Principal {
    public userIdentity: any;
    private authenticated = false;
    private authenticationState = new Subject<any>();

    constructor(
        private account: AccountService,
        private context: ContextService,
        private eventManager: JhiEventManager,
        private localStateStorageService: LocalStateStorageService
    ) {}

    authenticate(identity) {
        this.userIdentity = identity;
        this.authenticated = identity !== null;
        this.authenticationState.next(this.userIdentity);
    }

    hasAnyAuthority(authorities: string[]): Promise<boolean> {
        return Promise.resolve(this.hasAnyAuthorityDirect(authorities));
    }

    hasAnyAuthorityDirect(authorities: string[]): boolean {
        if (!this.authenticated || !this.userIdentity || !this.userIdentity.authorities) {
            return false;
        }

        for (let i = 0; i < authorities.length; i++) {
            if (this.userIdentity.authorities.indexOf(authorities[i]) !== -1) {
                return true;
            }
        }

        return false;
    }

    hasAuthority(authority: string): Promise<boolean> {
        if (!this.authenticated) {
           return Promise.resolve(false);
        }

        return this.identity().then((id) => {
            return Promise.resolve(id.authorities && id.authorities.indexOf(authority) !== -1);
        }, () => {
            return Promise.resolve(false);
        });
    }

    notHaveAuthority(authorities: string[]): Promise<boolean> {
        if (!this.authenticated || !this.userIdentity || !this.userIdentity.authorities) {
            return Promise.resolve(false);
        }

        for (let i = 0; i < authorities.length; i++) {
            if (this.userIdentity.authorities.indexOf(authorities[i]) !== -1) {
                return Promise.resolve(false);
            }
        }
        return Promise.resolve(true);
    }

    identity(force?: boolean, user?: string): Promise<any> {
        let reloadUserIdentity = false;
        if (force === true) {
            reloadUserIdentity = true;
        }

        // check and see if we have retrieved the userIdentity data from the server.
        // if we have, reuse it by immediately resolving
        if (!reloadUserIdentity && this.userIdentity) {
            return Promise.resolve(this.userIdentity);
        }
        // retrieve the userIdentity data from the server, update the identity object, and then resolve.
        return this.account.get(user).toPromise().then((account) => {
            if (account) {
                const that = this;
                this.userIdentity = account;
                if (user || (this.userIdentity.users.length === 1 || !force)) {
                    this.context.saveUserContext(
                        this.localStateStorageService.getUserContext(this.userIdentity.username)
                    ).toPromise().then((usercontext) => {
                        that.userIdentity = usercontext;
                        this.context.findEsercizi();
                        this.context.findPreferiti();
                        this.context.findMessaggi();
                        this.context.findCds(usercontext);
                        this.context.findUo(usercontext);
                        this.context.findCdr(usercontext);
                        if (force === undefined) {
                            this.eventManager.broadcast({name: 'onRefreshTodo'});
                        }
                    });
                    this.authenticated = true;
                }
            } else {
                this.userIdentity = null;
                this.authenticated = false;
            }
            this.authenticationState.next(this.userIdentity);
            return this.userIdentity;
        }).catch((err) => {
            this.userIdentity = null;
            this.authenticated = false;
            this.authenticationState.next(this.userIdentity);
            return null;
        });
    }

    setAuthenticated(authenticated: boolean) {
        this.authenticated = authenticated;
    }

    getAccount(): Account {
        return this.userIdentity;
    }

    isAuthenticated(): boolean {
        return this.authenticated;
    }

    isIdentityResolved(): boolean {
        return this.userIdentity !== undefined;
    }

    getAuthenticationState(): Observable<any> {
        return this.authenticationState.asObservable();
    }

    getImageUrl(): String {
        return this.isIdentityResolved() ? this.userIdentity.imageUrl : null;
    }
}
