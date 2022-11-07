import { Route } from '@angular/router';
import { UserRouteAccessService } from '../shared';
import { WorkspaceComponent } from './workspace.component';
import { environment } from '../../environments/environment';
import { AutoLoginAllRoutesGuard } from 'angular-auth-oidc-client';

export const WORKSPACE_ROUTE: Route = {
    path: 'workspace',
    component: WorkspaceComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'global.menu.workspace'
    },
    canActivate: ((environment.oidc.enable  === 'true') ? true : false) ? [AutoLoginAllRoutesGuard] : [UserRouteAccessService]
};
