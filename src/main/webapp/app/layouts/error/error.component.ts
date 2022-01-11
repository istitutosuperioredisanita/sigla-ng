import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'jhi-error',
    templateUrl: './error.component.html'
})
export class ErrorComponent implements OnInit {
    errorMessage: string;
    error403: boolean;

    accessdenied = false;
    given_name: string;
    family_name: string;
    preferred_username: string;
    email: string;

    constructor(
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.route.data.subscribe((routeData) => {
            if (routeData.error403) {
                this.error403 = routeData.error403;
            }
            if (routeData.errorMessage) {
                this.errorMessage = routeData.errorMessage;
            }
        });
        this.route.params.subscribe((params) => {
            if (params.status && params.status === 'accessdenied') {
                this.accessdenied = true;
                this.given_name = params.given_name;
                this.family_name = params.family_name;
                this.preferred_username = params.preferred_username;
                this.email = params.email;
            }
        });
    }

    logout() {
        location.href = '/sso/logout';
    }
}
