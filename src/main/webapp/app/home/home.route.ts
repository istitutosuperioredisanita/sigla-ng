import { Route, Routes } from '@angular/router';
import { HomeComponent } from './';
import { environment } from '../../environments/environment';
import { AutoLoginAllRoutesGuard } from 'angular-auth-oidc-client';

export const HOME_ROUTE: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        data: {
            authorities: [],
            pageTitle: 'home.title'
        },
        canActivate: ((environment.oidc.enable  === 'true') ? true : false) ? [AutoLoginAllRoutesGuard] : []
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    }
];
