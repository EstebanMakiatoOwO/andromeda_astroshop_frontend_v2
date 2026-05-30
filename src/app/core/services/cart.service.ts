import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([
    { id: 1, productId: 1, name: 'Celestron NexStar 6SE',  meta: 'computarizado · 150mm', qty: 1, unitPriceMxn: 1245000, unitPriceUsd: 72000, stock: 5,  image: null },
    { id: 2, productId: 2, name: 'Ocular Plössl 25mm',     meta: '1.25" · accesorio',     qty: 1, unitPriceMxn: 38500,   unitPriceUsd: 2230,  stock: 12, image: null },
    { id: 3, productId: 3, name: 'Filtro lunar ND96',       meta: 'óptico · accesorio',    qty: 2, unitPriceMxn: 12900,   unitPriceUsd: 748,   stock: 8,  image: null },
  ]);

  readonly items    = this._items.asReadonly();
  readonly count    = computed(() => this._items().reduce((s, i) => s + i.qty, 0));
  readonly subtotal = computed(() => this._items().reduce((s, i) => s + i.unitPriceMxn * i.qty, 0));

  updateQty(id: number, delta: 1 | -1): void {
    this._items.update(items => items.map(item => {
      if (item.id !== id) return item;
      const qty = Math.max(1, Math.min(item.stock, item.qty + delta));
      return { ...item, qty };
    }));
  }

  remove(id: number): void {
    this._items.update(items => items.filter(i => i.id !== id));
  }

  clear(): void { this._items.set([]); }
}
