import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SERVER_API_URL } from '../../app.constants';
import { map } from 'rxjs/operators';

@Injectable()
export class ActivateService {

    constructor(private http: HttpClient) {}

    get(key: string): Observable<any> {
        let httpParams: HttpParams = new HttpParams();
        httpParams = httpParams.set('key', key);

        return this.http.get(SERVER_API_URL + 'api/activate', {
            params: httpParams
        }).pipe(map((res: Response) => res));
    }
}
