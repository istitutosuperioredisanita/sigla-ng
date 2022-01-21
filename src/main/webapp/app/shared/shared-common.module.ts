import { NgModule, LOCALE_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';

import {
    SiglaSharedLibsModule,
    JhiLanguageHelper,
    FindLanguageFromKeyPipe,
    FindLanguagePipe,
    JhiAlertComponent,
    JhiAlertErrorComponent
} from './';

@NgModule({
    imports: [
        SiglaSharedLibsModule,
    ],
    declarations: [
        FindLanguageFromKeyPipe,
        FindLanguagePipe,
        JhiAlertComponent,
        JhiAlertErrorComponent
    ],
    providers: [
        JhiLanguageHelper,
        Title,
        {
            provide: LOCALE_ID,
            useValue: 'it'
        },
    ],
    exports: [
        SiglaSharedLibsModule,
        FindLanguageFromKeyPipe,
        FindLanguagePipe,
        JhiAlertComponent,
        JhiAlertErrorComponent
    ]
})
export class SiglaSharedCommonModule {}
