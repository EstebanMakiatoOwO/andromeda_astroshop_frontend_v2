import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ShippingRate {
  carrierCode:  string;
  methodCode:   string;
  carrierTitle: string;
  methodTitle:  string;
  price:        number;
}

@Injectable({ providedIn: 'root' })
export class ShippingService {
  private readonly http = inject(HttpClient);

  estimate(postcode: string, productId: number, qty = 1): Observable<ShippingRate[]> {
    return this.http.post<ShippingRate[]>(
      `${environment.apiBase}/api/v1/shipping/estimate`,
      { postcode, productId, qty },
    );
  }
}
