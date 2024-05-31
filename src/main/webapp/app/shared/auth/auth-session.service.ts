import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, AccountService, UserContext } from '../../shared';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthServerProvider {
    headers = new HttpHeaders ({
        'Content-Type': 'application/x-www-form-urlencoded'
    });
    constructor(
        private http: HttpClient,
        private accountService: AccountService,
    ) {
    }

    loginWildfly(credentials, userContext: UserContext): Observable<any> {
        if ((environment.oidc.enable  === 'true') ? true : false) {
            return this.accountService.get();
        } else {
            const data = 'j_username=' + encodeURIComponent(credentials.username) + '&j_password=' + encodeURIComponent(credentials.password);
            return this.http.post(environment.apiUrl + '/login', data, {
                headers: this.headers, withCredentials: true
            });
        }
    }

    initializeWildfly(account: Account): Observable<any> {
        let httpParams: HttpParams = new HttpParams();
        httpParams = httpParams.set('comando', 'doDefaultNG');
        httpParams = httpParams.set('datetime', String(Date.now()));
        return this.http.get(environment.applicationContextUrl + '/Login.do', {
            params: httpParams, headers: this.headers, withCredentials: true, responseType: 'text'
        });
    }

    loginMultiploWildfly(utenteMultiplo: string, userContext: UserContext): Observable<any> {
        const data = 'main.utente_multiplo=' + utenteMultiplo +
            '&context.esercizio=' + userContext.esercizio +
            '&context.cds=' + userContext.cds +
            '&context.uo=' + userContext.uo +
            '&context.cdr=' + userContext.cdr +
            '&comando=doEntraUtenteMultiplo';
        return this.http.post(environment.applicationContextUrl + '/Login.do', data, {
            headers: this.headers, withCredentials: true, responseType: 'text'
        });
    }

    logoutWildfly(): Observable<any> {
        return this.http.post(environment.applicationContextUrl + '/GestioneMenu.do', 'comando=doLogout', {
            headers: this.headers, withCredentials: true, responseType: 'text'
        });
    }
}
