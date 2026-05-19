import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminCategory, CategoryRequest } from '../models/category.model';

interface ApiResponse<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1/admin/categories`;

  getTree(): Observable<AdminCategory[]> {
    return this.http.get<ApiResponse<AdminCategory[]>>(`${this.base}/tree`)
      .pipe(map(r => r.data));
  }

  getCategories(): Observable<AdminCategory[]> {
    return this.http.get<ApiResponse<AdminCategory[]>>(this.base)
      .pipe(map(r => r.data));
  }

  getCategory(id: number): Observable<AdminCategory> {
    return this.http.get<ApiResponse<AdminCategory>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  createCategory(data: CategoryRequest): Observable<AdminCategory> {
    return this.http.post<ApiResponse<AdminCategory>>(this.base, data)
      .pipe(map(r => r.data));
  }

  updateCategory(id: number, data: CategoryRequest): Observable<AdminCategory> {
    return this.http.put<ApiResponse<AdminCategory>>(`${this.base}/${id}`, data)
      .pipe(map(r => r.data));
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
