import { Component, OnInit } from '@angular/core';
import { IndirizziMail, ContextService } from '../../context/index';
import { Principal, LanguageHelper } from '../../shared';
import { FORM_STATUS } from '../../shared';
import { AlertService } from '../../shared/alert/alert.service';

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
    public formStatus: number;

    constructor(
        private principal: Principal,
        private languageHelper: LanguageHelper,
        private alertService: AlertService,
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
        this.formStatus = FORM_STATUS.UNDEFINED;
    }

    newIndirizzoMail() {
        this.currentIndirizzoMail = new IndirizziMail(
            null, null, false, false, false, false, false, false, false, false, null, 1
        );
    }

    save() {
        this.contextService.postIndirizziMail(
            this.indirizziMail
        ).subscribe((indirizzi: IndirizziMail[]) => {
            this.indirizziMail = indirizzi;
            this.newIndirizzoMail();
            this.formStatus = FORM_STATUS.UNDEFINED;
            this.alertService.info('global.messages.info.success');
        }, (error) => {
            if (error.status === 409) {
                this.alertService.error('global.messages.error.duplicatekey', error.error);
            }
            this.success = null;
            this.error = 'ERROR';
        });
    }

    newRow() {
        const email = this.indirizziMail.filter((indirizzo: IndirizziMail) => {
            return indirizzo.indirizzo_mail === this.settingsAccount.email;
        }).length === 0 ? this.settingsAccount.email : null;
        const indirizzoMail = new IndirizziMail(
            this.settingsAccount.username, email, false, false, false, false, false, false, false, false, 1, 1
        );
        this.indirizziMail.push(indirizzoMail);
        this.currentIndirizzoMail = indirizzoMail;
        this.formStatus = FORM_STATUS.INSERT;
    }

    undoEditing() {
        this.formStatus = FORM_STATUS.UNDEFINED;
        this.currentIndirizzoMail.crudStatus = 5;
        const index: number = this.indirizziMail.indexOf(this.currentIndirizzoMail);
        if (index !== -1) {
            this.indirizziMail.splice(index, 1);
        }
        this.newIndirizzoMail();
    }

    deleteRows() {
        const indirizzi = this.indirizziMail.filter((indirizzo) => {
            return indirizzo.checked;
        }).map((key) => {
            return key.indirizzo_mail;
        });
        if (indirizzi.length === 0) {
            this.alertService.error('global.messages.error.norowsselected');
        } else {
            if (window.confirm('Vuoi confermare la cancellazione?')) {
                this.contextService.deleteIndirizziEmail(indirizzi).subscribe((result: IndirizziMail[]) => {
                    this.indirizziMail = result;
                    this.newIndirizzoMail();
                    this.alertService.info('global.messages.info.success');
                });
            }
        }
    }

    setClickedRow(currentIndirizzoMail: IndirizziMail) {
        if (!this.isFormInserting()) {
            this.currentIndirizzoMail = currentIndirizzoMail;
            this.currentIndirizzoMail.crudStatus = 2;
        }
    }

    selectAll() {
        this.indirizziMail.forEach((indirizzoMail) => {
            indirizzoMail.checked = !indirizzoMail.checked;
        });
    }

    isDisabled(): boolean {
        return this.currentIndirizzoMail.cd_utente == null;
    }

    isFormInserting(): boolean {
        return this.formStatus === FORM_STATUS.INSERT;
    }

    copyAccount(account) {
        return {
            activated: account.activated,
            username: account.username,
            email: account.email,
            firstName: account.firstName,
            langKey: account.langKey,
            lastName: account.lastName,
            login: account.login,
            imageUrl: account.imageUrl
        };
    }
}
