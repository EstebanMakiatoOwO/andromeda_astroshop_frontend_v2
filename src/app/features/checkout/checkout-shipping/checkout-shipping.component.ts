import { Component, inject, signal, ViewChild, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ShippingService, ShippingRate } from '../../../core/services/shipping.service';
import { CheckoutBarComponent } from '../components/checkout-bar.component';
import { PublicFooterComponent } from '../../layout/footer/public-footer.component';
import { AddressFormComponent, AddressFormValue } from './components/address-form.component';

@Component({
  selector: 'app-checkout-shipping',
  standalone: true,
  imports: [RouterLink, CheckoutBarComponent, PublicFooterComponent, AddressFormComponent],
  templateUrl: './checkout-shipping.component.html',
})
export class CheckoutShippingComponent implements OnInit {
  protected readonly cart     = inject(CartService);
  protected readonly currency = inject(CurrencyService);
  private readonly router     = inject(Router);
  private readonly shipping   = inject(ShippingService);

  @ViewChild(AddressFormComponent) private addressForm!: AddressFormComponent;

  protected readonly rates          = signal<ShippingRate[]>([]);
  protected readonly loadingRates   = signal(false);
  protected readonly selectedRateId = signal('');
  protected readonly submitted      = signal(false);
  protected readonly formValue      = signal<AddressFormValue | null>(null);
  private lastCp = '';

  protected readonly selectedRate = computed(() =>
    this.rates().find(r => r.carrierCode + '_' + r.methodCode === this.selectedRateId())
    ?? this.rates()[0]
    ?? null
  );

  protected get subtotalMxn(): number { return this.cart.subtotal(); }
  protected get subtotalUsd(): number { return this.cart.subtotalUsd(); }
  protected get shippingMxn(): number { return this.selectedRate()?.price ?? 0; }
  protected get totalMxn(): number    { return this.subtotalMxn + this.shippingMxn; }

  protected fmt(mxn: number, usd: number): string { return this.currency.format(mxn, usd); }

  ngOnInit(): void {
    // Ensure cart is loaded before we need productId for shipping estimate
    if (this.cart.isEmpty()) {
      this.cart.load().subscribe();
    }
  }

  protected onFormChange(val: AddressFormValue): void {
    this.formValue.set(val);
    if (val.cp && val.cp.length >= 5 && val.cp !== this.lastCp) {
      this.lastCp = val.cp;
      this.loadRates(val.cp);
    }
  }

  private loadRates(postcode: string): void {
    const items = this.cart.items();
    const firstItem = items[0];
    if (!firstItem) {
      // Cart not loaded yet — load it then retry
      this.cart.load().subscribe(() => {
        const item = this.cart.items()[0];
        if (item) this.fetchRates(postcode, item.productId);
      });
      return;
    }
    this.fetchRates(postcode, firstItem.productId);
  }

  private fetchRates(postcode: string, productId: number): void {

    this.loadingRates.set(true);
    this.shipping.estimate(postcode, productId, 1).subscribe({
      next: rates => {
        this.rates.set(rates);
        if (rates.length) {
          this.selectedRateId.set(rates[0].carrierCode + '_' + rates[0].methodCode);
        }
        this.loadingRates.set(false);
      },
      error: () => this.loadingRates.set(false),
    });
  }

  protected onContinue(): void {
    this.submitted.set(true);
    if (!this.addressForm?.isValid()) return;

    const form = this.addressForm.getValue();
    const rate = this.selectedRate();

    this.router.navigateByUrl('/checkout/pago', {
      state: {
        form,
        shippingCarrier:  rate?.carrierCode ?? 'flatrate',
        shippingMethod:   rate?.methodCode  ?? 'flatrate',
        shippingPriceMxn: rate?.price ?? 0,
      }
    });
  }
}
