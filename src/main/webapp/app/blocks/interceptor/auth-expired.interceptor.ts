import { HttpInterceptor } from 'ng-jhipster';
import { RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Injector } from '@angular/core';
import { LoginService } from '../../shared/login/login.service';
import { StateStorageService } from '../../shared/auth/state-storage.service';
import { Router } from '@angular/router';

export class AuthExpiredInterceptor extends HttpInterceptor {

    constructor(
        private injector: Injector,
        private stateStorageService: StateStorageService,
        private router: Router
    ) {
        super();
    }

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }
    responseIntercept(observable: Observable<Response>): Observable<Response> {
        let self = this;
        return <Observable<Response>> observable.catch((error) => {
            if (error.status === 401 && error.text() !== '') {
                let loginService = self.injector.get(LoginService);
                let destination = this.stateStorageService.getDestinationState();
                let to = destination.destination;
                let toParams = destination.params;
                if (to.name === 'accessdenied') {
                    self.stateStorageService.storePreviousState(to.name, toParams);
                }
                loginService.logoutAndRedirect();
                return Observable.empty();
            }
            return Observable.throw(error);
        });
    }
}
