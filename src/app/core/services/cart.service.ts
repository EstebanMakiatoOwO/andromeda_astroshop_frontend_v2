import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, switchMap, of, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../models/cart.model';

const GUEST_TOKEN_KEY = 'astroshop_guest_cart_token';
const AUTH_TOKEN_KEY  = 'astroshop_public_token';

/**
 * 404 on a guest-cart call: the cart behind the stored token no longer exists (cleaned up by
 * Magento, or created against another backend — `npm start` and `start:real` share localStorage
 * on localhost:4200).
 */
function isMissingCart(err: unknown): boolean {
  return err instanceof HttpErrorResponse && err.status === 404;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapItem(i: any): CartItem {
  return {
    id:           i.itemId,
    productId:    i.productId,
    name:         i.name,
    sku:          i.sku ?? null,
    image:        i.image ?? null,
    qty:          i.qty,
    stock:        i.stock ?? 999,
    unitPriceMxn: i.priceMxn ?? i.price ?? 0,
    unitPriceUsd: i.priceUsd ?? i.price ?? 0,
    rowTotalMxn:  i.rowTotalMxn ?? i.rowTotal ?? 0,
    rowTotalUsd:  i.rowTotalUsd ?? i.rowTotal ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCart(r: any): Cart {
  return {
    items:       (r.items ?? []).map(mapItem),
    subtotalMxn: r.subtotalMxn ?? r.subtotal ?? 0,
    subtotalUsd: r.subtotalUsd ?? r.subtotal ?? 0,
    itemCount:   r.itemCount ?? 0,
    cartToken:   r.cartToken ?? null,
  };
}

const EMPTY: Cart = { items: [], subtotalMxn: 0, subtotalUsd: 0, itemCount: 0 };

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1`;

  private readonly _cart = signal<Cart>(EMPTY);

  readonly items       = computed(() => this._cart().items);
  // Units, not lines: two of the same telescope count as 2 (the API's itemCount counts lines)
  readonly count       = computed(() => this._cart().items.reduce((n, i) => n + i.qty, 0));
  readonly subtotal    = computed(() => this._cart().subtotalMxn);
  readonly subtotalUsd = computed(() => this._cart().subtotalUsd);
  readonly isEmpty     = computed(() => this._cart().itemCount === 0);

  // ─── Auth state ───────────────────────────────────────────────────────────

  get isAuthenticated(): boolean {
    const t = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!t && t !== 'undefined' && t !== 'null';
  }

  get guestToken(): string | null {
    return localStorage.getItem(GUEST_TOKEN_KEY);
  }

  // ─── Load ─────────────────────────────────────────────────────────────────

  load(): Observable<Cart> {
    if (this.isAuthenticated) {
      return this.http.get<Cart>(`${this.base}/cart`).pipe(
        tap(r => this._cart.set(mapCart(r)))
      );
    }
    const token = this.guestToken;
    if (token) {
      return this.http.get<Cart>(`${this.base}/guest-cart/${token}`).pipe(
        tap(r => this._cart.set(mapCart(r))),
        catchError(err => {
          if (!isMissingCart(err)) return throwError(() => err);
          this.clearLocal();
          return of(EMPTY);
        }),
      );
    }
    return of(EMPTY);
  }

  // ─── Add ──────────────────────────────────────────────────────────────────

  addItem(productId: number, qty: number): Observable<Cart> {
    if (this.isAuthenticated) {
      return this.http.post<Cart>(`${this.base}/cart/items`, { productId, qty }).pipe(
        tap(r => this._cart.set(mapCart(r)))
      );
    }
    const token = this.guestToken;
    if (token) {
      // Stale token: start a fresh guest cart and retry once
      return this.guestAdd(token, productId, qty).pipe(
        catchError(err => {
          if (!isMissingCart(err)) return throwError(() => err);
          this.clearLocal();
          return this.newGuestCartAndAdd(productId, qty);
        }),
      );
    }
    return this.newGuestCartAndAdd(productId, qty);
  }

  private newGuestCartAndAdd(productId: number, qty: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.base}/guest-cart`, {}).pipe(
      tap(r => { if (r.cartToken) localStorage.setItem(GUEST_TOKEN_KEY, r.cartToken); }),
      switchMap(r => this.guestAdd(r.cartToken!, productId, qty))
    );
  }

  private guestAdd(token: string, productId: number, qty: number): Observable<Cart> {
    return this.http.post<Cart>(
      `${this.base}/guest-cart/${token}/items`, { productId, qty }
    ).pipe(tap(r => this._cart.set(mapCart(r))));
  }

  // ─── Update qty ───────────────────────────────────────────────────────────

  updateQty(id: number, delta: 1 | -1): void {
    const item = this._cart().items.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, Math.min(item.stock, item.qty + delta));
    if (newQty === item.qty) return;

    const save$ = this.isAuthenticated
      ? this.http.put<Cart>(`${this.base}/cart/items/${id}`, { qty: newQty })
      : this.http.put<Cart>(`${this.base}/guest-cart/${this.guestToken}/items/${id}`, { qty: newQty });

    save$.pipe(tap(r => this._cart.set(mapCart(r)))).subscribe({
      error: err => { if (isMissingCart(err)) this.load().subscribe(); },
    });
  }

  // ─── Remove ───────────────────────────────────────────────────────────────

  remove(id: number): void {
    const del$ = this.isAuthenticated
      ? this.http.delete<Cart>(`${this.base}/cart/items/${id}`)
      : this.http.delete<Cart>(`${this.base}/guest-cart/${this.guestToken}/items/${id}`);

    del$.pipe(tap(r => this._cart.set(mapCart(r)))).subscribe({
      error: err => { if (isMissingCart(err)) this.load().subscribe(); },
    });
  }

  // ─── Clear ────────────────────────────────────────────────────────────────

  clearLocal(): void {
    this._cart.set(EMPTY);
    localStorage.removeItem(GUEST_TOKEN_KEY);
  }

  clear(): Observable<unknown> {
    this._cart.set(EMPTY);
    if (this.isAuthenticated) {
      return this.http.delete(`${this.base}/cart`);
    }
    const token = this.guestToken;
    localStorage.removeItem(GUEST_TOKEN_KEY);
    if (token) {
      return this.http.delete(`${this.base}/guest-cart/${token}`);
    }
    return of(true);
  }

  // ─── Called on logout ─────────────────────────────────────────────────────

  resetOnLogout(): void {
    this._cart.set(EMPTY);
  }
}
