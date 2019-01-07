import { Injectable } from '@angular/core';
import { JhiEventManager, JhiLanguageService } from 'ng-jhipster';
import { LocalStateStorageService } from '../auth/local-storage.service';
import { Principal } from '../auth/principal.service';
import { AuthServerProvider } from '../auth/auth-session.service';
import { Router } from '@angular/router';
import { ContextService } from '../../context/context.service';

@Injectable()
export class LoginService {

    constructor(
        private languageService: JhiLanguageService,
        private principal: Principal,
        private authServerProvider: AuthServerProvider,
        private router: Router,
        private eventManager: JhiEventManager,
        private localStateStorageService: LocalStateStorageService,
        private contextService: ContextService
    ) {}

    login(credentials, callback?) {
        const cb = callback || function() {};
        return new Promise((resolve, reject) => {
            this.authServerProvider.login(credentials).subscribe((data) => {
                this.authServerProvider.loginWildfly((credentials),
                        this.localStateStorageService.getUserContext(credentials.username)).subscribe((dataWildfly) => {
                            this.principal.identity(true).then((account) => {
                                if (account !== null) {
                                    this.contextService.saveWildflyUserContext(
                                        this.localStateStorageService.getUserContext(account.username)
                                    ).subscribe(() => {
                                        this.eventManager.broadcast({name: 'onRefreshTodo'});
                                    });
                                    resolve(account);
                                    this.languageService.changeLanguage(account.langKey);
                                }
                            });
                    });
                return cb();
            }, (err) => {
                reject(err);
                return cb(err);
            });
        });
    }

    logoutAndRedirect(): void {
        if (this.principal.isAuthenticated()) {
            this.logout();
            this.router.navigate(['/']);
        }
    }

    logout() {
        this.authServerProvider.logout().subscribe(() => {
            this.authServerProvider.logoutWildfly().subscribe();
        });
        this.principal.authenticate(null);
    }

}
