import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { PublicUser, PublicLoginResponse, PublicRegisterResponse } from '../models/public-user.model';
import { CartService } from './cart.service';
import { environment } from '../../../environments/environment';

const API_BASE  = environment.apiBase;
const TOKEN_KEY = 'astroshop_public_token';
const USER_KEY  = 'astroshop_public_user';

@Injectable({ providedIn: 'root' })
export class PublicAuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cart   = inject(CartService);

  private readonly _currentUser = signal<PublicUser | null>(this.loadUserFromStorage());
  // Load cart from server if user is already authenticated on app start
  private readonly _cartInit = this._currentUser() ? setTimeout(() => this.cart.load().subscribe(), 0) : null;
  private readonly _isLoading   = signal<boolean>(false);

  readonly currentUser     = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null && !this.isTokenExpired());
  readonly isLoading       = this._isLoading.asReadonly();

  login(email: string, password: string): Observable<void> {
    this._isLoading.set(true);
    return this.http
      .post<PublicLoginResponse>(`${API_BASE}/api/v1/auth/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem(TOKEN_KEY, response.jwt);
          const user: PublicUser = { id: 0, name: response.name, email, role: 'USER' };
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          this._currentUser.set(user);
          this._isLoading.set(false);
          this.cart.load().subscribe(); // sync server cart on login
        }),
        map(() => void 0),
        catchError(err => {
          this._isLoading.set(false);
          return throwError(() => err);
        }),
      );
  }

  register(name: string, email: string, password: string): Observable<PublicRegisterResponse> {
    this._isLoading.set(true);
    return this.http
      .post<PublicRegisterResponse>(`${API_BASE}/api/v1/auth/register`, { name, email, password })
      .pipe(
        tap(() => this._isLoading.set(false)),
        catchError(err => {
          this._isLoading.set(false);
          return throwError(() => err);
        }),
      );
  }

  verifyEmail(token: string): Observable<void> {
    return this.http
      .get<void>(`${API_BASE}/api/v1/auth/verify`, { params: { token } });
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.cart.resetOnLogout();
    this.router.navigate(['/']);
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
  }

  private isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      return payload.exp * 1000 < Date.now();
    } catch {
      return false;
    }
  }

  private loadUserFromStorage(): PublicUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
              return null;
            }
          }
        } catch { /* no se puede decodificar, se ignora la expiración */ }
      }
      return JSON.parse(raw) as PublicUser;
    } catch {
      return null;
    }
  }
}
