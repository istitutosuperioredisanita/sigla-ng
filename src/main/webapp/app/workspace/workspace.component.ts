import { Component, OnInit, Input, ElementRef, Renderer } from '@angular/core';
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
        private _sanitizer: DomSanitizer,
        private elementRef: ElementRef,
        private renderer: Renderer
    ) {
        this.jhiLanguageService.setLocations(['workspace']);
        renderer.listenGlobal('body', 'submit', (event) => {
            this.workspaceService.postForm(event.target, new FormData(elementRef.nativeElement.querySelector('form')))
                .subscribe(html => {
                    this.desktop = this._sanitizer.bypassSecurityTrustHtml(html);
                }
            );
            return false;
        });
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
    }

    onNotify(nodoid: string): void {
        this.workspaceService.openMenu(nodoid).subscribe(html =>
            this.desktop = this._sanitizer.bypassSecurityTrustHtml(html)
        );
    }
}
