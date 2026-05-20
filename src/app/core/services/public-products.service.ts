import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicProduct } from '../models/public-product.model';

interface ApiResponse<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class PublicProductsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1/products`;

  getProducts(): Observable<PublicProduct[]> {
    return this.http.get<ApiResponse<PublicProduct[]>>(this.base).pipe(map(r => r.data));
  }

  getFeatured(size = 8): Observable<PublicProduct[]> {
    return this.getProducts().pipe(map(products => products.slice(0, size)));
  }

  search(name: string): Observable<PublicProduct[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<PublicProduct[]>>(`${this.base}/search`, { params })
      .pipe(map(r => r.data));
  }
}
