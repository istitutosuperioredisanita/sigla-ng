import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'jhi-page-ribbon',
    template: `@if (ribbonEnv) {<div class="ribbon"><a href="">{{ribbonEnv}}</a></div>}`,
    standalone: false
})
export class PageRibbonComponent implements OnInit {

    ribbonEnv: string;

    constructor() {}

    ngOnInit() {
        this.ribbonEnv = environment.ribbon;
    }
}
