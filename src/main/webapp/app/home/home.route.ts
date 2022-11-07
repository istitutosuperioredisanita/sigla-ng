import { Route } from '@angular/router';
import { HomeComponent } from './';
import { environment } from '../../environments/environment';
import { AutoLoginAllRoutesGuard } from 'angular-auth-oidc-client';

export const HOME_ROUTE: Route = {
    path: '',
    component: HomeComponent,
    data: {
        authorities: [],
        pageTitle: 'home.title'
    },
    canActivate: environment.oidc.enable ? [AutoLoginAllRoutesGuard] : []
};
