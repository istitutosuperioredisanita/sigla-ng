import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { JhiMultipleUserModalComponent } from './multiple-user.component';

@Injectable()
export class MultipleUserModalService {
    private isOpen = false;
    constructor(
        private modalService: NgbModal,
    ) {}

    open(page: string): NgbModalRef {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;
        const modalRef = this.modalService.open(JhiMultipleUserModalComponent, {
            windowClass: 'fade',
            animation: true,
            keyboard: false,
            backdrop: false
        });
        modalRef.componentInstance.page = page;
        modalRef.result.then((result) => {
            this.isOpen = false;
        }, (reason) => {
            this.isOpen = false;
        });
        return modalRef;
    }
}
