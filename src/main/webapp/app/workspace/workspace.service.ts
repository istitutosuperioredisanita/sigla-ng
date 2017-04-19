import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Leaf } from './leaf.model';

@Injectable()
export class WorkspaceService {

    private resourceUrl = 'api/tree';
    constructor(
        private http: Http
    ) { }

    getTree(): Observable<Map<String, Leaf[]>> {
        return this.http.get(this.resourceUrl).map((res: Response) => res.json());
    }

    invoke(nodoid: string): Observable<string> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('comando', 'doSelezionaMenu(' + nodoid + ')');
        return this.http.get('/SIGLA/GestioneMenu.do', {
           search: params
        }).map((res: Response) => res.text());
    }

}
