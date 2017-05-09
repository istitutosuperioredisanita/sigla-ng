import { Routes, CanActivate } from '@angular/router';
import { WORKSPACE_ROUTE } from '../workspace';
import { UserRouteAccessService } from '../shared';

import {
    activateRoute,
    passwordRoute,
    passwordResetFinishRoute,
    passwordResetInitRoute,
    registerRoute,
    sessionsRoute,
    settingsRoute
} from './';

let ACCOUNT_ROUTES = [
   activateRoute,
   passwordRoute,
   passwordResetFinishRoute,
   passwordResetInitRoute,
   registerRoute,
   sessionsRoute,
   settingsRoute,
   WORKSPACE_ROUTE
];

export const accountState: Routes = [{
    path: '',
    children: ACCOUNT_ROUTES
}];
