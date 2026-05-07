import { InjectionToken, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthUser, LoginCredentials } from '../models/auth.model';

export interface IAuthService {
  readonly currentUser: Signal<AuthUser | null>;
  readonly isAuthenticated: Signal<boolean>;
  readonly isLoading: Signal<boolean>;
  login(credentials: LoginCredentials, rememberMe: boolean): Observable<void>;
  logout(): void;
  getAccessToken(): string | null;
}

export const AUTH_SERVICE_TOKEN = new InjectionToken<IAuthService>('AUTH_SERVICE_TOKEN');
