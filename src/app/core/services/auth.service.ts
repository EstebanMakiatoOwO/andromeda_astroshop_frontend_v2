import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { AuthUser, LoginCredentials, LoginResponse } from '../models/auth.model';
import { IAuthService } from '../tokens/auth.tokens';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase;
const TOKEN_KEY = 'astroshop_access_token';
const USER_KEY  = 'astroshop_user';

@Injectable({ providedIn: 'root' })
export class AuthService implements IAuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<AuthUser | null>(this.loadUserFromStorage());
  private readonly _isLoading   = signal<boolean>(false);

  readonly currentUser     = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isLoading       = this._isLoading.asReadonly();

  login(credentials: LoginCredentials, rememberMe: boolean): Observable<void> {
    this._isLoading.set(true);
    return this.http
      .post<LoginResponse>(`${API_BASE}/api/v1/auth/admin/login`, credentials)
      .pipe(
        tap(response => {
          const user: AuthUser = { id: '', name: response.name, email: '', role: 'admin' };
          // rememberMe → localStorage (sobrevive al cierre del browser hasta que expira el JWT)
          // sin tilde  → sessionStorage (se borra al cerrar la pestaña)
          const store = rememberMe ? localStorage : sessionStorage;
          store.setItem(TOKEN_KEY, response.jwt);
          store.setItem(USER_KEY, JSON.stringify(user));
          this._currentUser.set(user);
          this._isLoading.set(false);
        }),
        map(() => void 0),
        catchError(err => {
          this._isLoading.set(false);
          return throwError(() => err);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/admin/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw =
        localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
