import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Session } from './session.model';

@Injectable()
export class SessionsService {

    private resourceUrl = 'api/account/sessions/';
    constructor(private http: HttpClient) { }

    findAll(): Observable<Session[]> {
        return this.http.get(this.resourceUrl, { observe: 'response' }).pipe(map((res: any) => res));
    }

    delete(series: string): Observable<any> {
        return this.http.delete(`${this.resourceUrl}${series}`);
    }
}
