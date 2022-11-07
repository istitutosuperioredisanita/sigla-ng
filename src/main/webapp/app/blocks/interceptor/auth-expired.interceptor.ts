import { HttpInterceptor, HttpRequest, HttpErrorResponse, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, EMPTY, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StateStorageService } from '../../shared/auth/state-storage.service';
import { LoginService } from '../../shared/login/login.service';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthExpiredInterceptor implements HttpInterceptor {
    private API_ACCOUNT = '/restapi/account';
    constructor(
        private stateStorageService: StateStorageService,
        private router: Router,
        private loginService: LoginService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap(
                (event: HttpEvent<any>) => {},
                (error: any) => {
                    const destination = this.stateStorageService.getDestinationState();
                    if (error instanceof HttpErrorResponse) {
                        if ((error.status === 401 || error.status === 0) && error.message !== '') {
                            if (error.url.indexOf('/api/authentication') === -1) {
                                this.loginService.logoutAndRedirect();
                                return EMPTY;
                            }
                            if (destination) {
                                const to = destination.destination;
                                const toParams = destination.params;
                                if (to.name === 'accessdenied') {
                                    this.stateStorageService.storePreviousState(to.name, toParams);
                                }
                            }
                        }
                        if (error.status === 422 && error.url.indexOf(this.API_ACCOUNT) !== -1) {
                            const data = error.error;
                            this.router.navigate(['/error', {
                                status: 'accessdenied',
                                given_name: data.given_name,
                                family_name: data.family_name,
                                preferred_username: data.preferred_username,
                                email: data.email,
                                updatedAt: data.updated_at
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
