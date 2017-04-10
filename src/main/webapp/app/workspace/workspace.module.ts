import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SiglaSharedModule } from '../shared';

import { WORKSPACE_ROUTE, WorkspaceComponent, WorkspaceService, TreeComponent, TreeLeafComponent } from './';

import { TreeModule } from 'angular-tree-component';

@NgModule({
    imports: [
        SiglaSharedModule,
        RouterModule.forRoot([ WORKSPACE_ROUTE ], { useHash: true }),
        TreeModule
    ],
    declarations: [
        WorkspaceComponent,
        TreeComponent,
        TreeLeafComponent
    ],
    entryComponents: [
    ],
    providers: [
        WorkspaceService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SiglaWorkspaceModule {}
