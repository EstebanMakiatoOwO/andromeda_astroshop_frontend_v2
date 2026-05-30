import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutBarComponent } from '../components/checkout-bar.component';
import { PublicFooterComponent } from '../../layout/footer/public-footer.component';
import { OrderTrackingComponent, TrackingStep } from './components/order-tracking.component';
import { OrderItemsComponent } from './components/order-items.component';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink, CheckoutBarComponent, PublicFooterComponent, OrderTrackingComponent, OrderItemsComponent],
  templateUrl: './order-success.component.html',
})
export class OrderSuccessComponent implements OnInit {
  protected readonly cart = inject(CartService);

  protected readonly orderNumber = 'AND-024815';
  protected readonly email       = 'usuario@email.com';

  protected readonly subtotalMxn = computed(() => this.cart.subtotal());
  protected readonly subtotalUsd = computed(() =>
    this.cart.items().reduce((s, i) => s + i.unitPriceUsd * i.qty, 0)
  );
  protected readonly loyaltyPts  = computed(() => Math.floor(this.subtotalMxn() / 100));

  protected readonly trackingSteps: TrackingStep[] = [
    { label: 'Confirmado',     sub: 'hoy',         done: true,  active: false },
    { label: 'En preparación', sub: 'en 24-48h',   done: false, active: true  },
    { label: 'Despachado',     sub: 'FedEx / DHL', done: false, active: false },
    { label: 'Entregado',      sub: 'est. 3-5 días',done: false, active: false },
  ];

  ngOnInit(): void { this.cart.clear(); }
}
