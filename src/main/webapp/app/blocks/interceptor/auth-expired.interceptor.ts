import { JhiHttpInterceptor } from 'ng-jhipster';
import { Injector } from '@angular/core';
import { RequestOptionsArgs, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

export class AuthExpiredInterceptor extends JhiHttpInterceptor {

    responseIntercept(observable: Observable<Response>): Observable<Response> {
        return observable;
    }

    requestIntercept(options?: RequestOptionsArgs): RequestOptionsArgs {
        return options;
    }
}
