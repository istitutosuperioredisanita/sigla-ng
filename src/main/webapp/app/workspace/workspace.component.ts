import { Component, OnInit, Input, ElementRef, Renderer, ViewChild, Inject } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';
import { Observable } from 'rxjs/Rx';
import { WorkspaceService } from './workspace.service';
import { DomSanitizer, SafeResourceUrl, SafeScript, SafeHtml} from '@angular/platform-browser';
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
    siglaPageTitle: string;
    isRequesting: boolean;
    hidden: boolean;
    @ViewChild('htmlContainer') container: ElementRef;

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
                        this.renderHtml(html);
                        this.stopRefreshing();
                    }
                );
            }
            return false;
        });
        workspaceService.isMenuHidden()
          .subscribe(hidden => this.hidden = hidden);
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
    }

    onNotify(nodo: any): void {
        this.leaf = nodo.leaf;
        this.siglaPageTitle = this.leaf.breadcrumbS;
        this.startRefreshing();
        this.workspaceService.openMenu(nodo.id).subscribe(html => {
            this.renderHtml(html);
            this.stopRefreshing();
        });
    }

    private renderHtml(html: string) {
        let siglaScript = document.head.children.namedItem('siglaScript');
        if (siglaScript) {
            document.head.removeChild(siglaScript);
        }
        this.desktop = this._sanitizer.bypassSecurityTrustHtml(html);
        setTimeout(() => { // wait for DOM rendering
            let s = document.createElement('script');
            s.type = 'text/javascript';
            s.id = 'siglaScript';
            let scripts = this.container.nativeElement.getElementsByTagName('script');
            for (let script of scripts){
                if (script.text && script.text.indexOf('baseTag') === -1) {
                    s.text = script.text;
                    document.head.appendChild(s);
                }
            }
            let siglaPageTitle = this.container.nativeElement.getElementsByTagName('sigla-page-title')[0].innerHTML;
            this.siglaPageTitle = this.leaf.breadcrumbS + siglaPageTitle;
        });
    }

    private startRefreshing() {
        this.isRequesting = true;
    }

    private stopRefreshing() {
        this.isRequesting = false;
    }
}
