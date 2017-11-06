import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthServerProvider } from './auth/auth-session.service';

import {
    SiglaSharedLibsModule,
    SiglaSharedCommonModule,
    CSRFService,
    AccountService,
    UserService,
    StateStorageService,
    LoginService,
    LoginModalService,
    MultipleUserModalService,
    JhiLoginModalComponent,
    Principal,
    NotHaveAuthorityDirective,
    HasAnyAuthorityDirective,
    JhiMultipleUserModalComponent
} from './';
import {ContextComponent} from '../context';

@NgModule({
    imports: [
        SiglaSharedLibsModule,
        SiglaSharedCommonModule
    ],
    declarations: [
        JhiLoginModalComponent,
        JhiMultipleUserModalComponent,
        HasAnyAuthorityDirective,
        NotHaveAuthorityDirective,
        ContextComponent
    ],
    providers: [
        LoginService,
        LoginModalService,
        MultipleUserModalService,
        AccountService,
        StateStorageService,
        Principal,
        CSRFService,
        AuthServerProvider,
        UserService,
        DatePipe
    ],
    entryComponents: [JhiLoginModalComponent, JhiMultipleUserModalComponent],
    exports: [
        SiglaSharedCommonModule,
        JhiLoginModalComponent,
        JhiMultipleUserModalComponent,
        HasAnyAuthorityDirective,
        NotHaveAuthorityDirective,
        DatePipe,
        ContextComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class SiglaSharedModule {}
