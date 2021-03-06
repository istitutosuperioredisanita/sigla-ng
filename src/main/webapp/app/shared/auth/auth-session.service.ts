import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { UserContext } from '../../shared';

@Injectable()
export class AuthServerProvider {
    headers = new Headers ({
        'Content-Type': 'application/x-www-form-urlencoded'
    });
    constructor(
        private http: Http
    ) {}

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
        return this.http.post('/SIGLA/restapi/login', data, {
            headers: this.headers
        });
    }

    initializeWildfly(): Observable<any> {
        return this.http.post('/SIGLA/Login.do', 'comando=doDefault', {
            headers: this.headers
        });
    }

    loginMultiploWildfly(utenteMultiplo: string, userContext: UserContext): Observable<any> {
        const data = 'main.utente_multiplo=' + utenteMultiplo +
            '&context.esercizio=' + userContext.esercizio +
            '&context.cds=' + userContext.cds +
            '&context.uo=' + userContext.uo +
            '&context.cdr=' + userContext.cdr +
            '&comando=doEntraUtenteMultiplo';
        return this.http.post('/SIGLA/Login.do', data, {
            headers: this.headers
        });
    }

    logoutWildfly(): Observable<any> {
        return this.http.post('/SIGLA/GestioneMenu.do', 'comando=doLogout', {
            headers: this.headers
        });
    }

    logout(): Observable<any> {
        // logout from the server
        return this.http.post('api/logout', {}).map((response: Response) => {
            // to get a new csrf token call the api
            this.http.get('api/account').subscribe(() => {}, () => {});
            return response;
        });
    }
}
