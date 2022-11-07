import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, AccountService, UserContext } from '../../shared';
import { environment } from '../../../environments/environment';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable()
export class AuthServerProvider {
    headers = new HttpHeaders ({
        'Content-Type': 'application/x-www-form-urlencoded'
    });
    constructor(
        private http: HttpClient,
        private oidcSecurityService: OidcSecurityService,
        private accountService: AccountService,
    ) {
    }

    loginWildfly(credentials, userContext: UserContext): Observable<any> {
        if (environment.oidc.enable) {
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

    loginMultiploWildfly(utenteMultiplo: string, userContext: UserContext, access_token?: string): Observable<any> {
        let httpParams: HttpParams = new HttpParams();
        if (access_token) {
            httpParams = httpParams.set('access_token', access_token);
        }
        const data = 'main.utente_multiplo=' + utenteMultiplo +
            '&context.esercizio=' + userContext.esercizio +
            '&context.cds=' + userContext.cds +
            '&context.uo=' + userContext.uo +
            '&context.cdr=' + userContext.cdr +
            '&comando=doEntraUtenteMultiplo';
        return this.http.post(environment.applicationContextUrl + '/Login.do', data, {
            params: httpParams, headers: this.headers, withCredentials: true, responseType: 'text'
        });
    }

    logoutWildfly(access_token?: string): Observable<any> {
        let httpParams: HttpParams = new HttpParams();
        if (access_token) {
            httpParams = httpParams.set('access_token', access_token);
        }
        return this.http.post(environment.applicationContextUrl + '/GestioneMenu.do', 'comando=doLogout', {
            params: httpParams, headers: this.headers, withCredentials: true, responseType: 'text'
        });
    }
}
