import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { SERVER_API_URL } from '../../app.constants';
import { ProfileInfo } from './profile-info.model';

@Injectable()
export class ProfileService {

    private profileInfoUrl = SERVER_API_URL + 'api/profile-info';

    private profileInfo: ProfileInfo;

    constructor(private http: Http) { }

    getProfileInfo(): Observable<ProfileInfo> {
        if (this.profileInfo) {
            return Observable.of(this.profileInfo);
        } else {
            return this.http.get(this.profileInfoUrl)
                .map((res: Response) => {
                    const data = res.json();
                    const pi = new ProfileInfo();
                    pi.activeProfiles = data.activeProfiles;
                    pi.ribbonEnv = data.ribbonEnv;
                    pi.instituteAcronym = data.instituteAcronym;
                    pi.urlChangePassword = data.urlChangePassword;
                    pi.siglaWildflyURL = data.siglaWildflyURL;
                    pi.keycloakEnabled = data.keycloakEnabled === 'true' ? true : false;
                    pi.inProduction = data.activeProfiles.indexOf('prod') !== -1;
                    pi.swaggerEnabled = data.activeProfiles.indexOf('swagger') !== -1;
                    this.profileInfo = pi;
                    return pi;
            });
        }
    }
}
