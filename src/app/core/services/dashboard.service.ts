import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import {
  AdminOrder,
  DashboardStats,
  LowStockProduct,
  SalesPoint,
  SalesPeriod,
  TopCategory,
} from '../models/dashboard.model';

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

  getRecentOrders(): Observable<AdminOrder[]> {
    const params = new HttpParams().set('size', '5');
    return this.http
      .get<ApiResponse<AdminOrder[]>>(`${this.base}/orders`, { params })
      .pipe(map(r => r.data));
  }

  getLowStock(): Observable<LowStockProduct[]> {
    return this.http
      .get<ApiResponse<LowStockProduct[]>>(`${this.base}/products/low-stock`)
      .pipe(map(r => r.data));
  }
}
