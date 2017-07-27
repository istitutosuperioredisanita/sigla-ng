import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CookieService } from 'angular2-cookie/services/cookies.service';
import {
    SiglaSharedLibsModule,
    SiglaSharedCommonModule,
    CSRFService,
    AuthService,
    AuthServerProvider,
    AccountService,
    UserService,
    StateStorageService,
    LoginService,
    LoginModalService,
    MultipleUserModalService,
    Principal,
    HasAnyAuthorityDirective,
    NotHaveAuthorityDirective,
    JhiLoginModalComponent,
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
        CookieService,
        LoginService,
        LoginModalService,
        MultipleUserModalService,
        AccountService,
        StateStorageService,
        Principal,
        CSRFService,
        AuthServerProvider,
        AuthService,
        UserService,
        DatePipe
    ],
    entryComponents: [JhiMultipleUserModalComponent],
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
