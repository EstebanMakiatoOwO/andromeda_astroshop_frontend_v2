import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicProduct } from '../models/public-product.model';
import { CatalogFilters, CatalogPage, CatalogFacets } from '../models/catalog.model';

export interface LoyaltyCalculateResponse {
  productId: number;
  qty: number;
  points: number;
}

interface ApiResponse<T> { data: T; }

// camelCaseInterceptor converts all snake_case keys to camelCase before reaching here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRelated(rp: any) {
  return {
    id:       rp.id,
    name:     rp.name,
    slug:     rp.slug ?? null,
    price:    rp.price ?? 0,
    priceMxn: rp.priceMxn ?? rp.price ?? 0,
    priceUsd: rp.priceUsd ?? rp.price ?? 0,
    image:    rp.image ?? null,
  };
}

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
    priceMxn:            r.priceMxn ?? r.price ?? 0,
    priceUsd:            r.priceUsd ?? r.price ?? 0,
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
    rating:          r.rating ?? null,
    reviewCount:     r.reviewCount ?? 0,
    specifications:  (r.specifications ?? []).map((s: any) => ({ key: s.key, value: s.value })),
    tags:            r.tags ?? [],
    createdAt:       r.createdAt,
    updatedAt:       r.updatedAt,
    relatedProducts: (r.relatedProducts ?? []).map(mapRelated),
    youMayLike:      (r.youMayLike ?? []).map(mapRelated),
    loyaltyPoints:   r.loyaltyPoints ?? 0,
    isNew:           r.isNew ?? false,
    isOnSale:        r.isOnSale ?? false,
    isLowStock:      r.isLowStock ?? false,
    isInStock:       r.isInStock ?? true,
    salePrice:       r.salePrice ?? null,
    salePriceMxn:    r.salePriceMxn ?? null,
    salePriceUsd:    r.salePriceUsd ?? null,
    minSaleQty:      r.minSaleQty ?? 1,
    maxSaleQty:      r.maxSaleQty ?? null,
    qtyIncrements:   r.qtyIncrements ?? 1,
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

  getPopular(size = 12): Observable<PublicProduct[]> {
    const params = new HttpParams().set('size', size);
    return this.http.get<ApiResponse<any[]>>(`${this.base}/popular`, { params })
      .pipe(map(r => r.data.map(mapProduct)));
  }

  getNew(size = 12): Observable<PublicProduct[]> {
    const params = new HttpParams().set('size', size);
    return this.http.get<ApiResponse<any[]>>(`${this.base}/new`, { params })
      .pipe(map(r => r.data.map(mapProduct)));
  }

  getProduct(id: number): Observable<PublicProduct> {
    return this.http.get<ApiResponse<any>>(`${this.base}/${id}`).pipe(map(r => mapProduct(r.data)));
  }

  search(name: string): Observable<PublicProduct[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<ApiResponse<any[]>>(`${this.base}/search`, { params })
      .pipe(map(r => r.data.map(mapProduct)));
  }

  getByCategory(categoryId: number, size = 12): Observable<PublicProduct[]> {
    const params = new HttpParams()
      .set('categoryIds', categoryId)
      .set('pageSize',    size)
      .set('page',        1)
      .set('sortBy',      'relevance');
    return this.http.get<any[]>(`${this.base}/catalog`, { params }).pipe(
      map(r => (r[0] as any[]).map(mapProduct))
    );
  }

  catalog(filters: CatalogFilters, pageSize = 16): Observable<CatalogPage> {
    let params = new HttpParams()
      .set('page',     filters.page)
      .set('pageSize', pageSize)
      .set('sortBy',   filters.sortBy);

    if (filters.q)                params = params.set('q',           filters.q);
    if (filters.categoryIds.length) params = params.set('categoryIds', filters.categoryIds.join(','));
    if (filters.brandIds.length)  params = params.set('brandIds',    filters.brandIds.join(','));
    if (filters.inStock)          params = params.set('inStock',     'true');
    if (filters.onOrder)          params = params.set('onOrder',     'true');
    if (filters.minPrice != null) params = params.set('minPrice',    filters.minPrice);
    if (filters.maxPrice != null) params = params.set('maxPrice',    filters.maxPrice);

    // El back devuelve [products[], total, page, pageSize, totalPages, facets]
    return this.http.get<any[]>(`${this.base}/catalog`, { params }).pipe(
      map(r => ({
        products:   (r[0] as any[]).map(mapProduct),
        total:      r[1] as number,
        page:       r[2] as number,
        pageSize:   r[3] as number,
        totalPages: r[4] as number,
        facets:     r[5] as CatalogFacets,
      }))
    );
  }

  getPopularSearches(size = 8): Observable<string[]> {
    const params = new HttpParams().set('size', size);
    return this.http.get<string[]>(`${this.base}/popular-searches`, { params });
  }

  calculateLoyaltyPoints(productId: number, qty: number): Observable<LoyaltyCalculateResponse> {
    return this.http.post<LoyaltyCalculateResponse>(
      `${environment.apiBase}/api/v1/loyalty/calculate`,
      { productId, qty }
    );
  }
}
