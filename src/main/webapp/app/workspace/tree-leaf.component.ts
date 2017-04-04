import { Component, OnInit, Input, ViewChild } from '@angular/core';
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
    @ViewChild('accordion') accordion: NgbAccordion;

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

    chevronClass (id: string): string {
        return this.accordion.activeIds.indexOf(id) === -1 ? 'fa fa-caret-right' : 'fa fa-caret-down';
    }

    attivaNodo (id: string): void {
        window.alert('ATTIVA NODO:' + id);
    }

    public beforeChange($event: NgbPanelChangeEvent) {
        if (!this.hasChildren($event.panelId)) {
            $event.preventDefault();
        }
    };
}
