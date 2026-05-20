import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand } from '../models/brand.model';

interface ApiResponse<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class BrandsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1/brands`;

  getBrands(): Observable<Brand[]> {
    return this.http.get<ApiResponse<Brand[]>>(this.base).pipe(map(r => r.data));
  }
}
