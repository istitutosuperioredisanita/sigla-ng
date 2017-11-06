import './vendor.ts';

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Ng2Webstorage } from 'ng2-webstorage';

import { SiglaSharedModule, UserRouteAccessService } from './shared';
import { SiglaHomeModule } from './home/home.module';
import { SiglaAdminModule } from './admin/admin.module';
import { SiglaAccountModule } from './account/account.module';
import { SiglaEntityModule } from './entities/entity.module';
import { SiglaWorkspaceModule } from './workspace/workspace.module';

import { customHttpProvider } from './blocks/interceptor/http.provider';
import { PaginationConfig } from './blocks/config/uib-pagination.config';

// jhipster-needle-angular-add-module-import JHipster will add new module here
import { ContextService } from './context';
import { LocalStateStorageService } from './shared/auth/local-storage.service';

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

@NgModule({
    imports: [
        BrowserModule,
        LayoutRoutingModule,
        Ng2Webstorage.forRoot({ prefix: 'jhi', separator: '-'}),
        SiglaSharedModule,
        SiglaHomeModule,
        SiglaAdminModule,
        SiglaAccountModule,
        SiglaEntityModule,
        SiglaWorkspaceModule,
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
        ProfileService,
        customHttpProvider(),
        PaginationConfig,
        UserRouteAccessService,
        ContextService,
        LocalStateStorageService,
    ],
    bootstrap: [ JhiMainComponent ]
})
export class SiglaAppModule {}
