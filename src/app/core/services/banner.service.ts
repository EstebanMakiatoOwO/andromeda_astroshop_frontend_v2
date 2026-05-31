import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
  isActive: number;
  createdAt: string;
}

export interface BannerRequest {
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder?: number;
  isActive?: number;
}

@Injectable({ providedIn: 'root' })
export class BannerService {
  private readonly http      = inject(HttpClient);
  private readonly base      = `${environment.apiBase}/api/v1`;
  private readonly adminBase = `${environment.apiBase}/api/v1/admin`;

  getBanners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.base}/banners`);
  }

  createBanner(req: BannerRequest): Observable<Banner> {
    return this.http.post<Banner>(`${this.adminBase}/banners`, req);
  }

  updateBanner(id: number, req: BannerRequest): Observable<Banner> {
    return this.http.put<Banner>(`${this.adminBase}/banners/${id}`, { id, ...req });
  }

  deleteBanner(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.adminBase}/banners/${id}`);
  }
}
