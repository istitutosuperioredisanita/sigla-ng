import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Account, Principal} from '../';
import { AuthServerProvider } from '../auth/auth-session.service';
import { LocalStateStorageService } from '../auth/local-storage.service';

@Component({
    selector: 'jhi-multiple-user-modal',
    templateUrl: './multiple-user.component.html'
})
export class JhiMultipleUserModalComponent implements OnInit {
    public account: Account;
    public selectedUser: string;
    public page: string;
    public isRequesting = false;

    constructor(
        private authServerProvider: AuthServerProvider,
        private localStateStorageService: LocalStateStorageService,
        private router: Router,
        private principal: Principal,
        public activeModal: NgbActiveModal
    ) {
        this.principal.identity().then((account) => {
            this.account = account;
        });
    }

    ngOnInit() {
        this.selectedUser = this.account.username;
    }

    confirm() {
        this.isRequesting = true;
        this.authServerProvider.loginMultiploWildfly(
            this.selectedUser,
            this.localStateStorageService.getUserContext(this.selectedUser),
            this.account.access_token).subscribe(() => {
                this.principal.identity(true, this.selectedUser).then((account) => {
                    if (this.localStateStorageService.getUserContext(account.username).cds) {
                        this.router.navigate([this.page]);
                    }
                    this.isRequesting = false;
                    this.activeModal.dismiss('cancel');
                });
        });
    }
}
