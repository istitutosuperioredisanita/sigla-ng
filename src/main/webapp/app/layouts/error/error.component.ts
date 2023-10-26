import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../shared/login/login.service';
import { environment } from '../../../environments/environment';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Principal } from 'app/shared';

@Component({
    selector: 'jhi-error',
    templateUrl: './error.component.html'
})
export class ErrorComponent implements OnInit {
    errorMessage: string;
    error403: boolean;
    error: string;

    accessdenied = false;
    given_name: string;
    family_name: string;
    preferred_username: string;
    email: string;
    updatedAt: Date;
    oidcEnabled: boolean;

    constructor(
        private principal: Principal,
        public router: Router,
        private loginService: LoginService,
        private route: ActivatedRoute,
        private oidcSecurityService: OidcSecurityService
    ) {
    }

    ngOnInit() {
        this.oidcEnabled = (environment.oidc.enable  === 'true') ? true : false;
        this.route.data.subscribe((routeData) => {
            if (routeData.error403) {
                this.error403 = routeData.error403;
            }
            if (routeData.errorMessage) {
                this.errorMessage = routeData.errorMessage;
            }
        });
        this.route.params.subscribe((params) => {
            this.error = params.error;
            if (params.status && params.status === 'accessdenied') {
                this.accessdenied = true;
                this.given_name = params.given_name;
                this.family_name = params.family_name;
                this.preferred_username = params.preferred_username;
                this.email = params.email;
                if (params.updatedAt && params.updatedAt !== 'null') {
                    this.updatedAt = new Date();
                    this.updatedAt.setTime(params.updatedAt);
                }
            }
        });
    }

    logout() {
        if (this.oidcEnabled) {
            this.oidcSecurityService.logoffAndRevokeTokens().subscribe(() => {
                this.principal.authenticate(null);
            });
        } else {
            this.loginService.logout();
            this.router.navigate(['']);
        }
    }
}
