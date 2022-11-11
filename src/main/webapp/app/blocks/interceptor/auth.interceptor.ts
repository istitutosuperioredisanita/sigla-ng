import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private oidcSecurityService: OidcSecurityService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if ((environment.oidc.enable  === 'true') ? true : false) {
        const token = this.oidcSecurityService.getAccessToken().subscribe((token) => {
          const copiedReq = req.clone({
            params: req.params
              .set(`access_token`, token)
          });
          return next.handle(copiedReq);
        });
      }
      return next.handle(req);
  }
}
