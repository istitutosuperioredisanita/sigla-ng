import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EventManager {
  private observable = new Subject<any>();

  broadcast(event: any): void {
    console.log('Evento inviato:', event); // Controlla se vedi questo in console    
    this.observable.next(event);
  }

  subscribe(eventName: string, callback: any): Subscription {
    return this.observable
      .pipe(
        filter((event: any) => {
          // Gestisce sia il formato oggetto {name, content} che il formato stringa
          if (typeof event === 'string') {
            return event === eventName;
          }
          return event.name === eventName;
        }),
        map((event: any) => {
          // Se è un oggetto, restituisce il contenuto, altrimenti l'evento stesso
          return typeof event === 'string' ? event : event.content;
        })
      )
      .subscribe(callback);
  }

  destroy(subscriber: Subscription): void {
    subscriber.unsubscribe();
  }
}