import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';
import { Leaf } from './leaf.model';
import { WorkspaceService } from './workspace.service';
import { Observable } from 'rxjs/Observable';
import { TreeLeafComponent } from './tree-leaf.component';

import { NgbAccordion, NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";

@Component({
    selector: 'jhi-tree',
    templateUrl: './tree.component.html',
    providers: [NgbAccordion, NgbAccordionConfig]
})
export class TreeComponent implements OnInit {
    isRequesting: boolean;
    account: Account;
    leafs: Map<String, Leaf[]>;
    alltree: Leaf[] = [];
    leafz: Leaf[] = [];
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
        .debounceTime(50)
        .map(term => {
            const limit = 10;
            var i = 0;
            const regex = new RegExp(term.replace(/\s/g, '.*'), 'gi');

            return this.leafz.filter(v => {
                if (i > limit) {
                    return false;
                } else {
                    const match = regex.test(v.breadcrumbS);
                    if (match) {
                        ++i;
                    }
                    return match;
                }
            });
        });

    formatter = (leaf: Leaf) => '';

    onSelectLeaf = (leaf: Leaf) => {
        this.accordion.toggle(leaf.id);
        this.child.forEach(treeLeaf => {
            treeLeaf.accordion.toggle(leaf.id);
        });
    }

    ngOnInit() {
        this.isRequesting = true;
        this.workspaceService.getTree().subscribe(
            leafs => {
                this.leafs = leafs;
                this.maintree = leafs['0'];

                const nodes = _.flatten(_.values<Leaf>(this.leafs));
                this.leafz = nodes
                    .filter(node => node.process)
                    .map(node => {
                        node.breadcrumbS = node.breadcrumb.map(segment => _.values(segment)[0]).join(' > ');
                        return node;
                    });
                this.alltree = nodes;
                this.stopRefreshing();
            }
        );
        this.principal.identity().then((account) => {
            this.account = account;
        });
    }

    private stopRefreshing() {
        this.isRequesting = false;
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
