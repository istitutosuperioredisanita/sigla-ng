import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable, Observer } from 'rxjs/Rx';
import { Leaf } from './leaf.model';
import { TODO } from './todo.model';
import { SERVER_API_URL } from '../app.constants';
import { DatePipe } from '@angular/common';
import { ProfileService } from '../layouts/profiles/profile.service';
import { Headers } from '@angular/http';
import { Account } from '../shared/user/account.model';

@Injectable()
export class WorkspaceService {

    private resourceUrl = SERVER_API_URL + 'api/tree';
    private observable: Observable<boolean>;
    private observers: Observer<boolean>[];
    private datePipe: DatePipe;

    constructor(
        private http: Http,
        private profileService: ProfileService
    ) {
        this.observers = [];
        this.observable = new Observable<boolean>((observer) => {
            this.observers.push(observer);
        });
        this.datePipe = new DatePipe('it');
    }

    getTree(): Observable<Map<String, Leaf[]>> {
        return this.http.get(this.resourceUrl).map((res: Response) => res.json());
    }

    evictTree(): Observable<boolean> {
        return this.http.delete(this.resourceUrl).map((res: Response) => res.json());
    }

    openMenu(nodoid: string, account: Account): Observable<string> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('comando', 'doSelezionaMenu(' + nodoid + ')');
        params.set('datetime', String(Date.now()));
        if (account && account.access_token) {
            params.set('access_token', account.access_token);
        }
        return this.profileService.getProfileInfo().switchMap((profileInfo) => {
            return this.http.get(profileInfo.siglaWildflyURL + '/SIGLA/GestioneMenu.do', {
                search: params, withCredentials: true
            })
            .map((res: Response) => res.text());
        });
    }

    version(): Observable<string> {
        return this.profileService.getProfileInfo().switchMap((profileInfo) => {
            return this.http.get(profileInfo.siglaWildflyURL + '/SIGLA/restapi/version').map((res: Response) => {
                return res.json()['Specification-Version'];
            });
        });
    }

    postForm(form: any): Observable<string> {
        if (form.comando.value) {
            return this.profileService.getProfileInfo().switchMap((profileInfo) => {
                return this.http.post(profileInfo.siglaWildflyURL + '/SIGLA/' + form.getAttribute('action-ng') + '?datetime=' + Date.now(),
                    new FormData(form), {
                        withCredentials: true
                    }).map((res: Response) => res.text());
            });
        } else {
            return Observable.empty();
        }
    }

    getAllTODO(account: Account): Observable<string[]> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('datetime', String(Date.now()));
        if (account && account.access_token) {
            params.set('access_token', account.access_token);
        }
        return this.profileService.getProfileInfo().switchMap((profileInfo) => {
            return this.http.get(profileInfo.siglaWildflyURL + '/SIGLA/restapi/todo', {
                search: params, withCredentials: true
            }).map((res: Response) => res.json());
        });
    }

    getTODO(bp: string, account: Account): Observable<TODO[]> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('datetime', String(Date.now()));
        if (account && account.access_token) {
            params.set('access_token', account.access_token);
        }
        return this.profileService.getProfileInfo().switchMap((profileInfo) => {
            return this.http.get(profileInfo.siglaWildflyURL + '/SIGLA/restapi/todo/' + bp, {
                search: params, withCredentials: true
            }).map((res: Response) => res.json());
        })
    }

    isMenuHidden(): Observable<boolean> {
        return this.observable;
    }

    menuHidden(hide: boolean) {
        this.observers.forEach((observer) => observer.next(hide));
    }

}
