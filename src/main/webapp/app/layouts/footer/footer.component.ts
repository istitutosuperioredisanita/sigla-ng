import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../profiles/profile.service'; // FIXME barrel doesnt work here
@Component({
    selector: 'jhi-footer',
    templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {
     instituteAcronym: string;

     constructor(
             private profileService: ProfileService,
         ) {
         }

     ngOnInit() {
         this.profileService.getProfileInfo().subscribe((profileInfo) => {
             this.instituteAcronym = profileInfo.instituteAcronym;
            });
     }
 }
