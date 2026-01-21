import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class IndiceTempestivitaPagamentiService {

    constructor(
        private http: HttpClient,
    ) {}

    getIndice(esercizio: number, uo?: string): Observable<Map<String, Number>> {
        let httpParams: HttpParams = new HttpParams();
        if (uo) {
            httpParams = httpParams.set('uo', uo);
        }
        return this.http.get(environment.apiUrl + `/indicatorePagamenti/riepilogo/${esercizio}`, {
            params: httpParams, withCredentials: true
        }).pipe(map((res: Map<String, Number>) => res));
    }

}
