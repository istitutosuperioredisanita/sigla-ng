import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { UserContext, Account} from '../shared';
import { Pair } from './pair.model';
import { Preferiti } from '../context/preferiti.model';

@Injectable()
export class ContextService  {
    esercizi: number[];
    allCdsPairs: Pair[];
    cdsPairs: Pair[];
    uoPairs: Pair[];
    cdrPairs: Pair[];
    cdsModel: Pair;
    uoModel: Pair;
    cdrModel: Pair;
    preferiti: Preferiti[];

    constructor(
        private http: Http
    ) {}

    findEsercizi(): void {
        this.getEsercizi()
            .subscribe((esercizi) => this.esercizi = esercizi);
    }

    getEsercizi(): Observable<number[]> {
        return this.http.get('/api/context/esercizio').map((res: Response) => res.json());
    }

    findPreferiti(): void {
        this.getPreferiti()
            .subscribe((preferiti) => this.preferiti = preferiti);
    }

    getPreferiti(): Observable<Preferiti[]> {
        return this.http.get('/api/context/preferiti').map((res: Response) => res.json());
    }

    findUo(account: Account): void {
        this.getUo(account.cds)
            .subscribe((uo) => {
                this.uoPairs = uo;
                this.uoModel = uo.filter(function(v) {
                    return v.first === account.uo;
                })[0];
            });
    }

    getUo(cds: string): Observable<Pair[]> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('cds', cds);
        return this.http.get('/api/context/uo', {search: params}).map((res: Response) => res.json());
    }

    resetCds(): Pair[] {
        this.uoModel = undefined;
        this.cdrModel = undefined;
        this.cdsPairs = this.allCdsPairs;
        return this.allCdsPairs;
    }

    allCds(): void {
        this.getCds('')
            .subscribe((cds) => {
                this.allCdsPairs = cds;
            });
    }

    findCds(account: Account): void {
        this.getCds(account.uo)
            .subscribe((cds) => {
                this.cdsPairs = cds;
                this.cdsModel = cds.filter(function(v) {
                    return v.first === account.cds;
                })[0];
            });
    }

    getCds(uo: string): Observable<Pair[]> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('uo', uo);
        return this.http.get('/api/context/cds', {search: params}).map((res: Response) => res.json());
    }

    getCdr(uo: string): Observable<Pair[]> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('uo', uo);
        return this.http.get('/api/context/cdr', {search: params}).map((res: Response) => res.json());
    }

    findCdr(account: Account): void {
        this.getCdr(account.uo)
            .subscribe((cdr) => {
                this.cdrPairs = cdr;
                this.cdrModel = cdr.filter(function(v) {
                    return v.first === account.cdr;
                })[0];
            });
    }

    saveEsecizio(esercizio: number): Observable<Response> {
        return this.http.post('api/context', {
            'esercizio' : esercizio
        }).map((res: Response) => res.json());
    }

    saveWildflyEsercizio(esercizio: number): Observable<string> {
        const params: URLSearchParams = new URLSearchParams();
        params.set('comando', 'doSelezionaContesto(' + esercizio + ',null,null,null)');
        return this.http.get('/SIGLA/Login.do', {
           search: params
        }).map((res: Response) => res.text());
    }

    saveUserContext(userContext: UserContext): Observable<any> {
        return this.http.post('api/context', userContext).map((res: Response) => res.json());
    }

    saveWildflyUserContext(userContext: UserContext): Observable<string> {
        const params: URLSearchParams = new URLSearchParams();
        const parameter = [
            userContext.esercizio,
            String(userContext.cds),
            String(userContext.uo),
            String(userContext.cdr)
        ].join(',');
        params.set('comando', 'doSelezionaContesto(' + parameter + ')');
        return this.http.get('/SIGLA/Login.do', {
           search: params
        }).map((res: Response) => res.text());
    }

}
