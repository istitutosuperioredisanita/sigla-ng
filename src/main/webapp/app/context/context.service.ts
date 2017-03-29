import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { UserContext, Principal } from '../shared';
import { Pair } from './pair.model';

@Injectable()
export class ContextService  {
    esercizi: number[];
    cdsPairs: Pair[];
    uoPairs: Pair[];
    cdrPairs: Pair[];
    cdsModel: Pair;
    uoModel: Pair;
    cdrModel: Pair;

    constructor(
        private http: Http,
        public principal: Principal
    ) {
        this.getEsercizi()
            .subscribe(esercizi => this.esercizi = esercizi);
        this.getCds(this.principal.getAccount().uo)
            .subscribe(cds => {
                let that = this;
                this.cdsPairs = cds;
                this.cdsModel = cds.filter(function(v) {
                    return v.first === that.principal.getAccount().cds;
                })[0];
            });
        this.getUo(this.principal.getAccount().cds)
            .subscribe(uo => {
                let that = this;
                this.uoPairs = uo;
                this.uoModel = uo.filter(function(v) {
                    return v.first === that.principal.getAccount().uo;
                })[0];
            });
     }

    getEsercizi(): Observable<number[]> {
        return this.http.get('/api/context/esercizio').map((res: Response) => res.json());
    }

    getUo(cds: string): Observable<Pair[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('cds', cds);
        return this.http.get('/api/context/uo', {search: params}).map((res: Response) => res.json());
    }

    getCds(uo: string): Observable<Pair[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('uo', uo);
        return this.http.get('/api/context/cds', {search: params}).map((res: Response) => res.json());
    }

    saveEsecizio(esercizio: number): Observable<Response> {
        return this.http.post('api/context', {
            'esercizio' : esercizio
        }).map((res: Response) => res.json());
    }

    saveUserContext(userContext: UserContext): Observable<Response> {
        return this.http.post('api/context', userContext).map((res: Response) => res.json());
    }

}
