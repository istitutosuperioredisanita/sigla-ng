import { Component, OnInit, OnDestroy, Input, ElementRef, Renderer, ViewChild, Inject } from '@angular/core';
import { JhiEventManager, JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';
import { Subscription } from 'rxjs/Rx';
import { WorkspaceService } from './workspace.service';
import { DomSanitizer, SafeHtml} from '@angular/platform-browser';
import { Leaf } from './leaf.model';
import { TODO } from './todo.model';
import { Pair } from '../context/pair.model';
import { ContextService } from '../context/context.service';
import { Italian } from 'flatpickr/dist/l10n/it.js';
import 'flatpickr';
declare var flatpickr;

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
    flatpickrs = [];
    todos: TODO[];
    refreshTodoListener: Subscription;
    onSelectCdsSubscription: Subscription;
    onSelectUoSubscription: Subscription;
    onSelectCdrSubscription: Subscription;
    cdsModel: Pair;
    uoModel: Pair;
    cdrModel: Pair;

    @ViewChild('htmlContainer') container: ElementRef;
    @ViewChild('scriptContainer') scriptContainer: ElementRef;

    constructor(
        private contextService: ContextService,
        private jhiLanguageService: JhiLanguageService,
        private principal: Principal,
        private workspaceService: WorkspaceService,
        private _sanitizer: DomSanitizer,
        private elementRef: ElementRef,
        private renderer: Renderer,
        private eventManager: JhiEventManager
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
        this.refreshTodoListener = this.eventManager.subscribe('onRefreshTodo', () => {
            this.caricaTODO();
        });
        this.cdsModel = this.contextService.cdsModel;
        this.uoModel = this.contextService.uoModel;
        this.cdrModel = this.contextService.cdrModel;
        this.onSelectCdsSubscription = this.eventManager.subscribe('onSelectCds', (message) => {
            this.cdsModel = message.content;
        });
        this.onSelectUoSubscription = this.eventManager.subscribe('onSelectUo', (message) => {
            this.uoModel = message.content;
        });
        this.onSelectCdrSubscription = this.eventManager.subscribe('onSelectCdr', (message) => {
            this.cdrModel = message.content;
        });
    }

    caricaTODO() {
        this.todos = [];
        this.workspaceService.getAllTODO().subscribe((bps) => {
            for (const bp of bps){
                this.workspaceService.getTODO(bp).subscribe((todos) => {
                    for (const todo of todos){
                        this.todos.push(todo);
                    }
                });
            }
        });
    }

    ngOnDestroy() {
        this.listenerSubmit();
        this.listenerSubmitForm();
        this.refreshTodoListener.unsubscribe();
        this.eventManager.destroy(this.onSelectCdsSubscription);
        this.eventManager.destroy(this.onSelectUoSubscription);
        this.eventManager.destroy(this.onSelectCdrSubscription);
    }

    openNodo(cdNodo: string) {
        this.eventManager.broadcast({
                name: 'onPreferitiSelected',
                content: cdNodo
            });
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
        for (const pickr of this.flatpickrs){
            pickr.destroy();
        }
        this.desktop = this._sanitizer.bypassSecurityTrustHtml(html);
        setTimeout(() => { // wait for DOM rendering
            const bases = this.container.nativeElement.getElementsByTagName('base');
            for (const base of bases){
                base.parentElement.removeChild(base);
            }
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
            if (this.logoVisible) {
                this.caricaTODO();
            }
            const inputs = this.container.nativeElement.getElementsByTagName('input');
            for (const input of inputs){
                if (input.placeholder === 'dd/MM/yyyy' && input.type === 'text') {
                    this.flatpickrs.push(
                        flatpickr(input, {
                        dateFormat: 'd/m/Y',
                        allowInput: true,
                        locale: Italian
                    }));
                } else if (input.placeholder === 'dd/MM/yyyy HH:mm' && input.type === 'text') {
                    this.flatpickrs.push(
                        flatpickr(input, {
                        enableTime: true,
                        time_24hr: true,
                        allowInput: true,
                        dateFormat: 'd/m/Y H:i',
                        locale: Italian
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

    public isLogoVisible(): boolean {
        return this.logoVisible && this.todos && this.todos.length === 0;
    }
}
