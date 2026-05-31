import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { PublicAuthService } from '../../../core/services/public-auth.service';
import { CartItemComponent } from './components/cart-item.component';
import { CartSummaryComponent } from './components/cart-summary.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CartItemComponent, CartSummaryComponent],
  templateUrl: './cart.component.html',
})
export class CartComponent {
  protected readonly cart   = inject(CartService);
  protected readonly auth   = inject(PublicAuthService);
  private readonly router   = inject(Router);

  protected readonly subtotalUsd = computed(() =>
    this.cart.items().reduce((s, i) => s + i.unitPriceUsd * i.qty, 0)
  );

  protected readonly loyaltyPts = computed(() =>
    Math.floor(this.cart.subtotal() / 100)
  );

  protected onQtyChange(id: number, delta: 1 | -1): void { this.cart.updateQty(id, delta); }
  protected onRemove(id: number): void                    { this.cart.remove(id); }
  protected onCheckout(): void                            { this.router.navigateByUrl('/checkout/envio'); }
}
