import { Component, OnInit } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { Principal } from '../shared';

@Component({
    selector: 'jhi-workspace',
    templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit {

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private principal: Principal
    ) {
        this.jhiLanguageService.setLocations(['sessions']);
    }

    ngOnInit() {

    }

}
