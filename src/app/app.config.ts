import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { camelCaseInterceptor } from './core/interceptors/camel-case.interceptor';
import { AuthService } from './core/services/auth.service';
import { AUTH_SERVICE_TOKEN } from './core/tokens/auth.tokens';
import { StoreConfigService } from './core/services/store-config.service';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([camelCaseInterceptor, authInterceptor])),
    { provide: AUTH_SERVICE_TOKEN, useExisting: AuthService },
    { provide: LOCALE_ID, useValue: 'es' },
    {
      provide: APP_INITIALIZER,
      useFactory: (cfg: StoreConfigService) => () => cfg.load(),
      deps: [StoreConfigService],
      multi: true,
    },
  ],
};
