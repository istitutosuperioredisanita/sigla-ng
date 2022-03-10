import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileService } from '../../layouts/profiles/profile.service';
import { Account, UserContext } from '../../shared';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthServerProvider {
    headers = new HttpHeaders ({
        'Content-Type': 'application/x-www-form-urlencoded'
    });
    constructor(
        private http: HttpClient,
        private profileService: ProfileService
    ) {
    }

    login(credentials): Observable<any> {
        const data = 'j_username=' + encodeURIComponent(credentials.username) +
            '&j_password=' + encodeURIComponent(credentials.password) +
            '&remember-me=' + credentials.rememberMe + '&submit=Login';
        return this.http.post('api/authentication', data, {
            headers: this.headers
        });
    }

    loginWildfly(credentials, userContext: UserContext): Observable<any> {
        const data = 'j_username=' + encodeURIComponent(credentials.username) +
            '&j_password=' + encodeURIComponent(credentials.password);
        return this.profileService.getProfileInfo().pipe(switchMap((profileInfo) => {
            return this.http.post(profileInfo.siglaWildflyURL + '/SIGLA/restapi/login', data, {
                headers: this.headers, withCredentials: true, responseType: 'text'
            });
        }));
    }

    initializeWildfly(account: Account): Observable<any> {
        let httpParams: HttpParams = new HttpParams();
        httpParams = httpParams.set('comando', 'doDefaultNG');
        httpParams = httpParams.set('datetime', String(Date.now()));
        return this.profileService.getProfileInfo().pipe(switchMap((profileInfo) => {
            return this.http.get(profileInfo.siglaWildflyURL + '/SIGLA/Login.do', {
                params: httpParams, headers: this.headers, withCredentials: true, responseType: 'text'
            });
        }));
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
        return this.profileService.getProfileInfo().pipe(switchMap((profileInfo) => {
            return this.http.post(profileInfo.siglaWildflyURL + '/SIGLA/Login.do', data, {
                params: httpParams, headers: this.headers, withCredentials: true, responseType: 'text'
            });
        }));
    }

    logoutWildfly(access_token?: string): Observable<any> {
        let httpParams: HttpParams = new HttpParams();
        if (access_token) {
            httpParams = httpParams.set('access_token', access_token);
        }
        return this.profileService.getProfileInfo().pipe(switchMap((profileInfo) => {
            return this.http.post(profileInfo.siglaWildflyURL + '/SIGLA/GestioneMenu.do', 'comando=doLogout', {
                params: httpParams, headers: this.headers, withCredentials: true, responseType: 'text'
            });
        }));
    }

    logout(): Observable<any> {
        // logout from the server
        return this.http.post('api/logout', {}).pipe(map((response: Response) => {
            // to get a new csrf token call the api
            this.http.get('api/account').subscribe(() => {}, () => {});
            return response;
        }));
    }
}
