import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { camelCaseInterceptor } from './core/interceptors/camel-case.interceptor';
import { AuthService } from './core/services/auth.service';
import { AUTH_SERVICE_TOKEN } from './core/tokens/auth.tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([camelCaseInterceptor, authInterceptor])),
    { provide: AUTH_SERVICE_TOKEN, useExisting: AuthService },
  ],
};
