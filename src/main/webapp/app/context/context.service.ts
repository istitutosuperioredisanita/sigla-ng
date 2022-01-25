import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { JhiEventManager } from 'ng-jhipster';
import { Observable } from 'rxjs';
import { UserContext, Account} from '../shared';
import { Pair } from './pair.model';
import { Preferiti } from '../context/preferiti.model';
import { Messaggio } from '../context/messaggio.model';
import { IndirizziMail } from './index';
import { SERVER_API_URL } from '../app.constants';
import { ProfileService } from '../layouts/profiles/profile.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class ContextService  {
    esercizi: number[];
    cdsPairs: Pair[];
    uoPairs: Pair[];
    cdrPairs: Pair[];
    cdsModel: Pair;
    uoModel: Pair;
    cdrModel: Pair;
    preferiti: Preferiti[];
    messaggi: Messaggio[];
    headers = new HttpHeaders ({
        'Content-Type': 'application/x-www-form-urlencoded'
    });
    private resourceUrlIndirizziEmail = SERVER_API_URL + 'api/context/indirizzi-mail/';
    private resourceUrlMessaggi = SERVER_API_URL + 'api/context/messaggi/';

    constructor(
        private http: HttpClient,
        private eventManager: JhiEventManager,
        private profileService: ProfileService
    ) {
    }

    findEsercizi(): void {
        this.getEsercizi()
            .subscribe((esercizi) => this.esercizi = esercizi);
    }

    getEsercizi(): Observable<number[]> {
        return this.http.get(SERVER_API_URL + 'api/context/esercizio').pipe(map((res: any) => res));
    }

    findPreferiti(): void {
        this.getPreferiti()
            .subscribe((preferiti) => this.preferiti = preferiti);
    }

    getPreferiti(): Observable<Preferiti[]> {
        return this.http.get(SERVER_API_URL + 'api/context/preferiti').pipe(map((res: any) => res));
    }

    getIndirizziMail(): Observable<IndirizziMail[]> {
        return this.http.get(this.resourceUrlIndirizziEmail).pipe(map((res: any) => res));
    }

    postIndirizziMail(indirizzi: any): Observable<IndirizziMail[]> {
        return this.http.post(this.resourceUrlIndirizziEmail, indirizzi).pipe(map((res: any) => res));
    }

    deleteIndirizziEmail(indirizzi: string[]): Observable<IndirizziMail[]> {
        return this.http.delete(`${this.resourceUrlIndirizziEmail}${indirizzi}`).pipe(map((res: any) => res));
    }

    findMessaggi(): void {
        this.getMessaggi()
            .subscribe((messaggi) => this.messaggi = messaggi);
    }

    getMessaggi(): Observable<Messaggio[]> {
        return this.http.get(this.resourceUrlMessaggi).pipe(map((res: any) => res));
    }

    deleteMessaggi(messaggi: any): Observable<Messaggio[]> {
        return this.http.post(this.resourceUrlMessaggi, messaggi).pipe(map((res: any) => res));
    }

    findCds(account: Account): void {
        this.getCds()
            .subscribe((cds) => {
                this.cdsPairs = cds;
                this.setCdsModel(cds.filter(function(v) {
                    return v.first === account.cds;
                })[0]);
            });
    }

    getCds(uo?: string): Observable<Pair[]> {
        let httpParams: HttpParams = new HttpParams();
        if (uo) {
            httpParams = httpParams.set('uo', uo);
        }
        return this.http.get(SERVER_API_URL + 'api/context/cds', {params: httpParams}).pipe(map((res: any) => res));
    }

    findUo(account?: Account): void {
        this.getUo(account ? account.cds : '')
            .subscribe((uo) => {
                this.uoPairs = uo;
                if (account) {
                    this.setUoModel(uo.filter(function(v) {
                        return v.first === account.uo;
                    })[0]);
                }
            });
    }

    getUo(cds: string): Observable<Pair[]> {
        let httpParams: HttpParams = new HttpParams();
        if (cds) {
            httpParams = httpParams = httpParams.set('cds', cds);
        }
        return this.http.get(SERVER_API_URL + 'api/context/uo', {params: httpParams}).pipe(map((res: any) => res));
    }

    getCdr(uo: string): Observable<Pair[]> {
        let httpParams: HttpParams = new HttpParams();
        if (uo) {
            httpParams = httpParams.set('uo', uo);
        }
        return this.http.get(SERVER_API_URL + 'api/context/cdr', {params: httpParams}).pipe(map((res: any) => res));
    }

    findCdr(account: Account): void {
        this.getCdr(account.uo)
            .subscribe((cdr) => {
                this.cdrPairs = cdr;
                this.setCdRModel(cdr.filter(function(v) {
                    return v.first === account.cdr;
                })[0]);
            });
    }

    saveEsecizio(esercizio: number): Observable<Account> {
        return this.http.post(SERVER_API_URL + 'api/context', {
            'esercizio' : esercizio
        }).pipe(map((res: any) => res));
    }

    saveUserContext(userContext: UserContext): Observable<any> {
        return this.http.post(SERVER_API_URL + 'api/context', userContext).pipe(map((res: any) => res));
    }

    saveWildflyUserContext(userContext: UserContext, account: Account): Observable<string> {
        let httpParams: HttpParams = new HttpParams();
        const parameter = [
            userContext.esercizio,
            String(userContext.cds),
            String(userContext.uo),
            String(userContext.cdr)
        ].join(',');
        httpParams = httpParams.set('comando', 'doSelezionaContesto(' + parameter + ')');
        httpParams = httpParams.set('datetime', String(Date.now()));
        if (account.access_token) {
            httpParams = httpParams.set('access_token', account.access_token);
        }
        return this.profileService.getProfileInfo().pipe(switchMap((profileInfo) => {
            return this.http.get(profileInfo.siglaWildflyURL + '/SIGLA/Login.do', {
                params: httpParams, headers: this.headers, withCredentials: true, responseType: 'text'
            }).pipe(map((res: any) => res));
        }));
    }

    setUoModel(pair: Pair) {
        this.uoModel = pair;
        this.eventManager.broadcast({
            name: 'onSelectUo',
            content: this.uoModel
        });
    }

    setCdsModel(pair: Pair) {
        this.cdsModel = pair;
        this.eventManager.broadcast({
            name: 'onSelectCds',
            content: this.cdsModel
        });
    }

    setCdRModel(pair: Pair) {
        this.cdrModel = pair;
        this.eventManager.broadcast({
            name: 'onSelectCdr',
            content: this.cdrModel
        });
    }
}
