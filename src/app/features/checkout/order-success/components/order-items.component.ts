import { Component, inject, input } from '@angular/core';
import { CartItem } from '../../../../core/models/cart.model';
import { CurrencyService } from '../../../../core/services/currency.service';

@Component({
  selector: 'app-order-items',
  standalone: true,
  templateUrl: './order-items.component.html',
})
export class OrderItemsComponent {
  items        = input.required<CartItem[]>();
  subtotalMxn  = input.required<number>();
  subtotalUsd  = input.required<number>();
  shippingMxn  = input(14500);
  shippingUsd  = input(841);

  protected readonly currency = inject(CurrencyService);

  protected fmt(mxn: number, usd: number): string { return this.currency.format(mxn, usd); }
  protected get totalMxn(): number { return this.subtotalMxn() + this.shippingMxn(); }
  protected get totalUsd(): number { return this.subtotalUsd() + this.shippingUsd(); }
}
