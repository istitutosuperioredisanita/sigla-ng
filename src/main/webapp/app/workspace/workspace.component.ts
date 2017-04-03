import { Component, OnInit, Input } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';
import { Leaf } from './leaf.model';
import { WorkspaceService } from './workspace.service';
import { NgbAccordion, NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'jhi-workspace',
    templateUrl: './workspace.component.html',
    providers: [NgbAccordion, NgbAccordionConfig]
})
export class WorkspaceComponent implements OnInit {
    account: Account;
    leafs: Map<String, Leaf[]>;
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

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private workspaceService: WorkspaceService,
        private principal: Principal,
        private accordion: NgbAccordion,
        private config: NgbAccordionConfig
    ) {
        this.jhiLanguageService.setLocations(['workspace']);
        this.config.closeOthers = true;
    }

    ngOnInit() {
        this.workspaceService.getTree().subscribe(
            leafs => {
                this.leafs = leafs;
                this.maintree = leafs['0'];
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
