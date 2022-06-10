import './vendor.ts';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JhiEventManager } from 'ng-jhipster';
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
    ProfileService,
    PageRibbonComponent,
    ActiveMenuDirective,
    ErrorComponent
} from './layouts';
import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';
import { AuthService } from './shared/auth/auth.service';

@NgModule({
    imports: [
        BrowserModule,
        LayoutRoutingModule,
        NgxWebstorageModule.forRoot({ prefix: 'jhi', separator: '-'}),
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
            deps: [AuthService]
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
            deps: [JhiEventManager]
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: NotificationInterceptor,
            multi: true,
            deps: [Injector]
        },
        ProfileService,
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
