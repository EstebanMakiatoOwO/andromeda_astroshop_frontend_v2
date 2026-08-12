import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { StoreConfigService } from '../services/store-config.service';

export const ecommerceGuard: CanActivateFn = () => {
  const config = inject(StoreConfigService);
  const router = inject(Router);

  return config.load().pipe(
    map(enabled => enabled ? true : router.createUrlTree(['/'])),
  );
};
