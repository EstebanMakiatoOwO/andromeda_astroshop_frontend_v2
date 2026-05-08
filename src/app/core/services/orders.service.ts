import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminOrder, AdminOrderDetail, OrderCounts, OrderStatus, PagedOrders,
} from '../models/order.model';

interface ApiResponse<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1/admin/orders`;

  getOrders(params: {
    page: number; size: number;
    status?: string; q?: string;
    dateFrom?: string; dateTo?: string;
  }): Observable<PagedOrders> {
    let p = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);
    if (params.status)   p = p.set('status',   params.status);
    if (params.q)        p = p.set('q',         params.q);
    if (params.dateFrom) p = p.set('dateFrom',  params.dateFrom);
    if (params.dateTo)   p = p.set('dateTo',    params.dateTo);
    return this.http.get<ApiResponse<PagedOrders>>(this.base, { params: p }).pipe(map(r => r.data));
  }

  getCounts(): Observable<OrderCounts> {
    return this.http.get<ApiResponse<OrderCounts>>(`${this.base}/counts`).pipe(map(r => r.data));
  }

  getOrder(id: number): Observable<AdminOrderDetail> {
    return this.http.get<ApiResponse<AdminOrderDetail>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  updateStatus(id: number, status: OrderStatus): Observable<AdminOrder> {
    return this.http.patch<ApiResponse<AdminOrder>>(`${this.base}/${id}/status`, { status }).pipe(map(r => r.data));
  }

  updateNotes(id: number, notes: string): Observable<AdminOrder> {
    return this.http.patch<ApiResponse<AdminOrder>>(`${this.base}/${id}/notes`, { notes }).pipe(map(r => r.data));
  }
}
