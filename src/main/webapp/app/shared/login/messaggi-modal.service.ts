import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { JhiMessaggiModalComponent } from './messaggi.component';

@Injectable()
export class MessaggiModalService {
    private isOpen = false;
    constructor(
        private modalService: NgbModal,
        private _sanitizer: DomSanitizer
    ) {}

    open(page: string, html: string): NgbModalRef {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;
        const modalRef = this.modalService.open(JhiMessaggiModalComponent, {
            windowClass: 'fade',
            backdrop: false,
            size: 'lg'
        });
        modalRef.componentInstance.page = page;
        modalRef.componentInstance.html = this._sanitizer.bypassSecurityTrustHtml(html);

        modalRef.result.then((result) => {
            this.isOpen = false;
        }, (reason) => {
            this.isOpen = false;
        });
        return modalRef;
    }
}
