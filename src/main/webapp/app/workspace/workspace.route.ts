import { Route } from '@angular/router';

import { UserRouteAccessService } from '../shared';
import { WorkspaceComponent } from './workspace.component';

export const WORKSPACE_ROUTE: Route = {
    path: 'workspace',
    component: WorkspaceComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'global.menu.account.sessions'
    },
    canActivate: [UserRouteAccessService]
};
