import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AUTH_SERVICE_TOKEN } from '../tokens/auth.tokens';
import { PublicAuthService } from '../services/public-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const adminAuth  = inject(AUTH_SERVICE_TOKEN);
  const publicAuth = inject(PublicAuthService);

  const isAuthEndpoint = req.url.includes('/auth/');
  const token = !isAuthEndpoint
    ? (adminAuth.getAccessToken() ?? publicAuth.getAccessToken())
    : null;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        adminAuth.logout();
      }
      return throwError(() => error);
    }),
  );
};
