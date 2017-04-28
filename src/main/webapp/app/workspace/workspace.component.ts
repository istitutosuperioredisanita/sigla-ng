import { Component, OnInit, Input, ElementRef, Renderer } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';
import { Observable } from 'rxjs/Rx';
import { WorkspaceService } from './workspace.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl, SafeHtml} from '@angular/platform-browser';
import { Leaf } from './leaf.model';

@Component({
    selector: 'jhi-workspace',
    templateUrl: './workspace.component.html',
    styles: ['#crudToolbar {padding-bottom: 10px;}']
})
export class WorkspaceComponent implements OnInit {
    account: Account;
    desktop: SafeHtml;
    leaf: Leaf;
    isRequesting: boolean;
    hidden: boolean;

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private principal: Principal,
        private workspaceService: WorkspaceService,
        private _sanitizer: DomSanitizer,
        private elementRef: ElementRef,
        private renderer: Renderer
    ) {
        this.jhiLanguageService.setLocations(['workspace']);
        renderer.listen(elementRef.nativeElement, 'submit', (event) => {
            return false;
        });
        renderer.listenGlobal('body', 'submitForm', (event) => {
            if (event.detail.comando) {
                let form = elementRef.nativeElement.querySelector('form');
                this.startRefreshing();
                this.workspaceService.postForm(form)
                    .subscribe(html => {
                        this.desktop = this._sanitizer.bypassSecurityTrustHtml(html);
                        this.stopRefreshing();
                    }
                );
            }
            return false;
        });

        workspaceService.isNavbarHidden()
          .subscribe(hidden => this.hidden = hidden);

    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
    }

    onNotify(nodo: any): void {
        this.leaf = nodo.leaf;
        this.startRefreshing();
        this.workspaceService.openMenu(nodo.id).subscribe(html => {
            this.desktop = this._sanitizer.bypassSecurityTrustHtml(html);
            this.stopRefreshing();
        });
    }

    private startRefreshing() {
        this.isRequesting = true;
    }

    private stopRefreshing() {
        this.isRequesting = false;
    }
}
