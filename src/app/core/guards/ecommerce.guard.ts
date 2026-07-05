import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StoreConfigService } from '../services/store-config.service';

export const ecommerceGuard: CanActivateFn = () => {
  const config = inject(StoreConfigService);
  const router = inject(Router);

  if (config.ecommerceEnabled()) return true;
  return router.createUrlTree(['/']);
};
