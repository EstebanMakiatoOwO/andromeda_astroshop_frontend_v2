import { Component, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { CheckoutBarComponent } from '../components/checkout-bar.component';
import { PublicFooterComponent } from '../../layout/footer/public-footer.component';
import { AddressFormComponent } from './components/address-form.component';

interface ShippingOption { id: string; carrier: string; method: string; days: string; priceMxn: number; priceUsd: number; }

const MOCK_OPTIONS: ShippingOption[] = [
  { id: 'fedex-std',    carrier: 'FedEx',   method: 'Estándar',       days: '3-5 días hábiles', priceMxn: 14500, priceUsd: 841 },
  { id: 'fedex-exp',    carrier: 'FedEx',   method: 'Express',        days: '1-2 días hábiles', priceMxn: 24900, priceUsd: 1445 },
  { id: 'dhl-std',      carrier: 'DHL',     method: 'Estándar',       days: '3-5 días hábiles', priceMxn: 13800, priceUsd: 801 },
];

@Component({
  selector: 'app-checkout-shipping',
  standalone: true,
  imports: [RouterLink, CheckoutBarComponent, PublicFooterComponent, AddressFormComponent],
  templateUrl: './checkout-shipping.component.html',
})
export class CheckoutShippingComponent {
  protected readonly cart     = inject(CartService);
  protected readonly currency = inject(CurrencyService);
  private readonly router     = inject(Router);

  @ViewChild(AddressFormComponent) private addressForm!: AddressFormComponent;

  protected readonly shippingOptions = MOCK_OPTIONS;
  protected readonly selectedOption  = signal(MOCK_OPTIONS[0].id);
  protected readonly submitted       = signal(false);

  protected get selected(): ShippingOption {
    return this.shippingOptions.find(o => o.id === this.selectedOption()) ?? MOCK_OPTIONS[0];
  }

  protected get subtotalMxn(): number { return this.cart.subtotal(); }
  protected get subtotalUsd(): number { return this.cart.items().reduce((s, i) => s + i.unitPriceUsd * i.qty, 0); }
  protected get totalMxn(): number    { return this.subtotalMxn + this.selected.priceMxn; }
  protected get totalUsd(): number    { return this.subtotalUsd + this.selected.priceUsd; }

  protected fmt(mxn: number, usd: number): string { return this.currency.format(mxn, usd); }

  protected onContinue(): void {
    this.submitted.set(true);
    if (!this.addressForm?.isValid()) return;
    this.router.navigateByUrl('/checkout/pago');
  }
}
