import './vendor.ts';

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { Ng2Webstorage } from 'ng2-webstorage';

import { SiglaSharedModule, UserRouteAccessService} from './shared';
import { SiglaHomeModule } from './home/home.module';
import { SiglaAdminModule } from './admin/admin.module';
import { SiglaAccountModule } from './account/account.module';
import { SiglaEntityModule } from './entities/entity.module';
import { SiglaWorkspaceModule } from './workspace/workspace.module';

import { NavbarService } from './layouts';
import { LayoutRoutingModule } from './layouts';
import { customHttpProvider } from './blocks/interceptor/http.provider';
import { PaginationConfig } from './blocks/config/uib-pagination.config';
import { ContextService } from './context';
import { LocalStateStorageService } from './shared/auth/local-storage.service';

import {
    JhiMainComponent,
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
        SiglaWorkspaceModule
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
        { provide: Window, useValue: window },
        { provide: Document, useValue: document },
        customHttpProvider(),
        PaginationConfig,
        UserRouteAccessService,
        ContextService,
        LocalStateStorageService,
        NavbarService
    ],
    bootstrap: [ JhiMainComponent ]
})
export class SiglaAppModule {}
