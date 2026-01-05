import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'jhi-page-ribbon',
    template: `<div class="ribbon" *ngIf="ribbonEnv"><a href="">{{ribbonEnv}}</a></div>`,
    standalone: false
})
export class PageRibbonComponent implements OnInit {

    ribbonEnv: string;

    constructor() {}

    ngOnInit() {
        this.ribbonEnv = environment.ribbon;
    }
}
