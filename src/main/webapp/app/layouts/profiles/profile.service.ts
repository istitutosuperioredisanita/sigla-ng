import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of as observableOf} from 'rxjs';

import { SERVER_API_URL } from '../../app.constants';
import { ProfileInfo } from './profile-info.model';
import { map } from 'rxjs/operators';

@Injectable()
export class ProfileService {

    private profileInfoUrl = SERVER_API_URL + 'api/profile-info';

    private profileInfo: ProfileInfo;

    constructor(private http: HttpClient) { }

    getProfileInfo(): Observable<ProfileInfo> {
        if (this.profileInfo) {
            return observableOf(this.profileInfo);
        } else {
            return this.http.get(this.profileInfoUrl).pipe(map((pi: ProfileInfo) => {
                this.profileInfo = pi;
                return pi;
            }));
        }
    }
}
