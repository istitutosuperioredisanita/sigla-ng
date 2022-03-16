import { Observable } from 'rxjs';
import { switchMap, take} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import { AuthService } from '../../shared/auth/auth.service';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Le richieste di config non devono essere intercettate
    if (req.url.indexOf('/SIGLA') === -1) {
      return next.handle(req);
    }

    return this.authService.getRefreshedToken().pipe(
      take(1),
      switchMap((token) => {
        if (token && token.access_token) {
          const copiedReq = req.clone({
            params: req.params
              .set('access_token', token.access_token)
          });
          return next.handle(copiedReq);
        }
        return next.handle(req);
      }));
  }
}
