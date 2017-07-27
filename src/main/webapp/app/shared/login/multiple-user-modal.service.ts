import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { JhiMultipleUserModalComponent } from './multiple-user.component';

@Injectable()
export class MultipleUserModalService {
    private isOpen = false;
    constructor (
        private modalService: NgbModal,
    ) {}

    open (): NgbModalRef {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;
        let modalRef = this.modalService.open(JhiMultipleUserModalComponent, {
            windowClass: 'fade',
            backdrop: false
        });
        modalRef.result.then(result => {
            this.isOpen = false;
        }, (reason) => {
            this.isOpen = false;
        });
        return modalRef;
    }
}
