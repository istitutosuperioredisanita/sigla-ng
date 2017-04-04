import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';
import { Leaf } from './leaf.model';
import { WorkspaceService } from './workspace.service';
import { Observable } from 'rxjs/Observable';
import { TreeLeafComponent } from './tree-leaf.component';

import { NgbAccordion, NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'jhi-tree',
    templateUrl: './tree.component.html',
    providers: [NgbAccordion, NgbAccordionConfig]
})
export class TreeComponent implements OnInit {
    account: Account;
    leafs: Map<String, Leaf[]>;
    alltree: Leaf[] = [];
    maintree: Leaf[];
    icons = {
        '0.SERV' : 'fa-cog',
        '0.CFG' : 'fa-cogs',
        '0.PRV' : 'fa-eur',
        '0.DOC' : 'fa-credit-card-alt',
        '0.AMM' : 'fa-credit-card',
        '0.COANCOEP' : 'fa-money',
        '0.IVA' : 'fa-columns',
        '0.CNS' : 'fa-gg-circle',
        '0.RIP' : 'fa-undo'
    };
    @ViewChild('accordion') accordion: NgbAccordion;
    @ViewChildren('child') child: QueryList<TreeLeafComponent>;

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private workspaceService: WorkspaceService,
        private principal: Principal,
        private config: NgbAccordionConfig
    ) {
        this.jhiLanguageService.setLocations(['workspace']);
        this.config.closeOthers = true;
    }

    searchtree = (text$: Observable<string>) =>
        text$
        .debounceTime(200)
        .map(term => this.alltree.filter(v => new RegExp(term, 'gi').test(v.breadcrumb))
        .slice(0, 20));
    formatter = (leaf: Leaf) => '';

    onSelectLeaf = (leaf: Leaf) => {
        this.accordion.toggle(leaf.id);
        this.child.forEach(treeLeaf => {
            treeLeaf.accordion.toggle(leaf.id);
        });
    }

    ngOnInit() {
        this.workspaceService.getTree().subscribe(
            leafs => {
                this.leafs = leafs;
                this.maintree = leafs['0'];
                Object.keys(this.leafs).forEach(key => {
                    this.leafs[key].forEach(leaf => {
                        this.alltree.push(leaf);
                    });
                });
            }
        );
        this.principal.identity().then((account) => {
            this.account = account;
        });
    }

    getDescription = (leaf: Leaf) => {
        return leaf.description.toLocaleUpperCase();
    }

    getIcon = (id: string) => {
        return 'fa ' + (this.icons[id] || '') + ' fa-fw';
    }

    getChildren = (id: string) => {
        return this.leafs[id];
    }

}
