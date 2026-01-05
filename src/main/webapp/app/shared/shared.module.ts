import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthServerProvider } from './auth/auth-session.service';
import { AuthService } from './auth/auth.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

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
    JhiMessaggiModalComponent,
} from './';
import {ContextComponent} from '../context';
import { TranslateDirective } from './language/translate.directive';

@NgModule({
    imports: [
        SiglaSharedLibsModule,
        SiglaSharedCommonModule,
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    ],
    declarations: [
        TranslateDirective,
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
    exports: [
        TranslateDirective,
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
// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http);
}
