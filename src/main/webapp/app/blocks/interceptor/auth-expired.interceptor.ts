import { JhiHttpInterceptor } from 'ng-jhipster';
import { Injector } from '@angular/core';
import { RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LoginService } from '../../shared/login/login.service';
import { StateStorageService } from '../../shared/auth/state-storage.service';
import { Router } from '@angular/router';

export class AuthExpiredInterceptor extends JhiHttpInterceptor {
    private API_ACCOUNT = '/api/account';
    constructor(
        private injector: Injector,
        private stateStorageService: StateStorageService,
        private router: Router
    ) {
        super();
    }

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        const self = this;
        return <Observable<Response>> observable.catch((error) => {
            if (error.status === 401 && error.text() !== '') {
                const loginService: LoginService = self.injector.get(LoginService);
                const destination = this.stateStorageService.getDestinationState();
                if (destination) {
                    const to = destination.destination;
                    const toParams = destination.params;
                    if (to.name === 'accessdenied') {
                        self.stateStorageService.storePreviousState(to.name, toParams);
                    }
                }
                if (error.url.indexOf(this.API_ACCOUNT) !== -1) {
                    location.href = '/sso/login';
                    return Observable.empty();
                }
                if (error.url.indexOf('/api/authentication') === -1) {
                    loginService.logoutAndRedirect();
                    return Observable.empty();
                }
            }
            if (error.status === 422 && error.url.indexOf(this.API_ACCOUNT) !== -1) {
                const data = JSON.parse(error.text());
                this.router.navigate(['/error', {
                    status: 'accessdenied',
                    given_name: data.given_name,
                    family_name: data.family_name,
                    preferred_username: data.preferred_username,
                    email: data.email
                }]);
                return Observable.empty();
            }
            return Observable.throw(error);
        });

    }

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }
}
