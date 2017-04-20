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

    openMenu(nodoid: string): Observable<string> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('comando', 'doSelezionaMenu(' + nodoid + ')');
        return this.http.get('/SIGLA/GestioneMenu.do', {
           search: params
        }).map((res: Response) => res.text());
    }

    postForm(form: any, formData: FormData): Observable<string> {
        return this.http.post('/SIGLA/' + form.action.replace(form.baseURI, ''), formData).map((res: Response) => res.text());
    }

}
