import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrdersService } from '../../../core/services/orders.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { AdminOrder, OrderCounts } from '../../../core/models/order.model';
import { OrdersTabsComponent, Tab } from './components/orders-tabs.component';
import { OrdersFiltersComponent } from './components/orders-filters.component';
import { OrdersTableComponent } from './components/orders-table.component';
import { OrdersPaginationComponent } from './components/orders-pagination.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [OrdersTabsComponent, OrdersFiltersComponent, OrdersTableComponent, OrdersPaginationComponent],
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

  protected onDatePresetChange(preset: string): void {
    this.datePreset.set(preset);
    this.page.set(0);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toLocalDate = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const toLocalEnd = (d: Date) =>
      `${toLocalDate(d)}T23:59:59`;

    if (preset === 'today') {
      this.dateFrom.set(toLocalDate(now));
      this.dateTo.set(toLocalEnd(now));
    } else if (preset === '7d') {
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      this.dateFrom.set(toLocalDate(from));
      this.dateTo.set(toLocalEnd(now));
    } else if (preset === '30d') {
      const from = new Date(now);
      from.setDate(now.getDate() - 29);
      this.dateFrom.set(toLocalDate(from));
      this.dateTo.set(toLocalEnd(now));
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
