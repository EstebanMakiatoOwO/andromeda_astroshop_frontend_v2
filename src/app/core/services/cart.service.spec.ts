import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CartService } from './cart.service';

const GUEST_TOKEN_KEY = 'astroshop_guest_cart_token';

// API shape after the camel-case interceptor (not registered here, so tests send camelCase)
const apiCart = (items: { itemId: number; productId: number; qty: number; price: number; stock?: number }[], cartToken = 'tok') => ({
  items: items.map(i => ({ ...i, name: `P${i.productId}`, rowTotal: i.price * i.qty, stock: i.stock ?? 10 })),
  subtotal: items.reduce((s, i) => s + i.price * i.qty, 0),
  itemCount: items.length,
  cartToken,
});

describe('CartService', () => {
  let service: CartService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CartService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('counts units, not lines', () => {
    localStorage.setItem(GUEST_TOKEN_KEY, 'tok');
    service.load().subscribe();
    http.expectOne('/api/v1/guest-cart/tok').flush(apiCart([
      { itemId: 1, productId: 8, qty: 2, price: 100 },
      { itemId: 2, productId: 6, qty: 3, price: 50 },
    ]));
    expect(service.count()).toBe(5);
    expect(service.items().length).toBe(2);
    expect(service.subtotal()).toBe(350);
  });

  it('creates a guest cart on the first add and stores its token', () => {
    service.addItem(8, 1).subscribe();
    http.expectOne({ method: 'POST', url: '/api/v1/guest-cart' }).flush(apiCart([], 'nuevo'));
    http.expectOne({ method: 'POST', url: '/api/v1/guest-cart/nuevo/items' })
      .flush(apiCart([{ itemId: 1, productId: 8, qty: 1, price: 100 }], 'nuevo'));
    expect(localStorage.getItem(GUEST_TOKEN_KEY)).toBe('nuevo');
    expect(service.count()).toBe(1);
  });

  it('recovers from a stale guest token when adding (404 → new cart → retry)', () => {
    localStorage.setItem(GUEST_TOKEN_KEY, 'viejo');
    let error: unknown = null;
    service.addItem(8, 1).subscribe({ error: e => (error = e) });

    http.expectOne({ method: 'POST', url: '/api/v1/guest-cart/viejo/items' })
      .flush({ message: 'Carrito no encontrado.' }, { status: 404, statusText: 'Not Found' });
    http.expectOne({ method: 'POST', url: '/api/v1/guest-cart' }).flush(apiCart([], 'nuevo'));
    http.expectOne({ method: 'POST', url: '/api/v1/guest-cart/nuevo/items' })
      .flush(apiCart([{ itemId: 1, productId: 8, qty: 1, price: 100 }], 'nuevo'));

    expect(error).toBeNull();
    expect(localStorage.getItem(GUEST_TOKEN_KEY)).toBe('nuevo');
    expect(service.count()).toBe(1);
  });

  it('drops a stale guest token on load', () => {
    localStorage.setItem(GUEST_TOKEN_KEY, 'viejo');
    let loaded = false;
    service.load().subscribe(() => (loaded = true));
    http.expectOne('/api/v1/guest-cart/viejo').flush({ message: 'Carrito no encontrado.' }, { status: 404, statusText: 'Not Found' });
    expect(loaded).toBe(true);
    expect(localStorage.getItem(GUEST_TOKEN_KEY)).toBeNull();
    expect(service.isEmpty()).toBe(true);
  });

  it('does not swallow other errors (e.g. not enough stock)', () => {
    localStorage.setItem(GUEST_TOKEN_KEY, 'tok');
    let status = 0;
    service.addItem(8, 5).subscribe({ error: e => (status = e.status) });
    http.expectOne('/api/v1/guest-cart/tok/items')
      .flush({ message: 'Solo quedan %1 unidades disponibles de este producto.', parameters: [1] }, { status: 400, statusText: 'Bad Request' });
    expect(status).toBe(400);
    expect(localStorage.getItem(GUEST_TOKEN_KEY)).toBe('tok');
  });

  it('never asks the server for more units than the stock', () => {
    localStorage.setItem(GUEST_TOKEN_KEY, 'tok');
    service.load().subscribe();
    http.expectOne('/api/v1/guest-cart/tok').flush(apiCart([{ itemId: 1, productId: 8, qty: 1, price: 100, stock: 1 }]));
    service.updateQty(1, 1);
    http.expectNone('/api/v1/guest-cart/tok/items/1');
  });
});
