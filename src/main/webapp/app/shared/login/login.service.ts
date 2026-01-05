import { Injectable } from '@angular/core';
import { EventManager } from '../../shared/auth/event-manager.service';
import { LocalStateStorageService } from '../auth/local-storage.service';
import { Principal } from '../auth/principal.service';
import { AuthServerProvider } from '../auth/auth-session.service';
import { Router } from '@angular/router';
import { ContextService } from '../../context/context.service';
import { Account } from '../user/account.model';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable()
export class LoginService {

    constructor(
        private principal: Principal,
        private authServerProvider: AuthServerProvider,
        private router: Router,
        private eventManager: EventManager,
        private localStateStorageService: LocalStateStorageService,
        private contextService: ContextService,
        private oidcSecurityService: OidcSecurityService
    ) {}

    login(credentials, callback?) {
        const cb = callback || function() {};
        return new Promise((resolve, reject) => {
            this.authServerProvider.loginWildfly((credentials), this.localStateStorageService.getUserContext(credentials.username)).subscribe((accountWildfly: Account) => {
                this.authServerProvider.initializeWildfly(undefined).subscribe(() => {
                    this.contextService.saveWildflyUserContext(this.localStateStorageService.getUserContext(accountWildfly.username)).subscribe(() => {
                        this.principal.identity(true).then((account) => {
                            if (account !== null) {
                                resolve(account);
                            }
                        });
                        this.eventManager.broadcast('onRefreshTodo');
                    });
                });
            }, (err) => {
                reject(err);
                return cb(err);
            });
            return cb();
        });
    }

    logoutAndRedirect(): void {
        if (this.principal.isAuthenticated()) {
            this.logout();
            this.principal.authenticate(null);
            this.router.navigate(['']);
        }
    }

    logout() {
        this.authServerProvider.logoutWildfly().subscribe(() => {
            this.principal.authenticate(null);
        });
    }

    logoutSSO() {
        this.principal.identity(true).then((account: Account) => {
            this.authServerProvider.logoutWildfly().subscribe(() => {
                this.oidcSecurityService.logoffAndRevokeTokens().subscribe(() => {
                    this.principal.authenticate(null);
                });
            });
        });
    }

}
