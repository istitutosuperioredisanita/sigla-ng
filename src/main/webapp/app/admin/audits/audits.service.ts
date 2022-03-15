import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuditsService  {
    constructor(private http: HttpClient) { }

    query(req: any): Observable<Response> {
        const parameters: HttpParams = new HttpParams();
        parameters.set('fromDate', req.fromDate);
        parameters.set('toDate', req.toDate);
        parameters.set('page', req.page);
        parameters.set('size', req.size);
        parameters.set('sort', req.sort);

        return this.http.get<Response>('management/audits', {params: parameters});
    }
}
