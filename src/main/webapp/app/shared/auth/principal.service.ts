import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AccountService } from './account.service';
import { Account } from '../user/account.model';
import { ContextService } from '../../context/context.service';
import { LocalStateStorageService } from './local-storage.service';

@Injectable()
export class Principal {
    private userIdentity: Account;
    private authenticated = false;
    private authenticationState = new Subject<any>();

    constructor(
        private account: AccountService,
        private context: ContextService,
        private localStateStorageService: LocalStateStorageService
    ) {}

    authenticate (identity) {
        this.userIdentity = identity;
        this.authenticated = identity !== null;
        this.authenticationState.next(this.userIdentity);
    }

    hasAnyAuthority (authorities: string[]): Promise<boolean> {
        if (!this.authenticated || !this.userIdentity || !this.userIdentity.authorities) {
            return Promise.resolve(false);
        }

        for (let i = 0; i < authorities.length; i++) {
            if (this.userIdentity.authorities.indexOf(authorities[i]) !== -1) {
                return Promise.resolve(true);
            }
        }

        return Promise.resolve(false);
    }

    notHaveAuthority (authorities: string[]): Promise<boolean> {
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

    hasAuthority (authority: string): Promise<boolean> {
        if (!this.authenticated) {
           return Promise.resolve(false);
        }

        return this.identity().then(id => {
            return Promise.resolve(id.authorities && id.authorities.indexOf(authority) !== -1);
        }, () => {
            return Promise.resolve(false);
        });
    }

    identity (force?: boolean, user?: string): Promise<any> {
        if (force === true) {
            this.userIdentity = undefined;
        }

        // check and see if we have retrieved the userIdentity data from the server.
        // if we have, reuse it by immediately resolving
        if (this.userIdentity) {
            return Promise.resolve(this.userIdentity);
        }
        // retrieve the userIdentity data from the server, update the identity object, and then resolve.
        return this.account.get(user).toPromise().then(account => {
            if (account) {
                let that = this;
                this.userIdentity = account;
                if (user) {
                    this.context.saveUserContext(
                        this.localStateStorageService.getUserContext(this.userIdentity.login)
                    ).toPromise().then(usercontext => {
                        that.userIdentity = usercontext;
                        this.context.findEsercizi();
                        this.context.findPreferiti();
                        this.context.allCds();
                        this.context.findCds(usercontext);
                        this.context.findUo(usercontext);
                        this.context.findCdr(usercontext);
                    });
                    this.authenticated = true;
                } else {
                    if (this.userIdentity.users.length === 1) {
                        this.authenticated = true;
                    }
                }
            } else {
                this.userIdentity = null;
                this.authenticated = false;
            }
            this.authenticationState.next(this.userIdentity);
            return this.userIdentity;
        }).catch(err => {
            this.userIdentity = null;
            this.authenticated = false;
            this.authenticationState.next(this.userIdentity);
            return null;
        });
    }

    isAuthenticated (): boolean {
        return this.authenticated;
    }

    getAccount (): Account {
        return this.userIdentity;
    }

    isIdentityResolved (): boolean {
        return this.userIdentity !== undefined;
    }

    getAuthenticationState(): Observable<any> {
        return this.authenticationState.asObservable();
    }

    getImageUrl(): String {
        return this.isIdentityResolved () ? this.userIdentity.imageUrl : null;
    }
}
