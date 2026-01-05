import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router';
import { LanguageHelper } from '../../shared';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'jhi-main',
    templateUrl: './main.component.html',
    standalone: false
})
export class JhiMainComponent implements OnInit {
    constructor(
        private languageHelper: LanguageHelper,
        private router: Router,
        private translateService: TranslateService
    ) {}

    private getPageTitle(routeSnapshot: ActivatedRouteSnapshot) {
        let title: string = (routeSnapshot.data && routeSnapshot.data['pageTitle']) ? routeSnapshot.data['pageTitle'] : 'siglaApp';
        if (routeSnapshot.firstChild) {
            title = this.getPageTitle(routeSnapshot.firstChild) || title;
        }
        return title;
    }

    ngOnInit() {
        this.translateService.setDefaultLang('it');
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.languageHelper.updateTitle(this.getPageTitle(this.router.routerState.snapshot.root));
            }
        });
    }
}
