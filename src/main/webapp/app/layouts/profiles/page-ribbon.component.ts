import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { ProfileInfo } from './profile-info.model';
import { Principal } from '../../shared';

@Component({
    selector: 'jhi-page-ribbon',
    template: `<div class="ribbon" *ngIf="ribbonEnv"><a href="" jhiTranslate="global.ribbon.{{ribbonEnv}}">{{ribbonEnv}}</a></div>`,
    styleUrls: [
        'page-ribbon.css'
    ]
})
export class PageRibbonComponent implements OnInit {

    profileInfo: ProfileInfo;
    ribbonEnv: string;

    constructor(private profileService: ProfileService, public principal: Principal) {}

    ngOnInit() {
        if (this.isAuthenticated()) {
            this.profileService.getProfileInfo().subscribe(profileInfo => {
                this.profileInfo = profileInfo;
                this.ribbonEnv = profileInfo.ribbonEnv;
            });
        }
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

}
