import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'jhi-footer',
    templateUrl: './footer.component.html',
    standalone: false
})
export class FooterComponent implements OnInit {
     instituteAcronym: string;

     constructor() {}

     ngOnInit() {
        this.instituteAcronym = environment.instituteAcronym;
     }
 }
