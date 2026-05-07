import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AUTH_SERVICE_TOKEN } from '../tokens/auth.tokens';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AUTH_SERVICE_TOKEN).getAccessToken();

  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
