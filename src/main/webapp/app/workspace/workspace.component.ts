import { Component, OnInit, Input } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';
import { Observable } from 'rxjs/Rx';
import { WorkspaceService } from './workspace.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl, SafeHtml} from '@angular/platform-browser';

@Component({
    selector: 'jhi-workspace',
    templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit {
    account: Account;
    desktop: SafeHtml;

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private principal: Principal,
        private workspaceService: WorkspaceService,
        private _sanitizer: DomSanitizer
    ) {
        this.jhiLanguageService.setLocations(['workspace']);
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
    }

    onNotify(nodoid: string): void {
        this.workspaceService.invoke(nodoid).subscribe(html =>
            this.desktop = this._sanitizer.bypassSecurityTrustHtml(html)
        );
    }
}
