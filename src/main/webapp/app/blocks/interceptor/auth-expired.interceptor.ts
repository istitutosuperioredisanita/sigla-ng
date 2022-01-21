import { JhiEventManager } from 'ng-jhipster';
import { HttpInterceptor, HttpRequest, HttpErrorResponse, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, EMPTY, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Injector } from '@angular/core';
import { StateStorageService } from '../../shared/auth/state-storage.service';
import { LoginService } from '../../shared/login/login.service';

export class AuthExpiredInterceptor implements HttpInterceptor {
    private API_ACCOUNT = '/api/account';
    constructor(
        private injector: Injector,
        private stateStorageService: StateStorageService,
        private router: Router,
        private eventManager: JhiEventManager
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const self = this;
        return next.handle(request).pipe(
            tap(
                (event: HttpEvent<any>) => {},
                (error: any) => {
                    if (error instanceof HttpErrorResponse) {
                        if (error.status === 401 && error.message !== '') {
                            if (error.url.indexOf(this.API_ACCOUNT) !== -1) {
                                location.href = '/sso/login';
                                return EMPTY;
                            }
                            const loginService: LoginService = self.injector.get(LoginService);
                            const destination = this.stateStorageService.getDestinationState();
                            if (destination) {
                                const to = destination.destination;
                                const toParams = destination.params;
                                if (to.name === 'accessdenied') {
                                    self.stateStorageService.storePreviousState(to.name, toParams);
                                }
                            }
                            if (error.url.indexOf('/api/authentication') === -1) {
                                loginService.logoutAndRedirect();
                                return EMPTY;
                            }
                        }
                        if (error.status === 422 && error.url.indexOf(this.API_ACCOUNT) !== -1) {
                            const data = JSON.parse(error.message);
                            this.router.navigate(['/error', {
                                status: 'accessdenied',
                                given_name: data.given_name,
                                family_name: data.family_name,
                                preferred_username: data.preferred_username,
                                email: data.email
                            }]);
                            return EMPTY;
                        }
                        return throwError(error);
                    }
                }
            )
        );
    }
}
