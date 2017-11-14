import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiMessaggiModalComponent } from './messaggi.component';
import { Messaggio } from '../../context/messaggio.model';

@Injectable()
export class MessaggiModalService {
    private isOpen = false;
    constructor(
        private modalService: NgbModal
    ) {}

    open(page: string, messaggi: Messaggio[]): NgbModalRef {
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
        modalRef.componentInstance.messaggi = messaggi;

        modalRef.result.then((result) => {
            this.isOpen = false;
        }, (reason) => {
            this.isOpen = false;
        });
        return modalRef;
    }
}
