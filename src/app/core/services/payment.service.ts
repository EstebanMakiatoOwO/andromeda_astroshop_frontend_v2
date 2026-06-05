import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderAddress } from './public-orders.service';
import { OrderSummary } from './public-orders.service';

export interface MpPreference {
  initPoint: string;
  sandboxInitPoint: string;
  preferenceId: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1`;

  createMpPreference(
    cartToken: string | null,
    address: OrderAddress,
    shippingCarrier: string,
    shippingMethod: string,
    shippingPrice: number,
    pointsToRedeem = 0,
  ): Observable<MpPreference> {
    const body: Record<string, unknown> = { address, shippingCarrier, shippingMethod, shippingPrice };
    if (cartToken)        body['cartToken']       = cartToken;
    if (pointsToRedeem > 0) body['pointsToRedeem'] = pointsToRedeem;
    return this.http.post<MpPreference>(`${this.base}/payments/mp/preference`, body);
  }

  getOrderByRef(ref: string): Observable<OrderSummary> {
    return this.http.get<OrderSummary>(`${this.base}/orders/by-ref/${ref}`);
  }

  capturePayment(ref: string, paymentId: string): Observable<OrderSummary> {
    return this.http.post<OrderSummary>(`${this.base}/payments/mp/capture`, { ref, paymentId });
  }
}
