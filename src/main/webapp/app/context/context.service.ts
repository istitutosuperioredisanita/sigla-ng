import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { UserContext } from '../shared';

@Injectable()
export class ContextService  {
    constructor(private http: Http) { }

    getEsercizi(): Observable<number[]> {
        return this.http.get('/api/context/esercizio').map((res: Response) => res.json());
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
