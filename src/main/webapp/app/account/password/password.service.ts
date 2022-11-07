import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class PasswordService {

    constructor(private http: HttpClient) {}

    save(newPassword: string): Observable<any> {
        return this.http.post(environment.apiUrl + '/account/change-password', {
            newPassword
        }, {
            withCredentials: true
        });
    }
}
