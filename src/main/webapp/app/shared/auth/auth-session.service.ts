import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { UserContext } from '../../shared';

@Injectable()
export class AuthServerProvider {

    constructor(
        private http: Http
    ) {}

    login (credentials): Observable<any> {
        let data = 'j_username=' + encodeURIComponent(credentials.username) +
            '&j_password=' + encodeURIComponent(credentials.password) +
            '&remember-me=' + credentials.rememberMe + '&submit=Login';
        let headers = new Headers ({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        return this.http.post('api/authentication', data, {
            headers: headers
        });
    }

    loginWildfly (credentials, userContext: UserContext): Observable<any> {
        let data = 'main.userid=' + encodeURIComponent(credentials.username) +
            '&main.password=' + encodeURIComponent(credentials.password) +
            '&context.esercizio=' + userContext.esercizio +
            '&context.cds=' + userContext.cds +
            '&context.uo=' + userContext.uo +
            '&context.cdr=' + userContext.cdr +
            '&comando=doEntra';
        let headers = new Headers ({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        return this.http.post('/SIGLA/Login.do', data, {
            headers: headers
        });
    }

    loginMultiploWildfly (utenteMultiplo: string, userContext: UserContext): Observable<any> {
        let data = 'main.utente_multiplo=' + utenteMultiplo +
            '&context.esercizio=' + userContext.esercizio +
            '&context.cds=' + userContext.cds +
            '&context.uo=' + userContext.uo +
            '&context.cdr=' + userContext.cdr +
            '&comando=doEntraUtenteMultiplo';
        let headers = new Headers ({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        return this.http.post('/SIGLA/Login.do', data, {
            headers: headers
        });
    }

    logoutWildfly (): Observable<any> {
        let data = 'comando=doLogout';
        let headers = new Headers ({
            'Content-Type': 'application/x-www-form-urlencoded'
        });
        return this.http.post('/SIGLA/GestioneMenu.do', data, {
            headers: headers
        });
    }

    logout (): Observable<any> {
        // logout from the server
        return this.http.post('api/logout', {}).map((response: Response) => {
            // to get a new csrf token call the api
            this.http.get('api/account').subscribe(() => {}, () => {});
            return response;
        });
    }
}
