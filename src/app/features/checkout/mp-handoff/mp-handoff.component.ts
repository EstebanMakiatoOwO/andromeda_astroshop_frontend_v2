import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { CheckoutBarComponent } from '../components/checkout-bar.component';
import { PublicFooterComponent } from '../../layout/footer/public-footer.component';

@Component({
  selector: 'app-mp-handoff',
  standalone: true,
  imports: [CheckoutBarComponent, PublicFooterComponent],
  templateUrl: './mp-handoff.component.html',
})
export class MPHandoffComponent implements OnInit {
  protected readonly cart     = inject(CartService);
  protected readonly currency = inject(CurrencyService);
  private readonly router     = inject(Router);

  protected readonly orderNumber = 'AND-024815';

  protected get total(): string {
    const mxn = this.cart.subtotal() + 14500;
    const usd = this.cart.items().reduce((s, i) => s + i.unitPriceUsd * i.qty, 0) + 841;
    return this.currency.format(mxn, usd);
  }

  ngOnInit(): void {
    setTimeout(() => this.router.navigateByUrl('/checkout/confirmacion'), 4000);
  }
}
