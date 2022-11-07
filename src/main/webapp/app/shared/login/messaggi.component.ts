import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiLanguageService } from 'ng-jhipster';
import { Account, Principal} from '../';
import { Messaggio } from '../../context/messaggio.model';
import { ContextService } from '../../context/context.service';
import { LoginService } from '../login/login.service';

@Component({
    selector: 'jhi-messaggi-modal',
    templateUrl: './messaggi.component.html',
    styles: [`
        .mh-45-vh {
            max-height: 45vh;
        }
    `]
})
export class JhiMessaggiModalComponent {
    public account: Account;
    public page: string;
    public currentMessaggio: Messaggio;

    constructor(
        private languageService: JhiLanguageService,
        private loginService: LoginService,
        private principal: Principal,
        public activeModal: NgbActiveModal,
        public contextService: ContextService
    ) {
        this.principal.identity().then((account) => {
            this.account = account;
        });
        this.newMessaggio();
    }

    newMessaggio() {
        this.currentMessaggio = new Messaggio(0, false, null, null, null, null, null, null);
    }

    setClickedRow(messaggio: Messaggio) {
        this.currentMessaggio = messaggio;
    }

    selectAll() {
        this.contextService.messaggi.forEach((messaggio) => {
            if (messaggio.cd_utente !== null) {
                messaggio.checked = !messaggio.checked;
            }
        });
    }

    deleteCurrentMessaggio() {
        this.contextService.deleteMessaggi(
            this.contextService.messaggi.filter((messaggio) => {
                return messaggio.pg_messaggio === this.currentMessaggio.pg_messaggio;
            })
        ).subscribe((messaggi) => {
            this.contextService.messaggi = messaggi;
            this.newMessaggio();
        });
    }

    deleteMessaggiSelezionati() {
        this.contextService.deleteMessaggi(
            this.contextService.messaggi.filter((messaggio) => {
                return messaggio.checked;
            })
        ).subscribe((messaggi) => {
            this.contextService.messaggi = messaggi;
            this.newMessaggio();
        });
    }

    confirm() {
        this.activeModal.dismiss('cancel');
    }
}
