import { Component, OnInit, Input } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';

@Component({
    selector: 'jhi-workspace',
    templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit {
    account: Account;

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private principal: Principal
    ) {
        this.jhiLanguageService.setLocations(['workspace']);
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
    }

}
