import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { AdminOrder } from '../models/dashboard.model';

export interface SearchUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface SearchProduct {
  id: number;
  name: string;
  sku: string;
  images: string[];
}

export interface SearchResults {
  orders: AdminOrder[];
  users: SearchUser[];
  products: SearchProduct[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1`;

  search(q: string): Observable<SearchResults> {
    const qParams    = new HttpParams().set('q', q);
    const nameParams = new HttpParams().set('name', q);

    return forkJoin({
      orders: this.http
        .get<ApiResponse<AdminOrder[]>>(`${this.base}/orders/search`, { params: qParams })
        .pipe(map(r => r.data), catchError(() => of<AdminOrder[]>([]))),
      users: this.http
        .get<SearchUser[]>(`${this.base}/users/search`, { params: qParams })
        .pipe(catchError(() => of<SearchUser[]>([]))),
      products: this.http
        .get<ApiResponse<SearchProduct[]>>(`${this.base}/products/search`, { params: nameParams })
        .pipe(map(r => r.data), catchError(() => of<SearchProduct[]>([]))),
    });
  }
}
