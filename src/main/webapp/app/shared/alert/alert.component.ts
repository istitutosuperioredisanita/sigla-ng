import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertService } from './alert.service';

@Component({
    selector: 'jhi-alert',
    template: `
        <div class="alerts" role="alert">
          @for (alert of alerts; track alert) {
            <div [ngClass]="{\'alert.position\': true, \'toast\': alert.toast}">
              @if (alert && alert.type && alert.msg) {
                <ngb-alert [type]="alert.type" (close)="alert.close(alerts)">
                  <pre [innerHTML]="alert.msg"></pre>
                </ngb-alert>
              }
            </div>
          }
        </div>`,
    standalone: false
})
export class JhiAlertComponent implements OnInit, OnDestroy {
    alerts: any[];

    constructor(private alertService: AlertService) { }

    ngOnInit() {
        this.alerts = this.alertService.get();
    }

    ngOnDestroy() {
        this.alerts = [];
    }

}
