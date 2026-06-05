import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { LoyaltyAccount } from '../models/loyalty.model';
import { ApiResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiBase;

export interface RedeemPreview {
  pointsToRedeem: number;
  discountMxn:    number;
  finalTotalMxn:  number;
  maxRedeemable:  number;
}

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly http = inject(HttpClient);

  getMyAccount(): Observable<LoyaltyAccount> {
    return this.http
      .get<ApiResponse<LoyaltyAccount>>(`${API_BASE}/api/v1/loyalty/my`)
      .pipe(map(r => r.data));
  }

  redeemPreview(pointsToRedeem: number, subtotalMxn: number): Observable<RedeemPreview> {
    return this.http.post<RedeemPreview>(
      `${API_BASE}/api/v1/loyalty/redeem-preview`,
      { pointsToRedeem, subtotalMxn },
    );
  }
}
