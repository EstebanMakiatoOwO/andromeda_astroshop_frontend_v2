import { Injectable, signal, computed } from '@angular/core';

export type Currency = 'MXN' | 'USD';

const STORAGE_KEY = 'astroshop_currency';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly _currency = signal<Currency>(
    (localStorage.getItem(STORAGE_KEY) as Currency) ?? 'MXN'
  );

  readonly currency = this._currency.asReadonly();
  readonly isMxn    = computed(() => this._currency() === 'MXN');

  toggle(): void {
    const next: Currency = this._currency() === 'MXN' ? 'USD' : 'MXN';
    this._currency.set(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  format(priceMxn: number, priceUsd: number): string {
    if (this._currency() === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', maximumFractionDigits: 2,
      }).format(priceUsd) + ' USD';
    }
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(priceMxn) + ' MXN';
  }
}
