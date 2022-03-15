import { Component, OnInit, OnDestroy, Input, ElementRef, Renderer2, ViewChild, Inject, HostListener } from '@angular/core';
import { JhiEventManager, JhiLanguageService } from 'ng-jhipster';
import { Principal, LoginService, Account } from '../shared';
import { Subscription } from 'rxjs';
import { WorkspaceService } from './workspace.service';
import { DomSanitizer, SafeHtml} from '@angular/platform-browser';
import { Leaf } from './leaf.model';
import { TODO } from './todo.model';
import { Pair } from '../context/pair.model';
import { ContextService } from '../context/context.service';
import { Italian } from 'flatpickr/dist/l10n/it.js';
import { SplitComponent } from 'angular-split';
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
    sizeTree = 25;
    sizeWorkspace = 75;
    direction = 'horizontal';
    navIsFixed: boolean;
    responsive = false;

    @ViewChild('htmlContainer', {static : true}) container: ElementRef;
    @ViewChild('scriptContainer', {static : true}) scriptContainer: ElementRef;
    @ViewChild('mySplit', {static : true}) mySplitEl: SplitComponent;
    @ViewChild('areaWorkspace', {static : true}) areaWorkspace: ElementRef;
    @ViewChild('areaTree', {static : true}) areaTree: SplitComponent;

    constructor(
        private contextService: ContextService,
        private principal: Principal,
        private workspaceService: WorkspaceService,
        private _sanitizer: DomSanitizer,
        private renderer: Renderer2,
        private eventManager: JhiEventManager,
        private loginService: LoginService
    ) {
        this.listenerSubmit = renderer.listen('body', 'submit', (event) => {
            return false;
        });
        this.listenerSubmitForm = renderer.listen('body', 'submitForm', (event) => {
            if (event.detail.comando) {
                const form = event.detail.form;
                this.startRefreshing();
                this.workspaceService.postForm(form, this.account)
                    .subscribe((html) => {
                        this.renderHtml(html);
                        this.stopRefreshing();
                    }, (error) => {
                        this.stopRefreshing();
                    });
            }
            return false;
        });
        workspaceService.isMenuHidden().subscribe((hidden: boolean) => {
            this.hidden = hidden;
            if (hidden) {
                this.sizeTree = 0;
                this.sizeWorkspace = 100;
            } else {
                this.sizeTree = 25;
                this.sizeWorkspace = 75;
            }
        });
        this.getScreenSize();
    }

    @HostListener('mouseover')
    onMouseOver() {
        this.eventManager.broadcast({name: 'onWorkspaceHover'});
    }

    @HostListener('window:resize', ['$event'])
    getScreenSize(event?) {
        if (window.innerWidth > 768) {
            this.direction = 'horizontal';
            this.responsive = false;
        } else {
            this.direction = 'disabled';
            this.responsive = true;
            this.sizeTree = 0;
            this.sizeWorkspace = 0;
        }
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

    gutterClick(e: {gutterNum: number, sizes: Array<number>}) {
        if (e.gutterNum === 1) {
            if (this.sizeTree > 0) {
                this.sizeTree = 0;
                this.sizeWorkspace = 100;
            } else {
                this.sizeTree = 25;
                this.sizeWorkspace = 75;
            }
        }
    }

    @HostListener('scroll', ['$event'])
    doSomethingOnScroll($event: any) {
        if (window.pageYOffset || $event.srcElement.scrollTop || $event.srcElement.scrollTop > 100) {
            this.navIsFixed = true;
        } else if (this.navIsFixed && window.pageYOffset || $event.srcElement.scrollTop || $event.srcElement.scrollTop < 10) {
            this.navIsFixed = false;
        }
    }

    scrollToTop() {
        const element = this.areaWorkspace.nativeElement;
        (function smoothscroll() {
            if (element.scrollTop > 0) {
                window.requestAnimationFrame(smoothscroll);
                element.scrollTop = 0;
            }
        })();
    }

    caricaTODO() {
        this.todos = [];
        this.workspaceService.getAllTODO(this.account).subscribe((bps) => {
            for (const bp of bps) {
                this.workspaceService.getTODO(bp, this.account).subscribe((todos) => {
                    for (const todo of todos) {
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
            this.workspaceService.openMenu(nodo.id, this.account).subscribe((html) => {
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
        if (html.indexOf('utenze00/form_login.jsp') !== -1) {
            this.loginService.logoutAndRedirect();
        }
        const siglaScripts = this.scriptContainer.nativeElement.getElementsByTagName('script');
        for (const siglaScript of siglaScripts) {
            this.scriptContainer.nativeElement.removeChild(siglaScript);
        }
        for (const pickr of this.flatpickrs) {
            pickr.destroy();
        }
        this.desktop = this._sanitizer.bypassSecurityTrustHtml(html);
        setTimeout(() => { // wait for DOM rendering
            const bases = this.container.nativeElement.getElementsByTagName('base');
            for (const base of bases) {
                base.parentElement.removeChild(base);
            }
            const scripts = this.container.nativeElement.getElementsByTagName('script');
            for (const script of scripts) {
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
            for (const input of inputs) {
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
