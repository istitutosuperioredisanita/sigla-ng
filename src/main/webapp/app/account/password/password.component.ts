import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { Principal, LoginService, Account } from '../../shared';
import { PasswordService } from './password.service';
import { ProfileService } from '../../layouts/profiles/profile.service';

@Component({
    selector: 'jhi-password',
    templateUrl: './password.component.html'
})
export class PasswordComponent implements OnInit {
    doNotMatch: string;
    error: string;
    success: string;
    account: any;
    password: string;
    confirmPassword: string;

    constructor(
        private passwordService: PasswordService,
        private principal: Principal,
        public router: Router,
        private route: ActivatedRoute,
        public profileService: ProfileService,
        public loginService: LoginService
    ) {}

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
            if (account.ldap) {
                this.profileService.getProfileInfo().subscribe((profileInfo) => {
                    if (window.confirm('Per cambiare la password è necessario un reindirizzamento, si desidera continuare?')) {
                        location.href = profileInfo.urlChangePassword;
                    } else {
                        this.router.navigate(['']);
                    }
                });
            }
        });
    }

    changePassword() {
        if (this.password !== this.confirmPassword) {
            this.error = null;
            this.success = null;
            this.doNotMatch = 'ERROR';
        } else {
            this.doNotMatch = null;
            this.passwordService.save(this.password).subscribe(() => {
                this.error = null;
                this.success = 'OK';
                if (!this.account.accountNonLocked || !this.account.accountNonExpired) {
                    this.loginService.logoutAndRedirect();
                }
            }, () => {
                this.success = null;
                this.error = 'ERROR';
            });
        }
    }
}
