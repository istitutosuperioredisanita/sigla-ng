import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { JhiEventManager } from 'ng-jhipster';
import { Observable } from 'rxjs';
import { UserContext, Account} from '../shared';
import { Pair } from './pair.model';
import { Preferiti } from '../context/preferiti.model';
import { Messaggio } from '../context/messaggio.model';
import { IndirizziMail } from './index';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

    constructor(
        private http: HttpClient,
        private eventManager: JhiEventManager,
    ) {
    }

    findEsercizi(cds?: string): void {
        this.getEsercizi(cds)
            .subscribe((esercizi) => this.esercizi = esercizi);
    }

    getEsercizi(cds?: string): Observable<number[]> {
        let httpParams: HttpParams = new HttpParams();
        if (cds) {
            httpParams = httpParams.set('cds', cds);
        }
        return this.http.get(environment.apiUrl + '/context/esercizi', {
            params: httpParams, withCredentials: true
        }).pipe(map((res: number[]) => res));
    }

    findPreferiti(): void {
        this.getPreferiti()
            .subscribe((preferiti) => this.preferiti = preferiti);
    }

    getPreferiti(): Observable<Preferiti[]> {
        return this.http.get(environment.apiUrl + '/context/preferiti', {
            withCredentials: true
        }).pipe(map((res: Preferiti[]) => res));
    }

    getIndirizziMail(): Observable<IndirizziMail[]> {
        return this.http.get(environment.apiUrl + '/context/indirizzi-mail', {
            withCredentials: true
        }).pipe(map((res: IndirizziMail[]) => res));
    }

    postIndirizziMail(indirizzi: any): Observable<IndirizziMail[]> {
        return this.http.post(environment.apiUrl + '/context/indirizzi-mail', indirizzi, {
            withCredentials: true
        }).pipe(map((res: IndirizziMail[]) => res));
    }

    deleteIndirizziEmail(indirizzi: string[]): Observable<IndirizziMail[]> {
        return this.http.delete(`${environment.apiUrl + '/context/indirizzi-mail/'}${indirizzi.join('/') + '/delete'}`, {
            withCredentials: true
        }).pipe(map((res: IndirizziMail[]) => res));
    }

    findMessaggi(): void {
        this.getMessaggi()
            .subscribe((messaggi) => this.messaggi = messaggi);
    }

    getMessaggi(): Observable<Messaggio[]> {
        return this.http.get(environment.apiUrl + '/context/messaggi', {
            withCredentials: true
        }).pipe(map((res: Messaggio[]) => res));
    }

    deleteMessaggi(messaggi: any): Observable<Messaggio[]> {
        return this.http.post(environment.apiUrl + '/context/messaggi', messaggi, {
            withCredentials: true
        }).pipe(map((res: Messaggio[]) => res));
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
        return this.http.get(environment.apiUrl + '/context/cds', {
            params: httpParams, withCredentials: true
        }).pipe(map((res: Pair[]) => res));
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
        return this.http.get(environment.apiUrl + '/context/uo', {
            params: httpParams, withCredentials: true
        }).pipe(map((res: Pair[]) => res));
    }

    getCdr(uo: string): Observable<Pair[]> {
        let httpParams: HttpParams = new HttpParams();
        if (uo) {
            httpParams = httpParams.set('uo', uo);
        }
        return this.http.get(environment.apiUrl + '/context/cdr', {
            params: httpParams, withCredentials: true
        }).pipe(map((res: Pair[]) => res));
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

    saveWildflyUserContext(userContext: UserContext): Observable<string> {
        let httpParams: HttpParams = new HttpParams();
        const parameter = [
            userContext.esercizio,
            String(userContext.cds),
            String(userContext.uo),
            String(userContext.cdr)
        ].join(',');
        httpParams = httpParams.set('comando', 'doSelezionaContesto(' + parameter + ')');
        httpParams = httpParams.set('datetime', String(Date.now()));
        return this.http.get(environment.applicationContextUrl + '/Login.do', {
            params: httpParams, headers: this.headers, withCredentials: true, responseType: 'text'
        }).pipe(map((res: any) => res));
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
