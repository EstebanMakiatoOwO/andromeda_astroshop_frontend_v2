import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminProduct, PagedProducts, ProductCategory, ProductStatus } from '../models/product.model';

interface ApiResponse<T> { data: T; }

export interface ProductRequest {
  sku: string;
  barcode: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  stock: number;
  stockAlertThreshold: number;
  costPrice: number;
  price: number;
  isActive: boolean;
  isCatalog: boolean;
  status: ProductStatus;
  categoryIds: number[];
  brandId: number | null;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1/admin/products`;

  getProducts(params: {
    page: number;
    size: number;
    q?: string;
    status?: string;
    availability?: string;
    stock?: string;
  }): Observable<PagedProducts> {
    let p = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);
    if (params.q)            p = p.set('q',            params.q);
    if (params.status)       p = p.set('status',       params.status);
    if (params.availability) p = p.set('availability', params.availability);
    if (params.stock)        p = p.set('stock',        params.stock);
    return this.http.get<ApiResponse<PagedProducts>>(this.base, { params: p }).pipe(map(r => r.data));
  }

  getProduct(id: number): Observable<AdminProduct> {
    return this.http.get<ApiResponse<AdminProduct>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ApiResponse<ProductCategory[]>>(`${this.base}/categories`).pipe(map(r => r.data));
  }

  createProduct(request: ProductRequest, image?: File): Observable<AdminProduct> {
    const fd = this.buildFormData(request, image);
    return this.http.post<ApiResponse<AdminProduct>>(this.base, fd).pipe(map(r => r.data));
  }

  updateProduct(id: number, request: ProductRequest, image?: File): Observable<AdminProduct> {
    const fd = this.buildFormData(request, image);
    return this.http.put<ApiResponse<AdminProduct>>(`${this.base}/${id}`, fd).pipe(map(r => r.data));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  private buildFormData(request: ProductRequest, image?: File): FormData {
    const fd = new FormData();
    fd.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) fd.append('image', image);
    return fd;
  }
}
