import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AUTH_SERVICE_TOKEN } from '../tokens/auth.tokens';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AUTH_SERVICE_TOKEN);
  const token = authService.getAccessToken();

  const isAuthEndpoint = req.url.includes('/auth/');
  const authReq = token && !isAuthEndpoint
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
