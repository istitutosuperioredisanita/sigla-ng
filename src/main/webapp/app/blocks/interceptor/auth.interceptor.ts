import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { environment } from '../../../environments/environment';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private oidcSecurityService: OidcSecurityService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if (((environment.oidc.enable  === 'true') ? true : false) && req.url.indexOf(environment.baseUrl) != -1) {
        return this.oidcSecurityService.isAuthenticated().pipe(
          switchMap((isAuthenticated) => {
            if(!isAuthenticated) {
              return this.oidcSecurityService.forceRefreshSession().pipe(
                switchMap(({accessToken}) => {
                  const copiedReq = req.clone({
                    headers: req.headers
                      .set(`Authorization`, `Bearer ${accessToken}`)
                  });
                  return next.handle(copiedReq);  
                })
              );
            } else {
              return this.oidcSecurityService.getAccessToken().pipe(
                switchMap((accessToken) => {
                  const copiedReq = req.clone({
                    headers: req.headers
                      .set(`Authorization`, `Bearer ${accessToken}`)
                  });
                  return next.handle(copiedReq);  
                })
              );
            }
          })
        );
      }
      return next.handle(req);
  }
}
