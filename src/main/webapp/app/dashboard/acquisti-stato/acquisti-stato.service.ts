import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class AcquistiStatoService {

    constructor(
        private http: HttpClient,
    ) {}

    getIndice(codice?: string): Observable<any> {
        let httpParams: HttpParams = new HttpParams();
        if (codice) {
            httpParams = httpParams.set('codice', codice);
        }
        return this.http.get(environment.apiUrl + `/acquisti/stato`, {
            params: httpParams, withCredentials: true
        }).pipe(map((res: any) => res));
    }

}
