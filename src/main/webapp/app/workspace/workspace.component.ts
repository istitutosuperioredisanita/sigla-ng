import { Component, OnInit, OnDestroy, Input, ElementRef, Renderer, ViewChild, Inject } from '@angular/core';
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
export class WorkspaceComponent implements OnInit, OnDestroy {
    account: Account;
    desktop: SafeHtml;
    leaf: Leaf;
    siglaPageTitle: string;
    isRequesting: boolean;
    hidden: boolean;
    listenerSubmit: Function;
    listenerSubmitForm: Function;
    @ViewChild('htmlContainer') container: ElementRef;
    @ViewChild('scriptContainer') scriptContainer: ElementRef;

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private principal: Principal,
        private workspaceService: WorkspaceService,
        private _sanitizer: DomSanitizer,
        private elementRef: ElementRef,
        private renderer: Renderer
    ) {
        this.jhiLanguageService.setLocations(['workspace']);
        this.listenerSubmit = renderer.listenGlobal('body', 'submit', (event) => {
            return false;
        });
        this.listenerSubmitForm = renderer.listenGlobal('body', 'submitForm', (event) => {
            if (event.detail.comando) {
                let form = event.detail.form;
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

    ngOnDestroy() {
        this.listenerSubmit();
        this.listenerSubmitForm();
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
        let siglaScripts = this.scriptContainer.nativeElement.getElementsByTagName('script');
        for (let siglaScript of siglaScripts){
            this.scriptContainer.nativeElement.removeChild(siglaScript);
        }
        this.desktop = this._sanitizer.bypassSecurityTrustHtml(html);
        setTimeout(() => { // wait for DOM rendering
            let scripts = this.container.nativeElement.getElementsByTagName('script');
            for (let script of scripts){
                let s = document.createElement('script');
                s.type = 'text/javascript';
                if (script.text && script.text.indexOf('baseTag') === -1) {
                    s.text = script.text;
                    this.scriptContainer.nativeElement.appendChild(s);
                }
            }
            let siglaTitle = this.container.nativeElement.getElementsByTagName('title')[0].innerHTML;
            let siglaPageTitle = this.container.nativeElement.getElementsByTagName('sigla-page-title')[0].innerHTML;
            this.container.nativeElement
                .getElementsByTagName('sigla-page-title')[0].innerHTML = this.leaf.breadcrumbS + ' - ' + siglaTitle + siglaPageTitle;
        });
    }

    private startRefreshing() {
        this.isRequesting = true;
        document.body.classList.add('cursor-wait');
    }

    private stopRefreshing() {
        this.isRequesting = false;
        document.body.classList.remove('cursor-wait');
    }
}
