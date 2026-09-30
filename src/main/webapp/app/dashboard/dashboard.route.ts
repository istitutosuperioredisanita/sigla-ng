import { Route } from '@angular/router';
import { UserRouteAccessService } from '../shared';
import { DashBoardComponent } from './dashboard.component';
import { environment } from '../../environments/environment';
import { AutoLoginAllRoutesGuard } from 'angular-auth-oidc-client';
import { IndiceTempestivitaPagamentiComponent } from './indice-tempestivita-pagamenti/indice-tempestivita-pagamenti.component';
import { AcquistiStrutturaComponent } from './acquisti-struttura/acquisti-struttura.component';
import { AcquistiStatoComponent } from './acquisti-stato/acquisti-stato.component';
import { FondiFunzionamentoComponent } from './progetti/fondi-funzionamento.component';

export const DASHBOARD_ROUTE: Route = {
    path: 'dashboard',
    component: DashBoardComponent,
    data: {
        authorities: ['APPLICATION_ROLE_SUPER'],
        pageTitle: 'global.menu.dashboard',
        menu: 'dashboard'
    },
    canActivate: ((environment.oidc.enable  === 'true') ? true : false) ? [AutoLoginAllRoutesGuard] : [UserRouteAccessService],
};

export const INDICE_TEMPESTIVITA_PAGAMENTI_ROUTE: Route = {
    path: 'indice-tempestivita-pagamenti',
    component: IndiceTempestivitaPagamentiComponent,
    data: {
        authorities: ['APPLICATION_ROLE_SUPER'],
        pageTitle: 'global.menu.indice-tempestivita-pagamenti',
        menu: 'dashboard'
    },
    canActivate: ((environment.oidc.enable  === 'true') ? true : false) ? [AutoLoginAllRoutesGuard] : [UserRouteAccessService],
};

export const ACQUISTI_STRUTTURA_ROUTE: Route = {
    path: 'acquisti-struttura',
    component: AcquistiStrutturaComponent,
    data: {
        authorities: ['APPLICATION_ROLE_SUPER'],
        pageTitle: 'global.menu.acquisti-struttura',
        menu: 'dashboard'
    },
    canActivate: ((environment.oidc.enable  === 'true') ? true : false) ? [AutoLoginAllRoutesGuard] : [UserRouteAccessService],
};

export const ACQUISTI_STATO_ROUTE: Route = {
    path: 'acquisti-stato',
    component: AcquistiStatoComponent,
    data: {
        authorities: ['APPLICATION_ROLE_SUPER'],
        pageTitle: 'global.menu.acquisti-stato',
        menu: 'dashboard'
    },
    canActivate: ((environment.oidc.enable  === 'true') ? true : false) ? [AutoLoginAllRoutesGuard] : [UserRouteAccessService],
};

export const FONDI_FUNZIONAMENTO_UO: Route = {
    path: 'progetti/fondi-funzionamento/uo',
    component: FondiFunzionamentoComponent,
    data: {
        authorities: ['APPLICATION_ROLE_SUPER'],
        pageTitle: 'global.menu.progetti.fondi-funzionamento.uo',
        menu: 'dashboard',
        dimensione: 'uo'
    },
    canActivate: ((environment.oidc.enable  === 'true') ? true : false) ? [AutoLoginAllRoutesGuard] : [UserRouteAccessService],
};
export const FONDI_FUNZIONAMENTO_TIPO_FINANZIAMENTO: Route = {
    path: 'progetti/fondi-funzionamento/tipo-finanziamento',
    component: FondiFunzionamentoComponent,
    data: {
        authorities: ['APPLICATION_ROLE_SUPER'],
        pageTitle: 'global.menu.progetti.fondi-funzionamento.tipo-finanziamento',
        menu: 'dashboard',
        dimensione: 'tipo-finanziamento'
    },
    canActivate: ((environment.oidc.enable  === 'true') ? true : false) ? [AutoLoginAllRoutesGuard] : [UserRouteAccessService],
};
export const FONDI_FUNZIONAMENTO_ENTE_FINANZIATORE: Route = {
    path: 'progetti/fondi-funzionamento/ente-finanziatore',
    component: FondiFunzionamentoComponent,
    data: {
        authorities: ['APPLICATION_ROLE_SUPER'],
        pageTitle: 'global.menu.progetti.fondi-funzionamento.ente-finanziatore',
        menu: 'dashboard',
        dimensione: 'ente-finanziatore'
    },
    canActivate: ((environment.oidc.enable  === 'true') ? true : false) ? [AutoLoginAllRoutesGuard] : [UserRouteAccessService],
};