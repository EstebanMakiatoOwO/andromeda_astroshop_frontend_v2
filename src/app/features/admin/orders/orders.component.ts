import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrdersService } from '../../../core/services/orders.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { AdminOrder, OrderCounts } from '../../../core/models/order.model';

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

function fmtDate(iso: string): string {
  const d   = new Date(iso);
  const now = new Date();
  const ms  = now.getTime() - d.getTime();
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  if (ms < 86_400_000)  return `hoy ${time}`;
  if (ms < 172_800_000) return `ayer ${time}`;
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

interface Tab {
  key:      string;
  label:    string;
  status:   string | null;
  countKey: keyof OrderCounts;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './orders.component.html',
})
export class OrdersComponent {
  private readonly svc        = inject(OrdersService);
  private readonly bc         = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly PAGE_SIZE = 20;

  protected readonly tabs: Tab[] = [
    { key: 'all',       label: 'Todas',          status: null,        countKey: 'total'     },
    { key: 'pending',   label: 'Aguard. pago',   status: 'PENDING',   countKey: 'pending'   },
    { key: 'paid',      label: 'Pagadas',         status: 'PAID',      countKey: 'paid'      },
    { key: 'shipped',   label: 'Enviadas',        status: 'SHIPPED',   countKey: 'shipped'   },
    { key: 'cancelled', label: 'Canceladas',      status: 'CANCELLED', countKey: 'cancelled' },
    { key: 'refunded',  label: 'Reembolsadas',    status: 'REFUNDED',  countKey: 'refunded'  },
  ];

  protected readonly activeStatus = signal<string | null>(null);
  protected readonly page         = signal(0);
  protected readonly searchTerm   = signal('');
  protected readonly dateFrom     = signal<string | undefined>(undefined);
  protected readonly dateTo       = signal<string | undefined>(undefined);
  protected readonly datePreset   = signal('all');
  protected readonly orders       = signal<AdminOrder[]>([]);
  protected readonly counts       = signal<OrderCounts | null>(null);
  protected readonly totalPages   = signal(0);
  protected readonly totalElems   = signal(0);
  protected readonly isLoading    = signal(true);

  protected readonly pageNumbers = computed(() => {
    const total   = this.totalPages();
    const current = this.page();
    const pages: number[] = [];
    for (let i = Math.max(0, current - 2); i <= Math.min(total - 1, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  });

  private readonly searchInput$ = new Subject<string>();

  constructor() {
    this.bc.set([{ label: 'Órdenes' }]);

    this.searchInput$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(q => {
      this.searchTerm.set(q);
      this.page.set(0);
    });

    effect(() => {
      const status   = this.activeStatus();
      const p        = this.page();
      const q        = this.searchTerm();
      const dateFrom = this.dateFrom();
      const dateTo   = this.dateTo();
      this.loadOrders(status, p, q, dateFrom, dateTo);
    });

    this.svc.getCounts().subscribe({ next: c => this.counts.set(c) });
  }

  protected onSearch(value: string): void {
    this.searchInput$.next(value);
  }

  protected onDateChange(preset: string): void {
    this.datePreset.set(preset);
    this.page.set(0);
    const today = new Date();
    const iso   = (d: Date) => d.toISOString().slice(0, 10);
    const todayStr = iso(today);
    if (preset === 'today') {
      this.dateFrom.set(todayStr);
      this.dateTo.set(todayStr);
    } else if (preset === '7d') {
      const from = new Date(today); from.setDate(today.getDate() - 6);
      this.dateFrom.set(iso(from));
      this.dateTo.set(todayStr);
    } else if (preset === '30d') {
      const from = new Date(today); from.setDate(today.getDate() - 29);
      this.dateFrom.set(iso(from));
      this.dateTo.set(todayStr);
    } else {
      this.dateFrom.set(undefined);
      this.dateTo.set(undefined);
    }
  }

  protected setTab(status: string | null): void {
    this.activeStatus.set(status);
    this.page.set(0);
  }

  protected setPage(p: number): void {
    this.page.set(p);
  }

  protected tabCount(key: keyof OrderCounts): number {
    return this.counts()?.[key] ?? 0;
  }

  protected statusLabel(s: string): string {
    return STATUS_LABEL[s] ?? s.toLowerCase();
  }

  protected badgeClass(s: string): string {
    const base = 'px-2 py-0.5 rounded-full text-[10px] font-semibold ';
    return base + (STATUS_BADGE[s] ?? 'bg-surface-4 text-ink-2');
  }

  protected ars   = ars;
  protected fmtDate = fmtDate;

  private loadOrders(
    status: string | null, page: number, q: string,
    dateFrom?: string, dateTo?: string,
  ): void {
    this.isLoading.set(true);
    this.svc.getOrders({
      page,
      size:     this.PAGE_SIZE,
      status:   status ?? undefined,
      q:        q || undefined,
      dateFrom,
      dateTo,
    }).subscribe({
      next: result => {
        this.orders.set(result.content);
        this.totalPages.set(result.totalPages);
        this.totalElems.set(result.totalElements);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
