import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrdersService } from '../../../../core/services/orders.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import {
  AdminOrder, AdminOrderItem, AdminOrderPayment, OrderStatus,
} from '../../../../core/models/order.model';

interface TimelineEvent {
  label: string;
  sub: string;
  timestamp: string | null;
  done: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:   'pendiente',
  PAID:      'pagado',
  SHIPPED:   'enviado',
  CANCELLED: 'cancelado',
  REFUNDED:  'reembolsado',
};

const STATUS_BADGE: Record<string, string> = {
  PENDING:   'bg-warn-soft text-warn',
  PAID:      'bg-success-soft text-success',
  SHIPPED:   'bg-accent-soft text-accent',
  CANCELLED: 'bg-error-soft text-error',
  REFUNDED:  'bg-error-soft text-error',
};

function ars(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function fmtTs(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly svc    = inject(OrdersService);
  private readonly bc     = inject(BreadcrumbService);

  protected readonly order         = signal<AdminOrder | null>(null);
  protected readonly payment       = signal<AdminOrderPayment | null>(null);
  protected readonly isLoading     = signal(true);
  protected readonly hasError      = signal(false);
  protected readonly notesValue    = signal('');
  protected readonly savingNotes   = signal(false);
  protected readonly updatingStatus = signal(false);

  protected readonly timeline = computed<TimelineEvent[]>(() => {
    const o = this.order();
    const p = this.payment();
    if (!o) return [];

    const events: TimelineEvent[] = [
      {
        label: 'Orden creada',
        sub: o.guestEmail ?? (o.userId ? `usuario #${o.userId}` : 'invitado'),
        timestamp: o.createdAt,
        done: true,
      },
    ];

    if (p) {
      const approved = p.status === 'approved' || ['PAID', 'SHIPPED', 'REFUNDED'].includes(o.status);
      events.push({
        label: approved ? 'Pago aprobado (MercadoPago)' : 'Pago pendiente',
        sub: `ID: ${p.mpPaymentId}`,
        timestamp: approved ? (p.paidAt ?? o.updatedAt) : null,
        done: approved,
      });
    }

    const shipped = ['SHIPPED', 'REFUNDED'].includes(o.status);
    events.push({
      label: 'Enviado',
      sub: shipped ? '' : 'pendiente',
      timestamp: shipped ? o.updatedAt : null,
      done: shipped,
    });

    if (o.status === 'CANCELLED') {
      events.push({ label: 'Cancelado', sub: '', timestamp: o.updatedAt, done: true });
    } else if (o.status === 'REFUNDED') {
      events.push({ label: 'Reembolsado', sub: '', timestamp: o.updatedAt, done: true });
    }

    return events;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.bc.set([
      { label: 'Órdenes', route: '/admin/orders' },
      { label: `#A-${id}` },
    ]);
    this.loadOrder(id);
  }

  private loadOrder(id: number): void {
    this.isLoading.set(true);
    this.svc.getOrder(id).subscribe({
      next: ({ order, payment }) => {
        this.order.set(order);
        this.payment.set(payment);
        this.notesValue.set(order.notes ?? '');
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  protected markAsShipped(): void {
    this.changeStatus('SHIPPED');
  }

  protected cancelOrder(): void {
    this.changeStatus('CANCELLED');
  }

  protected refundOrder(): void {
    this.changeStatus('REFUNDED');
  }

  private changeStatus(status: OrderStatus): void {
    const o = this.order();
    if (!o) return;
    this.updatingStatus.set(true);
    this.svc.updateStatus(o.id, status).subscribe({
      next: updated => {
        this.order.set(updated);
        this.updatingStatus.set(false);
      },
      error: () => this.updatingStatus.set(false),
    });
  }

  protected saveNotes(): void {
    const o = this.order();
    if (!o) return;
    this.savingNotes.set(true);
    this.svc.updateNotes(o.id, this.notesValue()).subscribe({
      next: updated => {
        this.order.set(updated);
        this.savingNotes.set(false);
      },
      error: () => this.savingNotes.set(false),
    });
  }

  protected statusLabel(s: string): string {
    return STATUS_LABEL[s] ?? s.toLowerCase();
  }

  protected badgeClass(s: string): string {
    return 'px-2 py-0.5 rounded-full text-[10px] font-semibold ' + (STATUS_BADGE[s] ?? 'bg-surface-4 text-ink-2');
  }

  protected mpStatusLabel(s: string): string {
    const map: Record<string, string> = {
      approved: 'aprobado',
      pending:  'pendiente',
      rejected: 'rechazado',
      refunded: 'reembolsado',
    };
    return map[s] ?? s;
  }

  protected mpBadgeClass(s: string): string {
    const map: Record<string, string> = {
      approved: 'bg-success-soft text-success',
      pending:  'bg-warn-soft text-warn',
      rejected: 'bg-error-soft text-error',
      refunded: 'bg-error-soft text-error',
    };
    return 'px-2 py-0.5 rounded-full text-[10px] font-semibold ' + (map[s] ?? 'bg-surface-4 text-ink-2');
  }

  protected ars     = ars;
  protected fmtTs   = fmtTs;

  protected itemSubtotal(item: AdminOrderItem): string {
    return ars(item.unitPrice * item.quantity);
  }

  protected goBack(): void {
    this.router.navigate(['/admin/orders']);
  }
}
