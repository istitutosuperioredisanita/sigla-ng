import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { UserContext } from '../shared';
import { Pair } from './pair.model';

@Injectable()
export class ContextService  {
    constructor(private http: Http) { }

    getEsercizi(): Observable<number[]> {
        return this.http.get('/api/context/esercizio').map((res: Response) => res.json());
    }

    getUo(cds: string): Observable<Pair[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('cds', cds);
        return this.http.get('/api/context/uo', {search: params}).map((res: Response) => res.json());
    }

    getCds(uo: string): Observable<Pair[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('uo', uo);
        return this.http.get('/api/context/cds', {search: params}).map((res: Response) => res.json());
    }

    saveEsecizio(esercizio: number): Observable<Response> {
        return this.http.post('api/context', {
            'esercizio' : esercizio
        }).map((res: Response) => res.json());
    }

    saveUserContext(userContext: UserContext): Observable<Response> {
        return this.http.post('api/context', userContext).map((res: Response) => res.json());
    }

}
