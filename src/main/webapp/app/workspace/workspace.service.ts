import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable, Observer } from 'rxjs/Rx';
import { Leaf } from './leaf.model';

@Injectable()
export class WorkspaceService {

    private resourceUrl = 'api/tree';

    private observable: Observable<boolean>;
    private observers: Observer<boolean>[];


    constructor(
        private http: Http
    ) {
        this.observers = [];
        this.observable = new Observable<boolean>(observer => {
            this.observers.push(observer);
        });
    }

    getTree(): Observable<Map<String, Leaf[]>> {
        return this.http.get(this.resourceUrl).map((res: Response) => res.json());
    }

    openMenu(nodoid: string): Observable<string> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('comando', 'doSelezionaMenu(' + nodoid + ')');
        return this.http.get('/SIGLA/GestioneMenu.do', {
           search: params
        }).map((res: Response) => res.text());
    }

    postForm(form: any): Observable<string> {
        if (form.comando.value) {
            return this.http.post('/SIGLA/' + form.action.replace(form.baseURI, ''), new FormData(form)).map((res: Response) => res.text());
        }
    }

    isMenuHidden(): Observable<boolean> {
        return this.observable;
    }

    menuHidden(hide: boolean) {
        this.observers.forEach(observer => observer.next(hide));
    }

}
