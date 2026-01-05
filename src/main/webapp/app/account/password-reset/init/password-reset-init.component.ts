import { Component, OnInit, AfterViewInit, Renderer2, ElementRef } from '@angular/core';

import { PasswordResetInitService } from './password-reset-init.service';
import { EMAIL_NOT_FOUND_TYPE } from '../../../shared';

@Component({
    selector: 'jhi-password-reset-init',
    templateUrl: './password-reset-init.component.html',
    standalone: false
})
export class PasswordResetInitComponent implements OnInit, AfterViewInit {
    error: string;
    errorEmailNotExists: string;
    resetAccount: any;
    success: string;

    constructor(
        private passwordResetInitService: PasswordResetInitService,
        private elementRef: ElementRef,
        private renderer: Renderer2
    ) {
    }

    ngOnInit() {
        this.resetAccount = {};
    }

    ngAfterViewInit() {
        this.renderer['focus'].apply(this.elementRef.nativeElement.querySelector('#email'), []);
    }

    requestReset() {
        this.error = null;
        this.errorEmailNotExists = null;

        this.passwordResetInitService.save(this.resetAccount.email).subscribe(() => {
            this.success = 'OK';
        }, (response) => {
            this.success = null;
            if (response.status === 400 && response.json().type === EMAIL_NOT_FOUND_TYPE) {
                this.errorEmailNotExists = 'ERROR';
            } else {
                this.error = 'ERROR';
            }
        });
    }
}
