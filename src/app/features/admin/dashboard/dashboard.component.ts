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
  kind: 'warn' | 'ok' | 'err';
  hasMP: boolean;
}

interface LowStockRow {
  name: string;
  sku: string;
  units: number;
  initial: string;
}

function buildSparkline(values: number[]): string {
  if (values.length < 2) return '';
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

function buildSalesLinePoints(points: SalesPoint[]): string {
  if (points.length < 2) return '';
  const amounts = points.map(p => p.amount);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const range = max - min || 1;
  return points
    .map((p, i) => {
      const x = ((i / (points.length - 1)) * 600).toFixed(1);
      const y = (140 - ((p.amount - min) / range) * 120).toFixed(1);
      return `${x},${y}`;
    })
    .join(' ');
}

function buildSalesAreaPath(linePoints: string): string {
  if (!linePoints) return '';
  const parts = linePoints.split(' ');
  return `M0,160 L${parts.join(' L')} L600,160 Z`;
}

function orderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:   'pendiente',
    PREPARING: 'preparando',
    SHIPPED:   'enviado',
    DELIVERED: 'entregado',
    CANCELLED: 'cancelado',
  };
  return map[status] ?? status.toLowerCase();
}

function orderKind(status: string): 'warn' | 'ok' | 'err' {
  if (status === 'CANCELLED') return 'err';
  if (status === 'DELIVERED' || status === 'SHIPPED') return 'ok';
  return 'warn';
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
  protected readonly period    = signal<SalesPeriod>('1d');
  protected readonly periods: SalesPeriod[] = ['1d', '7d', '30d', '90d'];

  protected kpis:          KpiCard[]        = [];
  protected topCategories: TopCategoryRow[] = [];
  protected recentOrders:  RecentOrderRow[] = [];
  protected lowStock:      LowStockRow[]    = [];
  protected salesLinePoints = '';
  protected salesAreaPath   = '';
  protected salesDates      = { start: '', end: '' };
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
          status: orderStatusLabel(o.status),
          kind:   orderKind(o.status),
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
    this.salesLinePoints = buildSalesLinePoints(points);
    this.salesAreaPath   = buildSalesAreaPath(this.salesLinePoints);
    if (points.length) {
      this.salesDates = { start: points[0].date, end: points[points.length - 1].date };
    }
  }

  protected trackKpi(_i: number, k: KpiCard): string          { return k.label;   }
  protected trackCat(_i: number, c: TopCategoryRow): string   { return c.name;    }
  protected trackOrder(_i: number, o: RecentOrderRow): string { return o.number;  }
  protected trackStock(_i: number, p: LowStockRow): string    { return p.name;    }
}
