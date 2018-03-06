import { Component, OnInit, OnDestroy, Input, ElementRef, Renderer, ViewChild, Inject } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';
import { Observable } from 'rxjs/Rx';
import { WorkspaceService } from './workspace.service';
import { DomSanitizer, SafeResourceUrl, SafeScript, SafeHtml} from '@angular/platform-browser';
import { Leaf } from './leaf.model';
import * as moment from 'moment';
import 'pikaday';
declare var Pikaday;

@Component({
    selector: 'jhi-workspace',
    templateUrl: './workspace.component.html',
    styleUrls: [
        'workspace.css'
    ],
})
export class WorkspaceComponent implements OnInit, OnDestroy {
    account: Account;
    desktop: SafeHtml = '';
    leaf: Leaf;
    siglaPageTitle: string;
    isRequesting: boolean;
    hidden: boolean;
    logoVisible = true;
    listenerSubmit: Function;
    listenerSubmitForm: Function;
    picks = [];
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
        for (const pick of this.picks){
            document.body.removeChild(pick.el);
        }
        this.picks = [];
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
            const siglaTitle = this.container.nativeElement.querySelector('title');
            const siglaPageTitle = this.container.nativeElement.querySelector('sigla-page-title');
            const form = this.container.nativeElement.querySelector('form');
            if (siglaPageTitle) {
                siglaPageTitle.innerHTML = this.leaf.breadcrumbS + ' - ' + siglaTitle.innerHTML + siglaPageTitle.innerHTML;
            }
            this.logoVisible = (
                form === null ||
                (form !== null && form.action.indexOf('GestioneUtente.do') !== -1)
            );
            const inputs = this.container.nativeElement.getElementsByTagName('input');
            const i18nIta = {
                previousMonth : 'Mese Precedente',
                nextMonth : 'Mese Successivo',
                months : ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
                weekdays : ['Domenica', 'Lunedi', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
                weekdaysShort : ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
            };
            for (const input of inputs){
                if (input.placeholder === 'dd/MM/yyyy') {
                    this.picks.push(new Pikaday({
                        field: input,
                        showTime: false,
                        format: 'DD/MM/YYYY',
                        formatStrict: true,
                        i18n: i18nIta
                    }));
                } else if (input.placeholder === 'dd/MM/yyyy HH:mm') {
                    this.picks.push(new Pikaday({
                        field: input,
                        showTime: true,
                        format: 'DD/MM/YYYY HH:mm',
                        formatStrict: true,
                        use24hour: true,
                        autoClose: false,
                        timeLabel: 'Ore e Minuti:&nbsp;',
                        i18n: i18nIta
                    }));
                }
            }
        });
    }

    private startRefreshing() {
        this.isRequesting = true;
    }

    private stopRefreshing() {
        this.isRequesting = false;
    }
}
