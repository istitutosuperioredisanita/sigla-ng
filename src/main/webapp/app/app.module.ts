import './vendor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { NgxCnrUictSsoModule } from 'ngx-cnr-uict-sso';

import { LoginService, SiglaSharedModule, StateStorageService, UserRouteAccessService } from './shared';
import { SiglaHomeModule } from './home/home.module';
import { SiglaAccountModule } from './account/account.module';
import { SiglaEntityModule } from './entities/entity.module';
import { SiglaWorkspaceModule } from './workspace/workspace.module';

import { PaginationConfig } from './blocks/config/uib-pagination.config';

// jhipster-needle-angular-add-module-import JHipster will add new module here
import { ContextService } from './context';
import { LocalStateStorageService } from './shared/auth/local-storage.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import {
    JhiMainComponent,
    LayoutRoutingModule,
    NavbarComponent,
    FooterComponent,
    PageRibbonComponent,
    ActiveMenuDirective,
    ErrorComponent
} from './layouts';
import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';
import { AuthService } from './shared/auth/auth.service';
import { AuthModule, LogLevel, OidcSecurityService } from 'angular-auth-oidc-client';
import { environment } from '../environments/environment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EventManager } from './shared/auth/event-manager.service';

@NgModule({
    imports: [
        BrowserModule,
        LayoutRoutingModule,
        FontAwesomeModule,
        NgxWebstorageModule.forRoot(),
        SiglaSharedModule,
        SiglaHomeModule,
        SiglaAccountModule,
        SiglaEntityModule,
        SiglaWorkspaceModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        NgxCnrUictSsoModule,
        AuthModule.forRoot({
            config: {
              authority: environment.oidc.authority || window.location.origin,
              redirectUrl: environment.oidc.redirectUrl || window.location.origin,
              postLogoutRedirectUri: environment.oidc.postLogoutRedirectUri || window.location.origin,
              clientId: environment.oidc.clientId || 'clientId',
              scope: 'openid profile email offline_access',
              responseType: 'code',
              silentRenew: true,
              useRefreshToken: true,
              ignoreNonceAfterRefresh: true,
              autoUserInfo: false,
              disableIatOffsetValidation: true,
              logLevel: LogLevel.None,
            },
          }),
        // jhipster-needle-angular-add-module JHipster will add new module here
    ],
    declarations: [
        JhiMainComponent,
        NavbarComponent,
        ErrorComponent,
        PageRibbonComponent,
        ActiveMenuDirective,
        FooterComponent
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
            deps: [OidcSecurityService]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthExpiredInterceptor,
            multi: true,
            deps: [StateStorageService, Router, LoginService]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorHandlerInterceptor,
            multi: true,
            deps: [EventManager]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: NotificationInterceptor,
            multi: true,
            deps: [Injector]
        },
        PaginationConfig,
        UserRouteAccessService,
        ContextService,
        LocalStateStorageService,
        AuthService,
    ],
    bootstrap: [ JhiMainComponent ]
})
export class SiglaAppModule {}
// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
