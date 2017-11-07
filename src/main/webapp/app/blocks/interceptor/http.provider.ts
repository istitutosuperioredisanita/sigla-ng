import { JhiEventManager, JhiInterceptableHttp } from 'ng-jhipster';
import { Injector } from '@angular/core';
import { Http, XHRBackend, RequestOptions } from '@angular/http';

import { AuthExpiredInterceptor } from './auth-expired.interceptor';
import { ErrorHandlerInterceptor } from './errorhandler.interceptor';
import { NotificationInterceptor } from './notification.interceptor';
import { StateStorageService } from '../../shared/auth/state-storage.service';
import { Router } from '@angular/router';

export function interceptableFactory(
    backend: XHRBackend,
    defaultOptions: RequestOptions,
    injector: Injector,
    eventManager: JhiEventManager,
    stateStorageService: StateStorageService,
    router: Router
) {
    return new JhiInterceptableHttp(
        backend,
        defaultOptions,
        [
            new ErrorHandlerInterceptor(eventManager),            
            new AuthExpiredInterceptor(injector, stateStorageService, router),
            // Other interceptors can be added here
            new NotificationInterceptor(injector)
        ]
    );
}

export function customHttpProvider() {
    return {
        provide: Http,
        useFactory: interceptableFactory,
        deps: [
            XHRBackend,
            RequestOptions,
            Injector,
            JhiEventManager,
            StateStorageService,
            Router
        ]
    };
}
