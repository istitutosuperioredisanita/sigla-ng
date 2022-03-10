import {of as observableOf, throwError as observableThrowError, Subject, Observable, pipe} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Token } from '../model/token.model';
import { Principal } from './principal.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthService {
    private static TOKEN_NAME = 'sigla_token';

    // Stored Token
    private token: Token;

    constructor(
        private principal: Principal,
        private http: HttpClient,
    ) {}

    authorize (force) {
        let authReturn = this.principal.identity(force).then(authThen.bind(this));

        return authReturn;

        function authThen () {
            const isAuthenticated = this.principal.isAuthenticated();
            const toStateInfo = this.stateStorageService.getDestinationState().destination;

            // an authenticated user can't access to login and register pages
            if (isAuthenticated && (toStateInfo.name === 'register')) {
                this.router.navigate(['']);
                return false;
            }

            // recover and clear previousState after external login redirect (e.g. oauth2)
            let fromStateInfo = this.stateStorageService.getDestinationState().from;
            let previousState = this.stateStorageService.getPreviousState();
            if (isAuthenticated && !fromStateInfo.name && previousState) {
                this.stateStorageService.resetPreviousState();
                this.router.navigate([previousState.name], { queryParams:  previousState.params  });
                return false;
            }

            if (toStateInfo.data.authorities && toStateInfo.data.authorities.length > 0) {
                return this.principal.hasAnyAuthority(toStateInfo.data.authorities).then(hasAnyAuthority => {
                    if (!hasAnyAuthority) {
                        if (isAuthenticated) {
                            // user is signed in but not authorized for desired state
                            this.router.navigate(['accessdenied']);
                        } else {
                            // user is not authenticated. Show the state they wanted before you
                            // send them to the login service, so you can return them when you're done
                            const toStateParamsInfo = this.stateStorageService.getDestinationState().params;
                            this.stateStorageService.storePreviousState(toStateInfo.name, toStateParamsInfo);
                            // now, send them to the signin state so they can log in
                            this.router.navigate(['']);
                        }
                    }
                    return hasAnyAuthority;
                });
            }
            return true;
        }
    }

    private setToken(token: Token) {
        this.token = token;
        if (this.token == null) {
          localStorage.removeItem(AuthService.TOKEN_NAME);
        } else {
          localStorage.setItem(AuthService.TOKEN_NAME, JSON.stringify(this.token));
        }
    }

    /**
    * Il token.
    * @returns {Token}
    */
    public getToken(): Token {
        if (this.token) {
            return this.token;
        }
        this.token = JSON.parse(localStorage.getItem(AuthService.TOKEN_NAME));
        if (this.token) {
            return this.token;
        }
        return null;
    }

    /**
    * Se il token è scaduto.
    * @returns {Boolean}
    */
    public isTokenExpired(): Boolean {
        return this.getToken().valid_until <= new Date().getTime();
    }

    /**
    * Recupera il token (refreshato in caso di bisogno).
    * @returns {Observable<Token>}
    */
    public getRefreshedToken(): Observable<Token> {
        if (this.getToken() == null) {
            return observableOf(null);
        }
        if (!this.isTokenExpired()) {
            return observableOf(this.getToken());
        }
        return this.refreshToken();
    }

    public refreshToken(): Observable<Token> {
        return this.http.get<Token>('/api/token').pipe(
            map(
              (token) => {
                token.valid_until = token.exp * 1000;
                this.setToken(token);
                return this.getToken();
              }
            )
        );
        pipe();
    }

}
