import { Component, inject, input, output } from '@angular/core';
import { CartItem } from '../../../../core/models/cart.model';
import { CurrencyService } from '../../../../core/services/currency.service';
import { AssetUrlPipe } from '../../../../shared/pipes/asset-url.pipe';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [AssetUrlPipe],
  templateUrl: './cart-item.component.html',
})
export class CartItemComponent {
  item     = input.required<CartItem>();
  qtyChange = output<1 | -1>();
  removed   = output<void>();

  private readonly currency = inject(CurrencyService);

  protected formatUnit(): string {
    const i = this.item();
    return this.currency.format(i.unitPriceMxn, i.unitPriceUsd);
  }

  protected formatTotal(): string {
    const i = this.item();
    return this.currency.format(i.unitPriceMxn * i.qty, i.unitPriceUsd * i.qty);
  }
}
