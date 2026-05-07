import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CurrencyArsPipe } from '../../../shared/pipes/currency-ars.pipe';
import { DashboardService } from '../../../core/services/dashboard.service';
import { AdminOrder, LowStockProduct, SalesPeriod, SalesPoint, TopCategory } from '../../../core/models/dashboard.model';

interface KpiCard {
  label: string;
  value: string;
  sparkPoints: string;
}

interface TopCategoryRow {
  name: string;
  percent: number;
  amount: string;
}

interface RecentOrderRow {
  number: string;
  client: string;
  total: string;
  status: string;
  badgeClass: string;
  hasMP: boolean;
}

interface LowStockRow {
  name: string;
  sku: string;
  units: number;
  initial: string;
}

function buildSparkline(values: number[]): string {
  if (values.length === 0) return '';
  if (values.length === 1) return `0,15 200,15`;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = ((i / (values.length - 1)) * 200).toFixed(1);
      const y = (25 - ((v - min) / range) * 20).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
}

const CHART_W = 600;
const CHART_PAD = 3;

function buildSalesLinePoints(points: SalesPoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `${CHART_PAD},70 ${CHART_W - CHART_PAD},70`;
  const amounts = points.map(p => p.amount);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const range = max - min || 1;
  return points
    .map((p, i) => {
      const x = (CHART_PAD + (i / (points.length - 1)) * (CHART_W - 2 * CHART_PAD)).toFixed(1);
      const y = (140 - ((p.amount - min) / range) * 120).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
}

interface ChartPoint {
  x: number;
  y: number;
  date: string;
  amount: string;
}

interface TipPos {
  cx: number;
  cy: number;
  point: ChartPoint;
}

function buildChartPoints(points: SalesPoint[]): ChartPoint[] {
  if (points.length === 0) return [];
  if (points.length === 1) return [{
    x: CHART_W / 2, y: 70, date: points[0].date, amount: pipe.transform(points[0].amount),
  }];
  const amounts = points.map(p => p.amount);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const range = max - min || 1;
  return points.map((p, i) => ({
    x: CHART_PAD + (i / (points.length - 1)) * (CHART_W - 2 * CHART_PAD),
    y: 140 - ((p.amount - min) / range) * 120,
    date:   p.date,
    amount: pipe.transform(p.amount),
  }));
}

function buildSalesAreaPath(linePoints: string): string {
  if (!linePoints) return '';
  const parts = linePoints.split(' ');
  const firstX = parts[0].split(',')[0];
  const lastX  = parts[parts.length - 1].split(',')[0];
  return `M${firstX},160 L${parts.join(' L')} L${lastX},160 Z`;
}

function orderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:   'pendiente',
    PAID:      'pagado',
    PREPARING: 'preparando',
    SHIPPED:   'enviado',
    DELIVERED: 'entregado',
    CANCELLED: 'cancelado',
  };
  return map[status] ?? status.toLowerCase();
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:   'bg-warn-soft text-warn',
  PAID:      'bg-success-soft text-success',
  PREPARING: 'bg-accent-soft text-accent',
  SHIPPED:   'bg-line text-ink-1',
  DELIVERED: 'bg-success-soft text-success',
  CANCELLED: 'bg-error-soft text-error',
};

function orderBadgeClass(status: string): string {
  return STATUS_BADGE[status] ?? 'bg-surface-4 text-ink-2';
}

const pipe = new CurrencyArsPipe();

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly svc = inject(DashboardService);

  protected readonly isLoading = signal(true);
  protected readonly hasError  = signal(false);
  protected readonly period    = signal<SalesPeriod>('1h');
  protected readonly periods: SalesPeriod[] = [ '1h', '1d', '7d', '30d', '90d'];

  protected kpis:          KpiCard[]        = [];
  protected topCategories: TopCategoryRow[] = [];
  protected recentOrders:  RecentOrderRow[] = [];
  protected lowStock:      LowStockRow[]    = [];
  protected readonly salesLinePoints = signal('');
  protected readonly salesAreaPath   = signal('');
  protected readonly salesDates      = signal({ start: '', end: '' });
  protected readonly chartPoints     = signal<ChartPoint[]>([]);
  protected readonly hoveredPoint    = signal<ChartPoint | null>(null);
  protected readonly tipPos          = signal<TipPos | null>(null);
  protected lowStockCount   = 0;

  ngOnInit(): void {
    this.loadAll();
  }

  protected changePeriod(p: SalesPeriod): void {
    if (this.period() === p) return;
    this.period.set(p);
    this.svc.getSales(p).subscribe({
      next: pts => this.updateChart(pts),
    });
  }

  private loadAll(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      stats:      this.svc.getStats(),
      sales:      this.svc.getSales(this.period()),
      categories: this.svc.getTopCategories(),
      orders:     this.svc.getRecentOrders(),
      stock:      this.svc.getLowStock(),
    }).subscribe({
      next: ({ stats, sales, categories, orders, stock }) => {
        const salesValues = sales.map(p => p.amount);

        this.kpis = [
          {
            label: 'Ventas hoy',
            value: pipe.transform(stats.totalSales ?? 0),
            sparkPoints: buildSparkline(salesValues.slice(-12)),
          },
          {
            label: 'Órdenes hoy',
            value: String(stats.totalOrders ?? 0),
            sparkPoints: buildSparkline(salesValues.slice(-12).map((v, i) => v / (i + 1))),
          },
          {
            label: 'Ticket promedio',
            value: pipe.transform(stats.avgTicket ?? 0),
            sparkPoints: buildSparkline(salesValues.slice(-12).reverse()),
          },
          {
            label: 'Conversión',
            value: `${(stats.conversionRate ?? 0).toFixed(1)}%`,
            sparkPoints: buildSparkline(salesValues.slice(-12).map(v => v * 0.03)),
          },
        ];

        this.updateChart(sales);

        this.topCategories = categories.map((c: TopCategory) => ({
          name:    c.name,
          percent: c.percent,
          amount:  pipe.transform(c.amount),
        }));

        this.recentOrders = orders.map((o: AdminOrder) => ({
          number: `#A-${o.id}`,
          client: o.guestName ?? o.guestEmail ?? `Usuario #${o.userId}`,
          total:  pipe.transform(o.total),
          status:     orderStatusLabel(o.status),
          badgeClass: orderBadgeClass(o.status),
          hasMP:  !!o.mpPreferenceId,
        }));

        this.lowStockCount = stock.length;
        this.lowStock = stock.map((p: LowStockProduct) => ({
          name:    p.name,
          sku:     p.sku,
          units:   p.stock,
          initial: p.name.charAt(0).toUpperCase(),
        }));

        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private updateChart(points: SalesPoint[]): void {
    const line = buildSalesLinePoints(points);
    this.salesLinePoints.set(line);
    this.salesAreaPath.set(buildSalesAreaPath(line));
    this.chartPoints.set(buildChartPoints(points));
    this.hoveredPoint.set(null);
    if (points.length) {
      this.salesDates.set({ start: points[0].date, end: points[points.length - 1].date });
    }
  }

  protected onPointEnter(e: MouseEvent, pt: ChartPoint): void {
    this.hoveredPoint.set(pt);
    this.tipPos.set({ cx: e.clientX, cy: e.clientY, point: pt });
  }

  protected onPointLeave(): void {
    this.hoveredPoint.set(null);
    this.tipPos.set(null);
  }

  protected trackKpi(_i: number, k: KpiCard): string          { return k.label;   }
  protected trackCat(_i: number, c: TopCategoryRow): string   { return c.name;    }
  protected trackOrder(_i: number, o: RecentOrderRow): string { return o.number;  }
  protected trackStock(_i: number, p: LowStockRow): string    { return p.name;    }
}
