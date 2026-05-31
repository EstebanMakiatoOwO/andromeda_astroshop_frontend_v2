import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderAddress {
  firstname: string;
  lastname: string;
  street: string;
  city: string;
  regionCode: string;
  postcode: string;
  countryId: string;
  telephone: string;
  email?: string;
}

export interface CreateOrderRequest {
  address: OrderAddress;
  shippingCarrier: string;
  shippingMethod: string;
  shippingPrice?: number;
}

export interface OrderSummary {
  orderId: number;
  orderNumber: string;
  total: number;
  totalMxn: number;
  totalUsd: number;
  status: string;
  loyaltyPointsEarned: number;
}

@Injectable({ providedIn: 'root' })
export class PublicOrdersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1/orders`;

  createOrder(req: CreateOrderRequest): Observable<OrderSummary> {
    return this.http.post<OrderSummary>(this.base, req);
  }

  createGuestOrder(cartToken: string, req: CreateOrderRequest): Observable<OrderSummary> {
    return this.http.post<OrderSummary>(
      `${environment.apiBase}/api/v1/guest-orders`,
      { cartToken, ...req }
    );
  }

  getOrder(orderId: number): Observable<OrderSummary> {
    return this.http.get<OrderSummary>(`${this.base}/${orderId}`);
  }
}
