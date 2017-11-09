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
    styleUrls: [
        'workspace.css'
    ],
})
export class WorkspaceComponent implements OnInit, OnDestroy {
    account: Account;
    desktop: SafeHtml;
    leaf: Leaf;
    siglaPageTitle: string;
    isRequesting: boolean;
    hidden: boolean;
    logoVisible = true;
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
        this.listenerSubmit = renderer.listenGlobal('body', 'submit', (event) => {
            return false;
        });
        this.listenerSubmitForm = renderer.listenGlobal('body', 'submitForm', (event) => {
            if (event.detail.comando) {
                const form = event.detail.form;
                this.startRefreshing();
                this.workspaceService.postForm(form)
                    .subscribe((html) => {
                        this.renderHtml(html);
                        this.stopRefreshing();
                    }, (error) => {
                        this.stopRefreshing();
                    });
            }
            return false;
        });
        workspaceService.isMenuHidden()
          .subscribe((hidden) => this.hidden = hidden);
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
        if (this.leaf) {
            this.siglaPageTitle = this.leaf.breadcrumbS;
            this.startRefreshing();
            this.workspaceService.openMenu(nodo.id).subscribe((html) => {
                this.renderHtml(html);
                this.stopRefreshing();
            }, (error) => {
                this.stopRefreshing();
            });
        } else {
            this.desktop = null;
            this.logoVisible = true;
        }
    }

    private renderHtml(html: string) {
        const siglaScripts = this.scriptContainer.nativeElement.getElementsByTagName('script');
        for (const siglaScript of siglaScripts){
            this.scriptContainer.nativeElement.removeChild(siglaScript);
        }
        this.desktop = this._sanitizer.bypassSecurityTrustHtml(html);
        setTimeout(() => { // wait for DOM rendering
            const scripts = this.container.nativeElement.getElementsByTagName('script');
            for (const script of scripts){
                const s = document.createElement('script');
                s.type = 'text/javascript';
                if (script.text && !(
                    script.text.indexOf('baseTag') !== -1 ||
                    script.text.indexOf('document.write(document.title)') !== -1 ||
                    script.text.indexOf('window.top.AttendereText') !== -1 ||
                    script.text.indexOf('restoreWorkspace') !== -1)
                ) {
                    s.text = script.text;
                    if (this.scriptContainer) {
                        this.scriptContainer.nativeElement.appendChild(s);
                    }
                }
            }
            const siglaTitle = this.container.nativeElement.querySelector('title').innerHTML;
            const siglaPageTitle = this.container.nativeElement.querySelector('sigla-page-title');
            const form = this.container.nativeElement.querySelector('form');
            if (siglaPageTitle) {
                siglaPageTitle.innerHTML = this.leaf.breadcrumbS + ' - ' + siglaTitle + siglaPageTitle.innerHTML;
            }
            this.logoVisible = (
                form === null ||
                (form !== null && form.action.indexOf('GestioneUtente.do') !== -1)
            );
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
