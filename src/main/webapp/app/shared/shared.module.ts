import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthServerProvider } from './auth/auth-session.service';
import { AuthService } from './auth/auth.service';

import {
    SiglaSharedLibsModule,
    SiglaSharedCommonModule,
    CSRFService,
    AccountService,
    StateStorageService,
    LoginService,
    LoginModalService,
    MultipleUserModalService,
    MessaggiModalService,
    JhiLoginModalComponent,
    Principal,
    NotHaveAuthorityDirective,
    HasAnyAuthorityDirective,
    JhiMultipleUserModalComponent,
    JhiMessaggiModalComponent
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
        JhiMessaggiModalComponent,
        HasAnyAuthorityDirective,
        NotHaveAuthorityDirective,
        ContextComponent
    ],
    providers: [
        LoginService,
        LoginModalService,
        MultipleUserModalService,
        MessaggiModalService,
        AccountService,
        StateStorageService,
        Principal,
        CSRFService,
        AuthServerProvider,
        DatePipe,
        AuthService
    ],
    entryComponents: [JhiLoginModalComponent, JhiMultipleUserModalComponent, JhiMessaggiModalComponent],
    exports: [
        SiglaSharedCommonModule,
        JhiLoginModalComponent,
        JhiMultipleUserModalComponent,
        JhiMessaggiModalComponent,
        HasAnyAuthorityDirective,
        NotHaveAuthorityDirective,
        DatePipe,
        ContextComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class SiglaSharedModule {}
