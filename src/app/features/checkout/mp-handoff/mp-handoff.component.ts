import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { PaymentService } from '../../../core/services/payment.service';
import { OrderAddress } from '../../../core/services/public-orders.service';
import { CheckoutBarComponent } from '../components/checkout-bar.component';
import { PublicFooterComponent } from '../../layout/footer/public-footer.component';
import { AddressFormValue } from '../checkout-shipping/components/address-form.component';

@Component({
  selector: 'app-mp-handoff',
  standalone: true,
  imports: [CheckoutBarComponent, PublicFooterComponent, RouterLink],
  templateUrl: './mp-handoff.component.html',
})
export class MPHandoffComponent implements OnInit {
  protected readonly cart    = inject(CartService);
  protected readonly currency = inject(CurrencyService);
  private readonly router    = inject(Router);
  private readonly payment   = inject(PaymentService);

  protected readonly errorMsg      = signal('');
  protected readonly isError       = signal(false);
  protected readonly shippingPrice = signal(0);

  protected get total(): string {
    const mxn = this.cart.subtotal() + this.shippingPrice();
    const usd = this.cart.subtotalUsd();
    return this.currency.format(mxn, usd);
  }

  ngOnInit(): void {
    const state: {
      form?: AddressFormValue;
      shippingCarrier?: string;
      shippingMethod?: string;
      shippingPriceMxn?: number;
    } = history.state ?? {};

    this.shippingPrice.set(state.shippingPriceMxn ?? 0);

    if (!state.form) {
      this.router.navigateByUrl('/checkout/envio');
      return;
    }

    const form      = state.form;
    const nameParts = form.name.trim().split(' ');
    const firstname = nameParts[0] ?? '';
    const lastname  = nameParts.slice(1).join(' ') || firstname;

    const address: OrderAddress = {
      firstname,
      lastname,
      street: [form.street, form.numExt, form.numInt ? `Int. ${form.numInt}` : '', `Col. ${form.colonia}`]
        .filter(Boolean).join(', '),
      city:       form.city,
      regionCode: form.state,
      postcode:   form.cp,
      countryId:  'MX',
      telephone:  form.phone,
      email:      form.email,
    };

    const cartToken      = this.cart.isAuthenticated ? null : this.cart.guestToken;
    const shippingCarrier = state.shippingCarrier ?? 'flatrate';
    const shippingMethod  = state.shippingMethod  ?? 'flatrate';
    const shippingPriceMxn = state.shippingPriceMxn ?? 0;

    // Crea preferencia en MP — la orden de Magento se crea después vía webhook
    this.payment.createMpPreference(
      cartToken,
      address,
      shippingCarrier,
      shippingMethod,
      shippingPriceMxn,
    ).subscribe({
      next: pref => {
        const url = pref.sandboxInitPoint || pref.initPoint;
        if (url) {
          window.location.href = url;
        } else {
          this.showError('No se pudo obtener el enlace de pago.');
        }
      },
      error: err => {
        const msg = err?.error?.message ?? 'Ocurrió un error al procesar el pedido.';
        this.showError(msg);
      },
    });
  }

  private showError(msg: string): void {
    this.isError.set(true);
    this.errorMsg.set(msg);
  }
}
