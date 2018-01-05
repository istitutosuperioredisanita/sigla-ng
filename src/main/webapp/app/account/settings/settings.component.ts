import { Component, OnInit } from '@angular/core';
import { JhiLanguageService, JhiAlertService } from 'ng-jhipster';
import { IndirizziMail, ContextService } from '../../context/index';
import { Principal, AccountService, JhiLanguageHelper } from '../../shared';
import { WorkspaceService } from '../../workspace/workspace.service';

@Component({
    selector: 'jhi-settings',
    templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
    error: string;
    success: string;
    settingsAccount: any;
    languages: any[];
    indirizziMail: IndirizziMail[];
    public currentIndirizzoMail: IndirizziMail;

    constructor(
        private account: AccountService,
        private principal: Principal,
        private languageService: JhiLanguageService,
        private languageHelper: JhiLanguageHelper,
        private workspaceService: WorkspaceService,
        private alertService: JhiAlertService,
        private contextService: ContextService
    ) {
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.settingsAccount = this.copyAccount(account);
        });
        this.languageHelper.getAll().then((languages) => {
            this.languages = languages;
        });
        this.contextService.getIndirizziMail().subscribe((indirizziMail) => {
            this.indirizziMail = indirizziMail;
        });
        this.newIndirizzoMail();
    }

    newIndirizzoMail() {
        this.currentIndirizzoMail = new IndirizziMail({cdUtente: null, indirizzoMail: null}, null, null, null, null, null, null, null, null, null);
    }

    save() {
        this.account.save(this.settingsAccount).subscribe(() => {
            this.error = null;
            this.success = 'OK';
            this.principal.identity(true).then((account) => {
                this.settingsAccount = this.copyAccount(account);
            });
            this.languageService.getCurrent().then((current) => {
                if (this.settingsAccount.langKey !== current) {
                    this.languageService.changeLanguage(this.settingsAccount.langKey);
                }
            });
        }, () => {
            this.success = null;
            this.error = 'ERROR';
        });
    }

    setClickedRow(currentIndirizzoMail: IndirizziMail) {
        this.currentIndirizzoMail = currentIndirizzoMail;
    }

    selectAll() {
        this.indirizziMail.forEach((indirizzoMail) => {
            indirizzoMail.checked = !indirizzoMail.checked;
        });
    }

    copyAccount(account) {
        return {
            activated: account.activated,
            email: account.email,
            firstName: account.firstName,
            langKey: account.langKey,
            lastName: account.lastName,
            login: account.login,
            imageUrl: account.imageUrl
        };
    }
}
