import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class AcquistiStrutturaService {

    constructor(
        private http: HttpClient,
    ) {}

    getIndice(esercizio: number): Observable<any> {
        let httpParams: HttpParams = new HttpParams();
        return this.http.get(environment.apiUrl + `/acquisti/struttura/${esercizio}`, {
            params: httpParams, withCredentials: true
        }).pipe(map((res: any) => res));
    }

}
