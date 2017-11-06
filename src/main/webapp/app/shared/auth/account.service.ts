import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { SERVER_API_URL } from '../../app.constants';

@Injectable()
export class AccountService  {
    constructor(private http: Http) { }

    get(user?: string): Observable<any> {
        let url = 'api/account';
        if (user) {
            url += '/' + user;
        }
        return this.http.get(url).map((res: Response) => res.json());
    }

    save(account: any): Observable<Response> {
        return this.http.post(SERVER_API_URL + 'api/account', account);
    }
}
