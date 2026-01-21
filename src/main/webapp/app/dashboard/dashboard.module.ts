import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SiglaSharedModule, UserRouteAccessService } from '../shared';

import { DASHBOARD_ROUTE, DashBoardComponent} from './index';

import { TreeModule, TreeDraggedElement } from '@ali-hm/angular-tree-component';
import { AngularSplitModule } from 'angular-split';
import { IndiceTempestivitaPagamentiComponent } from './indice-tempestivita-pagamenti/indice-tempestivita-pagamenti.component';
import { IndiceTempestivitaPagamentiService } from './indice-tempestivita-pagamenti/indice-tempestivita-pagamenti.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        SiglaSharedModule,
        RouterModule.forRoot([DASHBOARD_ROUTE], { useHash: true }),
        TreeModule,
        AngularSplitModule
    ],
    declarations: [
        DashBoardComponent,
        IndiceTempestivitaPagamentiComponent
    ],
    providers: [
        IndiceTempestivitaPagamentiService,
        UserRouteAccessService,
        TreeDraggedElement
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SiglaDashboardModule {}
