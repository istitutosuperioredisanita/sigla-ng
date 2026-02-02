import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SiglaSharedModule, UserRouteAccessService } from '../shared';

import { ACQUISTI_STATO_ROUTE, ACQUISTI_STRUTTURA_ROUTE, DASHBOARD_ROUTE, DashBoardComponent, INDICE_TEMPESTIVITA_PAGAMENTI_ROUTE} from './index';

import { TreeModule, TreeDraggedElement } from '@ali-hm/angular-tree-component';
import { AngularSplitModule } from 'angular-split';
import { IndiceTempestivitaPagamentiComponent } from './indice-tempestivita-pagamenti/indice-tempestivita-pagamenti.component';
import { IndiceTempestivitaPagamentiService } from './indice-tempestivita-pagamenti/indice-tempestivita-pagamenti.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { AcquistiStrutturaComponent } from './acquisti-struttura/acquisti-struttura.component';
import { AcquistiStrutturaService } from './acquisti-struttura/acquisti-struttura.service';
import { AcquistiStatoComponent } from './acquisti-stato/acquisti-stato.component';
import { AcquistiStatoService } from './acquisti-stato/acquisti-stato.service';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        SiglaSharedModule,
        RouterModule.forRoot([
            DASHBOARD_ROUTE, 
            INDICE_TEMPESTIVITA_PAGAMENTI_ROUTE, 
            ACQUISTI_STRUTTURA_ROUTE,
            ACQUISTI_STATO_ROUTE
        ], { useHash: true }),
        TreeModule,
        AngularSplitModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    ],
    declarations: [
        DashBoardComponent,
        IndiceTempestivitaPagamentiComponent,
        AcquistiStrutturaComponent,
        AcquistiStatoComponent,
    ],
    providers: [
        IndiceTempestivitaPagamentiService,
        AcquistiStrutturaService,
        AcquistiStatoService,
        UserRouteAccessService,
        TreeDraggedElement
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SiglaDashboardModule {}
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http);
}
