import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import {
  AdminOrder,
  DashboardStats,
  LowStockProduct,
  Notifications,
  SalesPoint,
  SalesPeriod,
  TopCategory,
} from '../models/dashboard.model';
import { PagedOrders } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1/admin`;

  getStats(): Observable<DashboardStats> {
    return this.http
      .get<ApiResponse<DashboardStats>>(`${this.base}/dashboard/stats`)
      .pipe(map(r => r.data));
  }

  getSales(period: SalesPeriod): Observable<SalesPoint[]> {
    const params = new HttpParams().set('period', period);
    return this.http
      .get<ApiResponse<SalesPoint[]>>(`${this.base}/dashboard/sales`, { params })
      .pipe(map(r => r.data));
  }

  getTopCategories(): Observable<TopCategory[]> {
    return this.http
      .get<ApiResponse<TopCategory[]>>(`${this.base}/dashboard/top-categories`)
      .pipe(map(r => r.data));
  }

  getRecentOrders(dateFrom?: string, dateTo?: string): Observable<AdminOrder[]> {
    let params = new HttpParams().set('size', '5');
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo)   params = params.set('dateTo',   dateTo);
    return this.http
      .get<ApiResponse<PagedOrders>>(`${this.base}/orders`, { params })
      .pipe(map(r => r.data.content as unknown as AdminOrder[]));
  }

  getLowStock(): Observable<LowStockProduct[]> {
    return this.http
      .get<ApiResponse<LowStockProduct[]>>(`${this.base}/products/low-stock`)
      .pipe(map(r => r.data));
  }

  getNotifications(): Observable<Notifications> {
    return this.http
      .get<ApiResponse<Notifications>>(`${this.base}/notifications`)
      .pipe(map(r => r.data));
  }

  markNotificationsSeen(): Observable<void> {
    return this.http.patch<void>(`${this.base}/notifications/seen`, {});
  }

  markOneNotificationSeen(reviewId: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/notifications/${reviewId}/seen`, {});
  }

  getPendingOrdersCount(): Observable<number> {
    return this.http
      .get<ApiResponse<AdminOrder[]>>(`${environment.apiBase}/api/v1/orders/status/PAID`)
      .pipe(map(r => r.data.length));
  }
}
