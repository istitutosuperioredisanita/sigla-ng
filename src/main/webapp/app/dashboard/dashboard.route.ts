import { Route } from '@angular/router';
import { UserRouteAccessService } from '../shared';
import { DashBoardComponent } from './dashboard.component';
import { environment } from '../../environments/environment';
import { AutoLoginAllRoutesGuard } from 'angular-auth-oidc-client';
import { IndiceTempestivitaPagamentiComponent } from './indice-tempestivita-pagamenti/indice-tempestivita-pagamenti.component';

export const DASHBOARD_ROUTE: Route = {
    path: 'dashboard',
    component: DashBoardComponent,
    data: {
        authorities: ['APPLICATION_ROLE_SUPER'],
        pageTitle: 'global.menu.dashboard'
    },
    canActivate: ((environment.oidc.enable  === 'true') ? true : false) ? [AutoLoginAllRoutesGuard] : [UserRouteAccessService],
};

export const INDICE_TEMPESTIVITA_PAGAMENTI_ROUTE: Route = {
    path: 'indice-tempestivita-pagamenti',
    component: IndiceTempestivitaPagamentiComponent,
    data: {
        authorities: ['APPLICATION_ROLE_SUPER'],
        pageTitle: 'global.menu.dashboard'
    },
    canActivate: ((environment.oidc.enable  === 'true') ? true : false) ? [AutoLoginAllRoutesGuard] : [UserRouteAccessService],
};