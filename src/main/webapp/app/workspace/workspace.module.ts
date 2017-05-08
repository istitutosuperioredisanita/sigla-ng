import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SiglaSharedModule, UserRouteAccessService } from '../shared';

import { WORKSPACE_ROUTE, WorkspaceComponent, WorkspaceService, SIGLATreeComponent } from './';

import { TreeModule } from 'angular-tree-component';

@NgModule({
    imports: [
        SiglaSharedModule,
        RouterModule.forRoot([ WORKSPACE_ROUTE ]),
        TreeModule
    ],
    declarations: [
        WorkspaceComponent,
        SIGLATreeComponent
    ],
    entryComponents: [
    ],
    providers: [
        WorkspaceService,
        UserRouteAccessService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SiglaWorkspaceModule {}
