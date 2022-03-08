import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SERVER_API_URL } from '../../app.constants';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class AccountService  {
    constructor(private http: HttpClient) { }

    get(user?: string): Observable<any> {
        let url = 'api/account';
        if (user) {
            url += '/' + user;
        }
        return this.http.get(url).pipe(map((res: any) => res));
    }

    save(account: any): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/account', account);
    }
}
