import { NgModule, LOCALE_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { registerLocaleData } from '@angular/common';
import localeDeAt from '@angular/common/locales/it';

registerLocaleData(localeDeAt);

import {
    SiglaSharedLibsModule,
    LanguageHelper,
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
        LanguageHelper,
        Title,
        {
            provide: LOCALE_ID,
            useValue: 'it-IT'
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
