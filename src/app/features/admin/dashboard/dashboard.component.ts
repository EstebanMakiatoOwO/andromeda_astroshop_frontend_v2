import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CurrencyArsPipe } from '../../../shared/pipes/currency-ars.pipe';
import { DashboardService } from '../../../core/services/dashboard.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { AdminOrder, LowStockProduct, SalesPeriod, SalesPoint, TopCategory } from '../../../core/models/dashboard.model';
import { statusLabel, badgeClass } from '../orders/orders.helpers';
import { DashboardKpisComponent, KpiCard } from './components/dashboard-kpis.component';
import { DashboardChartComponent, ChartPoint } from './components/dashboard-chart.component';
import { DashboardTopCategoriesComponent, TopCategoryRow } from './components/dashboard-top-categories.component';
import { DashboardRecentOrdersComponent, RecentOrderRow } from './components/dashboard-recent-orders.component';
import { DashboardLowStockComponent, LowStockRow } from './components/dashboard-low-stock.component';

const CHART_W   = 600;
const CHART_PAD = 3;

function buildSparkline(values: number[]): string {
  if (values.length <= 1) return '0,15 200,15';
  const min   = Math.min(...values);
  const max   = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = ((i / (values.length - 1)) * 200).toFixed(1);
      const y = (25 - ((v - min) / range) * 20).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
}

function buildSalesLinePoints(points: SalesPoint[]): string {
  if (points.length <= 1) return `${CHART_PAD},70 ${CHART_W - CHART_PAD},70`;
  const amounts = points.map(p => p.amount);
  const min     = Math.min(...amounts);
  const max     = Math.max(...amounts);
  const range   = max - min || 1;
  return points
    .map((p, i) => {
      const x = (CHART_PAD + (i / (points.length - 1)) * (CHART_W - 2 * CHART_PAD)).toFixed(1);
      const y = (140 - ((p.amount - min) / range) * 120).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
}

function buildSalesAreaPath(linePoints: string): string {
  if (!linePoints) return '';
  const parts  = linePoints.split(' ');
  const firstX = parts[0].split(',')[0];
  const lastX  = parts[parts.length - 1].split(',')[0];
  return `M${firstX},160 L${parts.join(' L')} L${lastX},160 Z`;
}

function buildChartPoints(points: SalesPoint[]): ChartPoint[] {
  if (points.length === 0) return [];
  if (points.length <= 1) return [{
    x: CHART_W / 2, y: 70, date: points[0].date, amount: pipe.transform(points[0].amount),
  }];
  const amounts = points.map(p => p.amount);
  const min     = Math.min(...amounts);
  const max     = Math.max(...amounts);
  const range   = max - min || 1;
  return points.map((p, i) => ({
    x:      CHART_PAD + (i / (points.length - 1)) * (CHART_W - 2 * CHART_PAD),
    y:      140 - ((p.amount - min) / range) * 120,
    date:   p.date,
    amount: pipe.transform(p.amount),
  }));
}

const pipe = new CurrencyArsPipe();

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DashboardKpisComponent,
    DashboardChartComponent,
    DashboardTopCategoriesComponent,
    DashboardRecentOrdersComponent,
    DashboardLowStockComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly svc = inject(DashboardService);
  private readonly bc  = inject(BreadcrumbService);

  protected readonly isLoading      = signal(true);
  protected readonly hasError       = signal(false);
  protected readonly period         = signal<SalesPeriod>('1h');
  protected readonly periods: SalesPeriod[] = ['1h', '1d', '7d', '30d', '90d'];
  protected readonly dashDatePreset = signal('all');
  protected readonly dashDateFrom   = signal<string | undefined>(undefined);
  protected readonly dashDateTo     = signal<string | undefined>(undefined);
  protected readonly salesLinePoints = signal('');
  protected readonly salesAreaPath   = signal('');
  protected readonly salesDates      = signal({ start: '', end: '' });
  protected readonly chartPoints     = signal<ChartPoint[]>([]);

  protected kpis:          KpiCard[]        = [];
  protected topCategories: TopCategoryRow[] = [];
  protected recentOrders:  RecentOrderRow[] = [];
  protected lowStock:      LowStockRow[]    = [];
  protected lowStockCount = 0;

  ngOnInit(): void {
    this.bc.set([{ label: 'Dashboard' }]);
    this.loadAll();
  }

  protected onDatePresetChange(preset: string): void {
    this.dashDatePreset.set(preset);

    const now         = new Date();
    const pad         = (n: number) => String(n).padStart(2, '0');
    const toLocalDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const toLocalEnd  = (d: Date) => `${toLocalDate(d)}T23:59:59`;

    if (preset === 'today') {
      this.dashDateFrom.set(toLocalDate(now));
      this.dashDateTo.set(toLocalEnd(now));
    } else if (preset === '7d') {
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      this.dashDateFrom.set(toLocalDate(from));
      this.dashDateTo.set(toLocalEnd(now));
    } else if (preset === '30d') {
      const from = new Date(now);
      from.setDate(now.getDate() - 29);
      this.dashDateFrom.set(toLocalDate(from));
      this.dashDateTo.set(toLocalEnd(now));
    } else {
      this.dashDateFrom.set(undefined);
      this.dashDateTo.set(undefined);
    }

    this.loadRecentOrders();
  }

  protected onPeriodChange(p: SalesPeriod): void {
    this.period.set(p);
    this.svc.getSales(p).subscribe({ next: pts => this.updateChart(pts) });
  }

  private loadRecentOrders(): void {
    this.svc.getRecentOrders(this.dashDateFrom(), this.dashDateTo()).subscribe({
      next: orders => { this.recentOrders = this.mapOrders(orders); },
    });
  }

  private loadAll(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      stats:      this.svc.getStats()            .pipe(catchError(() => of({ totalSales: 0, totalOrders: 0, avgTicket: 0, conversionRate: 0 }))),
      sales:      this.svc.getSales(this.period()).pipe(catchError(() => of([]))),
      categories: this.svc.getTopCategories()    .pipe(catchError(() => of([]))),
      orders:     this.svc.getRecentOrders()     .pipe(catchError(() => of([]))),
      stock:      this.svc.getLowStock()         .pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ stats, sales, categories, orders, stock }) => {
        const salesValues = sales.map((p: SalesPoint) => p.amount);

        this.kpis = [
          { label: 'Ventas hoy',      value: pipe.transform(stats.totalSales ?? 0),                               sparkPoints: buildSparkline(salesValues.slice(-12)) },
          { label: 'Órdenes hoy',     value: String(stats.totalOrders ?? 0),                                      sparkPoints: buildSparkline(salesValues.slice(-12).map((v: number, i: number) => v / (i + 1))) },
          { label: 'Ticket promedio', value: pipe.transform(stats.avgTicket ?? 0),                                sparkPoints: buildSparkline([...salesValues.slice(-12)].reverse()) },
          { label: 'Conversión',      value: `${(stats.conversionRate ?? 0).toFixed(1)}%`,                        sparkPoints: buildSparkline(salesValues.slice(-12).map((v: number) => v * 0.03)) },
        ];

        this.updateChart(sales);

        this.topCategories = categories.map((c: TopCategory) => ({
          name: c.name, percent: c.percent, amount: pipe.transform(c.amount),
        }));

        this.recentOrders  = this.mapOrders(orders);
        this.lowStockCount = stock.length;
        this.lowStock      = stock.map((p: LowStockProduct) => ({
          name: p.name, sku: p.sku, units: p.stock, initial: p.name.charAt(0).toUpperCase(),
        }));

        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private mapOrders(orders: AdminOrder[]): RecentOrderRow[] {
    return orders.map(o => ({
      number: `#A-${o.id}`,
      client: o.guestName ?? o.guestEmail ?? `Usuario #${o.userId}`,
      total:  pipe.transform(o.total),
      status: statusLabel(o.status),
      badge:  badgeClass(o.status),
      hasMP:  !!o.mpPreferenceId,
    }));
  }

  private updateChart(points: SalesPoint[]): void {
    const line = buildSalesLinePoints(points);
    this.salesLinePoints.set(line);
    this.salesAreaPath.set(buildSalesAreaPath(line));
    this.chartPoints.set(buildChartPoints(points));
    if (points.length) {
      this.salesDates.set({ start: points[0].date, end: points[points.length - 1].date });
    }
  }
}
