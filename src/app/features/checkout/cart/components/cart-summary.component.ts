import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyService } from '../../../../core/services/currency.service';

const SHIPPING_MXN = 14500;
const SHIPPING_USD = 841;

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  templateUrl: './cart-summary.component.html',
})
export class CartSummaryComponent {
  subtotal    = input.required<number>();
  subtotalUsd = input.required<number>();
  itemCount   = input.required<number>();
  loyaltyPts  = input.required<number>();

  checkout = output<void>();

  protected readonly discountCode = signal('');
  protected readonly currency     = inject(CurrencyService);
  private readonly router         = inject(Router);

  protected get total(): number    { return this.subtotal() + SHIPPING_MXN; }
  protected get totalUsd(): number { return this.subtotalUsd() + SHIPPING_USD; }

  protected fmt(mxn: number, usd: number): string { return this.currency.format(mxn, usd); }

  protected onCheckout(): void { this.checkout.emit(); }
  protected onGuest(): void    { this.router.navigateByUrl('/checkout/envio'); }
}
