import { Component, OnInit, OnDestroy, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { JhiEventManager, JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';
import { Leaf } from './leaf.model';
import { WorkspaceService } from './workspace.service';
import { Observable } from 'rxjs/Observable';
import { TreeComponent, TreeNode } from 'angular-tree-component';
import { Subscription } from 'rxjs/Rx';
import * as _ from 'lodash';

export class SIGLATreeNode {
    id: String;
    name: String;
    children:  SIGLATreeNode[];
}

@Component({
    selector: 'jhi-tree',
    templateUrl: './tree.component.html',
    styleUrls: [
        'tree.css'
    ]
})
export class SIGLATreeComponent implements OnInit, OnDestroy {
    isRequesting: boolean;
    account: Account;
    leafs: any;
    leafz: Leaf[] = [];
    nodes = [];
    preferitiListener: Subscription;
    refreshTreeListener: Subscription;
    @ViewChild(TreeComponent) tree: TreeComponent;
    @Output() activateLeaf = new EventEmitter();

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private workspaceService: WorkspaceService,
        private principal: Principal,
        private eventManager: JhiEventManager
    ) {
    }

    searchtree = (text$: Observable<string>) =>
        text$
        .debounceTime(50)
        .map((term) => {
            const limit = 10;
            let i = 0;
            const regex = new RegExp(term.replace(/\s/g, '.*'), 'gi');

            return this.leafz.filter((v) => {
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
        })

    formatter = (leaf: Leaf) => '';

    onSelectLeaf = (leaf: Leaf) => {
        leaf.breadcrumb.map((segment) => {
            const leafId = _.keys(segment)[0];
            const node = this.tree.treeModel.getNodeById(leafId);
            this.tree.treeModel.setFocusedNode(node);
            this.activateTreeNode(this.tree.treeModel.getFocusedNode());
        });
    }

    ngOnInit() {
        const that = this;
        this.initTree();
        this.principal.identity().then((account) => {
            this.account = account;
        });
        this.preferitiListener = this.eventManager.subscribe('onPreferitiSelected', (message) => {
            const leaf = that.leafz.filter((v) => {
                return v.id === message.content;
            })[0];
            if (leaf) {
                that.onSelectLeaf(leaf);
            }
        });
        this.refreshTreeListener = this.eventManager.subscribe('onRefreshTree', (message) => {
            this.refreshTree();
        });
    }

    ngOnDestroy() {
        this.eventManager.destroy(this.preferitiListener);
        this.eventManager.destroy(this.refreshTreeListener);
    }

    private getChildNodes(id): SIGLATreeNode[] {
        return _.map(this.leafs[id], (node: Leaf) => {
            return {
                id: node.id,
                hasChildren: this.leafs[node.id],
                name: node.description,
                children: this.getChildNodes(node.id)
            };
        });
    }

    private stopRefreshing() {
        this.isRequesting = false;
    }

    getIcon = (id: string) => {
        return 'fa fa-fw';
    }

    getChildren = (id: string) => {
        return this.leafs[id];
    }

    activateTreeNode = (node: TreeNode) => {
        const aleaf = this.leafz.filter((v) => {
            return v.id === node.id;
        })[0];
        if (node.isLeaf) {
            node.focus(true);
            this.activateLeaf.emit({
                id: node.id,
                leaf: aleaf
            });
        } else {
            node.expand();
            this.tree.treeModel.expandedNodes.forEach((treeNode: TreeNode) => {
                if (treeNode.level === node.level && treeNode.id !== node.id) {
                    treeNode.collapse();
                }
            });
        }
    }

    toggleTreeNode = (node: TreeNode) => {
        const aleaf = this.leafz.filter((v) => {
            return v.id === node.id;
        })[0];
        if (node.isLeaf) {
            node.focus(true);
            this.activateLeaf.emit({
                id: node.id,
                leaf: aleaf
            });
        } else {
            if (node.isCollapsed) {
                node.expand();
                this.tree.treeModel.expandedNodes.forEach((treeNode: TreeNode) => {
                    if (treeNode.level === node.level && treeNode.id !== node.id) {
                        treeNode.collapse();
                    }
                });
            } else {
                node.toggleExpanded();
            }
        }
    }

    initTree() {
        this.isRequesting = true;
        this.workspaceService.getTree().subscribe(
            (leafs) => {
                this.leafs = leafs;
                const nodes = _.flatten(_.values<Leaf>(this.leafs));
                this.leafz = nodes
                    .filter((node: Leaf) => node.process)
                    .map((node: Leaf) => {
                        node.breadcrumbS = node.breadcrumb.map((segment) => _.values(segment)[0]).join(' > ');
                        return node;
                    });
                this.nodes = this.getChildNodes('0');
                this.stopRefreshing();
            }
        );
    }

    refreshTree() {
        this.workspaceService.evictTree().subscribe(
            (message) => {
                this.nodes = [];
                this.tree.treeModel.update();
                this.initTree();
            }
        );
    }
}
