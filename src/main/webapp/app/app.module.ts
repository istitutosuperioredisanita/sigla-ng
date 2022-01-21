import './vendor.ts';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JhiEventManager } from 'ng-jhipster';
import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { SiglaSharedModule, StateStorageService, UserRouteAccessService } from './shared';
import { SiglaHomeModule } from './home/home.module';
import { SiglaAdminModule } from './admin/admin.module';
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
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';

@NgModule({
    imports: [
        BrowserModule,
        LayoutRoutingModule,
        NgxWebstorageModule.forRoot({ prefix: 'jhi', separator: '-'}),
        SiglaSharedModule,
        SiglaHomeModule,
        SiglaAdminModule,
        SiglaAccountModule,
        SiglaEntityModule,
        SiglaWorkspaceModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
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
            useClass: AuthExpiredInterceptor,
            multi: true,
            deps: [StateStorageService, Injector]
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
    ],
    bootstrap: [ JhiMainComponent ]
})
export class SiglaAppModule {}
// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http);
}
