import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Observer, EMPTY } from 'rxjs';
import { Leaf } from './leaf.model';
import { TODO } from './todo.model';
import { SERVER_API_URL } from '../app.constants';
import { DatePipe } from '@angular/common';
import { ProfileService } from '../layouts/profiles/profile.service';
import { Account } from '../shared/user/account.model';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class WorkspaceService {

    private resourceUrl = SERVER_API_URL + 'api/tree';
    private observable: Observable<boolean>;
    private observers: Observer<boolean>[];
    private datePipe: DatePipe;

    constructor(
        private http: HttpClient,
        private profileService: ProfileService
    ) {
        this.observers = [];
        this.observable = new Observable<boolean>((observer) => {
            this.observers.push(observer);
        });
        this.datePipe = new DatePipe('it');
    }

    getTree(): Observable<Map<String, Leaf[]>> {
        return this.http.get(this.resourceUrl).pipe(map((res: Map<String, Leaf[]>) => res));
    }

    evictTree(): Observable<boolean> {
        return this.http.delete(this.resourceUrl).pipe(map((res: boolean) => res));
    }

    openMenu(nodoid: string, account: Account): Observable<string> {
        let httpParams: HttpParams = new HttpParams();
        httpParams = httpParams.set('comando', 'doSelezionaMenu(' + nodoid + ')');
        httpParams = httpParams.set('datetime', String(Date.now()));
        if (account && account.access_token) {
            httpParams = httpParams.set('access_token', account.access_token);
        }
        return this.profileService.getProfileInfo().pipe(switchMap((profileInfo) => {
            return this.http.get(profileInfo.siglaWildflyURL + '/SIGLA/GestioneMenu.do', {
                params: httpParams, withCredentials: true, responseType: 'text'
            }).pipe(map((res: any) => res));
        }));
    }

    version(): Observable<string> {
        return this.profileService.getProfileInfo().pipe(switchMap((profileInfo) => {
            return this.http.get(profileInfo.siglaWildflyURL + '/SIGLA/restapi/version').pipe(map((res: any) => {
                return res['Specification-Version'];
            }));
        }));
    }

    postForm(form: any, account: Account): Observable<string> {
        let httpParams: HttpParams = new HttpParams();
        httpParams = httpParams.set('datetime', String(Date.now()));
        if (account && account.access_token) {
            httpParams = httpParams.set('access_token', account.access_token);
        }
        if (form.comando.value) {
            return this.profileService.getProfileInfo().pipe(switchMap((profileInfo) => {
                return this.http.post(profileInfo.siglaWildflyURL + '/SIGLA/' + form.getAttribute('action-ng'),
                    new FormData(form), {
                        params: httpParams,
                        withCredentials: true,
                        responseType: 'text'
                    }).pipe(map((res: any) => res));
            }));
        } else {
            return EMPTY;
        }
    }

    getAllTODO(account: Account): Observable<string[]> {
        let httpParams: HttpParams = new HttpParams();
        httpParams = httpParams.set('datetime', String(Date.now()));
        if (account && account.access_token) {
            httpParams = httpParams.set('access_token', account.access_token);
        }
        return this.profileService.getProfileInfo().pipe(switchMap((profileInfo) => {
            return this.http.get(profileInfo.siglaWildflyURL + '/SIGLA/restapi/todo', {
                params: httpParams, withCredentials: true
            }).pipe(map((res: any) => res));
        }));
    }

    getTODO(bp: string, account: Account): Observable<TODO[]> {
        let httpParams: HttpParams = new HttpParams();
        httpParams = httpParams.set('datetime', String(Date.now()));
        if (account && account.access_token) {
            httpParams = httpParams.set('access_token', account.access_token);
        }
        return this.profileService.getProfileInfo().pipe(switchMap((profileInfo) => {
            return this.http.get(profileInfo.siglaWildflyURL + '/SIGLA/restapi/todo/' + bp, {
                params: httpParams, withCredentials: true
            }).pipe(map(((res: any) => res)));
        }))
    }

    isMenuHidden(): Observable<boolean> {
        return this.observable;
    }

    menuHidden(hide: boolean) {
        this.observers.forEach((observer) => observer.next(hide));
    }

}
