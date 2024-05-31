import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Observer, EMPTY } from 'rxjs';
import { Leaf } from './leaf.model';
import { TODO } from './todo.model';
import { DatePipe } from '@angular/common';
import { Account } from '../shared/user/account.model';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class WorkspaceService {

    private observable: Observable<boolean>;
    private observers: Observer<boolean>[];
    private datePipe: DatePipe;

    constructor(
        private http: HttpClient,
    ) {
        this.observers = [];
        this.observable = new Observable<boolean>((observer) => {
            this.observers.push(observer);
        });
        this.datePipe = new DatePipe('it');
    }

    getTree(esecizio?: number, uo?: string): Observable<Map<String, Leaf[]>> {
        let httpParams: HttpParams = new HttpParams();
        if (esecizio) {
            httpParams = httpParams.set('esercizio', esecizio);
        }
        if (uo) {
            httpParams = httpParams.set('uo', uo);
        }
        return this.http.get(environment.apiUrl + '/tree', {
            params: httpParams, withCredentials: true
        }).pipe(map((res: Map<String, Leaf[]>) => res));

    }

    evictTree(): Observable<boolean> {
        return this.http.delete(environment.apiUrl + '/tree', {
            withCredentials: true
        }).pipe(map((res: boolean) => res));
    }

    openMenu(nodoid: string, account: Account, favorites: boolean): Observable<string> {
        let httpParams: HttpParams = new HttpParams();
        httpParams = httpParams.set('comando', favorites ? 'doSelezionaPreferiti(' + nodoid + ')' : 'doSelezionaMenu(' + nodoid + ')');
        httpParams = httpParams.set('datetime', String(Date.now()));
        return this.http.get(environment.applicationContextUrl + '/GestioneMenu.do', {
            params: httpParams, withCredentials: true, responseType: 'text'
        }).pipe(map((res: any) => res));
    }

    version(): Observable<string> {
        return this.http.get(environment.apiUrl + '/version').pipe(map((res: any) => {
            return res['Specification-Version'];
        }));
    }

    postForm(form: any, account: Account): Observable<string> {
        let httpParams: HttpParams = new HttpParams();
        httpParams = httpParams.set('datetime', String(Date.now()));
        if (form.comando.value) {
            return this.http.post(environment.applicationContextUrl + '/' + form.getAttribute('action-ng'),
                new FormData(form), {
                    params: httpParams,
                    withCredentials: true,
                    responseType: 'text'
                }).pipe(map((res: any) => res));
        } else {
            return EMPTY;
        }
    }

    getAllTODO(account: Account): Observable<string[]> {
        let httpParams: HttpParams = new HttpParams();
        httpParams = httpParams.set('datetime', String(Date.now()));
        return this.http.get(environment.apiUrl + '/todo', {
            params: httpParams, withCredentials: true
        }).pipe(map((res: any) => res));
    }

    getTODO(bp: string, account: Account): Observable<TODO[]> {
        let httpParams: HttpParams = new HttpParams();
        httpParams = httpParams.set('datetime', String(Date.now()));
        return this.http.get(environment.apiUrl + '/todo/' + bp, {
            params: httpParams, withCredentials: true
        }).pipe(map(((res: any) => res)));
    }

    isMenuHidden(): Observable<boolean> {
        return this.observable;
    }

    menuHidden(hide: boolean) {
        this.observers.forEach((observer) => observer.next(hide));
    }

}
