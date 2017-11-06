import { Injectable } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { LocalStateStorageService } from '../auth/local-storage.service';
import { Principal } from '../auth/principal.service';
import { AuthServerProvider } from '../auth/auth-session.service';
import { Router } from '@angular/router';

@Injectable()
export class LoginService {

    constructor(
        private languageService: JhiLanguageService,
        private principal: Principal,
        private authServerProvider: AuthServerProvider,
        private router: Router,
        private localStateStorageService: LocalStateStorageService
    ) {}

    login(credentials, callback?) {
        const cb = callback || function() {};
        return new Promise((resolve, reject) => {
            this.authServerProvider.login(credentials).subscribe((data) => {
                this.authServerProvider.loginWildfly((credentials),
                        this.localStateStorageService.getUserContext(credentials.username)).subscribe((dataWildfly) => {
                            this.principal.identity(true).then((account) => {
                                if (account !== null) {
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
            this.router.navigate(['']);
        }
    }

    logout() {
        this.authServerProvider.logout().subscribe(() => {
            this.authServerProvider.logoutWildfly().subscribe();
        });
        this.principal.authenticate(null);
    }

    loginMultiploWildfly(utenteMultiplo: string, page: string): void {
        this.authServerProvider.loginMultiploWildfly(utenteMultiplo, this.localStateStorageService.getUserContext(utenteMultiplo))
            .subscribe(() => {
                this.principal.identity(true, utenteMultiplo).then((account) => {
                    if (this.localStateStorageService.getUserContext(account.username).cds) {
                        this.router.navigate([page]);
                    }
                });
        });
    }

}
