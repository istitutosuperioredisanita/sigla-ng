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
    Principal,
    HasAnyAuthorityDirective,
    NotHaveAuthorityDirective,
    JhiLoginModalComponent,
    EventsService
} from './';
import {ContextComponent} from '../context';

@NgModule({
    imports: [
        SiglaSharedLibsModule,
        SiglaSharedCommonModule
    ],
    declarations: [
        JhiLoginModalComponent,
        HasAnyAuthorityDirective,
        NotHaveAuthorityDirective,
        ContextComponent
    ],
    providers: [
        CookieService,
        LoginService,
        LoginModalService,
        AccountService,
        StateStorageService,
        Principal,
        CSRFService,
        AuthServerProvider,
        AuthService,
        UserService,
        DatePipe,
        EventsService
    ],
    entryComponents: [JhiLoginModalComponent],
    exports: [
        SiglaSharedCommonModule,
        JhiLoginModalComponent,
        HasAnyAuthorityDirective,
        NotHaveAuthorityDirective,
        DatePipe,
        ContextComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class SiglaSharedModule {}
