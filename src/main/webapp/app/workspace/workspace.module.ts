import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SiglaSharedModule } from '../shared';

import { WORKSPACE_ROUTE, WorkspaceComponent } from './';

@NgModule({
    imports: [
        SiglaSharedModule,
        RouterModule.forRoot([ WORKSPACE_ROUTE ], { useHash: true })
    ],
    declarations: [
        WorkspaceComponent
    ],
    entryComponents: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SiglaWorkspaceModule {}
