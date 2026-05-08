import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminOrder, AdminOrderDetail, OrderCounts, OrderStatus, PagedOrders,
} from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1/admin/orders`;

  getOrders(params: { page: number; size: number; status?: string; q?: string }): Observable<PagedOrders> {
    let p = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);
    if (params.status) p = p.set('status', params.status);
    if (params.q)      p = p.set('q', params.q);
    return this.http.get<PagedOrders>(this.base, { params: p });
  }

  getCounts(): Observable<OrderCounts> {
    return this.http.get<OrderCounts>(`${this.base}/counts`);
  }

  getOrder(id: number): Observable<AdminOrderDetail> {
    return this.http.get<AdminOrderDetail>(`${this.base}/${id}`);
  }

  updateStatus(id: number, status: OrderStatus): Observable<AdminOrder> {
    return this.http.patch<AdminOrder>(`${this.base}/${id}/status`, { status });
  }

  updateNotes(id: number, notes: string): Observable<AdminOrder> {
    return this.http.patch<AdminOrder>(`${this.base}/${id}/notes`, { notes });
  }
}
