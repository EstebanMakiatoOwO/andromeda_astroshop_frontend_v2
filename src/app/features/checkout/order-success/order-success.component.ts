import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { PaymentService } from '../../../core/services/payment.service';
import { OrderSummary } from '../../../core/services/public-orders.service';
import { CheckoutBarComponent } from '../components/checkout-bar.component';
import { PublicFooterComponent } from '../../layout/footer/public-footer.component';
import { OrderTrackingComponent, TrackingStep } from './components/order-tracking.component';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink, CheckoutBarComponent, PublicFooterComponent, OrderTrackingComponent],
  templateUrl: './order-success.component.html',
})
export class OrderSuccessComponent implements OnInit {
  protected readonly cart    = inject(CartService);
  private readonly route     = inject(ActivatedRoute);
  private readonly payment   = inject(PaymentService);

  protected readonly order     = signal<OrderSummary | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMsg  = signal('');

  protected readonly trackingSteps: TrackingStep[] = [
    { label: 'Confirmado',     sub: 'hoy',           done: true,  active: false },
    { label: 'En preparación', sub: 'en 24-48h',     done: false, active: true  },
    { label: 'Despachado',     sub: 'FedEx / DHL',   done: false, active: false },
    { label: 'Entregado',      sub: 'est. 3-5 días', done: false, active: false },
  ];

  protected statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending:    'en proceso',
      processing: 'confirmado',
      complete:   'completado',
      canceled:   'cancelado',
      holded:     'en revisión',
    };
    return map[status?.toLowerCase()] ?? status;
  }

  ngOnInit(): void {
    this.cart.clearLocal();

    const params    = this.route.snapshot.queryParamMap;
    const ref       = params.get('external_reference');
    const paymentId = params.get('payment_id') ?? params.get('collection_id');
    const status    = params.get('status') ?? params.get('collection_status');

    if (!ref || !paymentId) {
      this.isLoading.set(false);
      return;
    }

    if (status !== 'approved') {
      // Pago pendiente o rechazado — no crear orden
      this.isLoading.set(false);
      this.errorMsg.set(status === 'pending'
        ? 'Tu pago está en revisión. Te notificaremos cuando se confirme.'
        : 'El pago no fue aprobado.');
      return;
    }

    // Verificar con MP y crear la orden
    this.payment.capturePayment(ref, paymentId).subscribe({
      next:  (o: OrderSummary) => { this.order.set(o); this.isLoading.set(false); },
      error: (err: { error?: { message?: string } }) => {
        this.isLoading.set(false);
        this.errorMsg.set(err?.error?.message ?? 'No se pudo confirmar el pedido.');
      },
    });
  }
}
