import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable, Observer } from 'rxjs/Rx';
import { Leaf } from './leaf.model';
import { TODO } from './todo.model';
@Injectable()
export class WorkspaceService {

    private resourceUrl = 'api/tree';
    private observable: Observable<boolean>;
    private observers: Observer<boolean>[];

    constructor(
        private http: Http
    ) {
        this.observers = [];
        this.observable = new Observable<boolean>((observer) => {
            this.observers.push(observer);
        });
    }

    getTree(): Observable<Map<String, Leaf[]>> {
        return this.http.get(this.resourceUrl).map((res: Response) => res.json());
    }

    evictTree(): Observable<boolean> {
        return this.http.delete(this.resourceUrl).map((res: Response) => res.json());
    }

    openMenu(nodoid: string): Observable<string> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('comando', 'doSelezionaMenu(' + nodoid + ')');
        return this.http.get('/SIGLA/GestioneMenu.do', {
           search: params
        })
        .map((res: Response) => res.text());
    }

    postForm(form: any): Observable<string> {
        if (form.comando.value) {
            return this.http.post('/SIGLA/' + form.getAttribute('action-ng'), new FormData(form)).map((res: Response) => res.text());
        } else {
            return Observable.empty();
        }
    }

    getAllTODO(): Observable<string[]> {
        return this.http.get('/SIGLA/restapi/todo').map((res: Response) => res.json());
    }

    getTODO(bp: string): Observable<TODO[]> {
        return this.http.get('/SIGLA/restapi/todo/' + bp).map((res: Response) => res.json());
    }

    isMenuHidden(): Observable<boolean> {
        return this.observable;
    }

    menuHidden(hide: boolean) {
        this.observers.forEach((observer) => observer.next(hide));
    }

}
