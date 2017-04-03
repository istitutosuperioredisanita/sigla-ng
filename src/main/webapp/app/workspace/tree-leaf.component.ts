import { Component, OnInit, Input } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';
import { Leaf } from './leaf.model';
import { NgbAccordion, NgbAccordionConfig, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'jhi-tree-leaf',
    templateUrl: './tree-leaf.component.html'
})
export class TreeLeafComponent {
    @Input() parent: Leaf;
    @Input() leafs: Map<String, Leaf[]>;

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private principal: Principal
    ) {
        this.jhiLanguageService.setLocations(['workspace']);
    }

    getChildren = (id: string) => {
        return this.leafs[id];
    }

    hasChildren (id: string): boolean {
        return this.leafs[id] !== undefined;
    }

    public beforeChange($event: NgbPanelChangeEvent) {
        if (!this.hasChildren($event.panelId)) {
            $event.preventDefault();
        }
    };
}
