import { Injectable } from '@angular/core';

export interface Alert {
  type: 'success' | 'danger' | 'warning' | 'info';
  msg: string;
  params?: any;
  timeout?: number;
  toast?: boolean;
  scoped?: boolean;
  id?: number;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alerts: Alert[] = [];
  private defaultTimeout = 5000;

  get(): Alert[] {
    return this.alerts;
  }

  isToast(): boolean {
    return true; 
  }

  // Il motore centrale che aggiunge l'alert
  addAlert(alert: Alert): Alert {
    alert.id = new Date().getTime();
    if (alert.toast === undefined) alert.toast = this.isToast();
    
    this.alerts.push(alert);

    const timeout = alert.timeout !== undefined ? alert.timeout : this.defaultTimeout;
    if (timeout > 0) {
      setTimeout(() => this.closeAlert(alert.id!), timeout);
    }
    return alert;
  }

  // --- METODI SHORTHAND ---

  success(message: string, params?: any): void {
    this.addAlert({ type: 'success', msg: message, params, toast: true });
  }

  error(message: string, params?: any): void {
    this.addAlert({ type: 'danger', msg: message, params, toast: true });
  }

  info(message: string, params?: any): void {
    this.addAlert({ type: 'info', msg: message, params, toast: true });
  }

  warning(message: string, params?: any): void {
    this.addAlert({ type: 'warning', msg: message, params, toast: true });
  }

  // --- GESTIONE ---

  closeAlert(id: number): void {
    this.alerts = this.alerts.filter(x => x.id !== id);
  }

  clear(): void {
    this.alerts = [];
  }
}