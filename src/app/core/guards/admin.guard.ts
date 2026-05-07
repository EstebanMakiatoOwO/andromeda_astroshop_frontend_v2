import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AUTH_SERVICE_TOKEN } from '../tokens/auth.tokens';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AUTH_SERVICE_TOKEN);
  const router = inject(Router);

  return auth.isAuthenticated() || router.createUrlTree(['/admin/login']);
};
