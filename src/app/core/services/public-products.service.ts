import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicProduct } from '../models/public-product.model';

interface ApiResponse<T> { data: T; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(r: any): PublicProduct {
  return {
    id:                  r.id,
    sku:                 r.sku ?? null,
    slug:                r.slug ?? null,
    barcode:             r.barcode ?? null,
    name:                r.name,
    shortDescription:    r.shortDescription ?? '',
    longDescription:     r.longDescription ?? '',
    stock:               r.stock ?? 0,
    stockAlertThreshold: r.stockAlertThreshold ?? null,
    costPrice:           r.costPrice ?? null,
    price:               r.price ?? 0,
    isActive:            r.isActive ?? true,
    isCatalog:           r.isCatalog ?? true,
    images:              r.images ?? [],
    categories:          (r.categories ?? []).map((c: any) => ({
      id:          c.id,
      name:        c.name,
      description: c.description ?? '',
      slug:        c.slug,
      isActive:    c.isActive ?? true,
      sortOrder:   c.sortOrder ?? 0,
      imageUrl:    c.imageUrl ?? '',
      parentId:    c.parentId ?? null,
      createdAt:   c.createdAt,
      updatedAt:   c.updatedAt,
    })),
    brand: r.brand ? {
      id:          r.brand.id,
      name:        r.brand.name,
      description: r.brand.description ?? '',
      logoUrl:     r.brand.logoUrl ?? '',
    } : null,
    rating:         r.rating ?? null,
    reviewCount:    r.reviewCount ?? 0,
    specifications: (r.specifications ?? []).map((s: any) => ({ key: s.key, value: s.value })),
    createdAt:      r.createdAt,
    updatedAt:      r.updatedAt,
  };
}

@Injectable({ providedIn: 'root' })
export class PublicProductsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1/products`;

  getProducts(): Observable<PublicProduct[]> {
    return this.http.get<ApiResponse<any[]>>(this.base).pipe(map(r => r.data.map(mapProduct)));
  }

  getFeatured(size = 8): Observable<PublicProduct[]> {
    return this.getProducts().pipe(map(products => products.slice(0, size)));
  }

  getProduct(id: number): Observable<PublicProduct> {
    return this.http.get<ApiResponse<any>>(`${this.base}/${id}`).pipe(map(r => mapProduct(r.data)));
  }

  search(name: string): Observable<PublicProduct[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<PublicProduct[]>>(`${this.base}/search`, { params })
      .pipe(map(r => r.data));
  }
}
