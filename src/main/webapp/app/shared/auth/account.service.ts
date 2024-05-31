import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Account } from '../user/account.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class AccountService  {
    constructor(
        private http: HttpClient,
    ) { }

    get(user?: string): Observable<Account> {
        let url = environment.apiUrl + '/account';
        if (user) {
            url += '/' + user;
        }
        return this.http.get(url, {
            withCredentials: true
        }).pipe(map((res: Account) => res));
    }
}
