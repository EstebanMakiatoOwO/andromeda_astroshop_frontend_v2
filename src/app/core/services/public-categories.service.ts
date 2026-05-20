import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicCategory } from '../models/public-category.model';

interface ApiResponse<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class PublicCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1/categories`;

  getCategories(): Observable<PublicCategory[]> {
    return this.http.get<ApiResponse<PublicCategory[]>>(this.base).pipe(map(r => r.data));
  }

  getTree(): Observable<PublicCategory[]> {
    return this.getCategories().pipe(map(cats => this.buildTree(cats)));
  }

  private buildTree(flat: PublicCategory[]): PublicCategory[] {
    const map = new Map<number, PublicCategory>();
    const roots: PublicCategory[] = [];

    for (const cat of flat) {
      map.set(cat.id, { ...cat, children: [] });
    }

    for (const cat of map.values()) {
      if (cat.parentId === null) {
        roots.push(cat);
      } else {
        const parent = map.get(cat.parentId);
        if (parent) parent.children.push(cat);
      }
    }

    return roots.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
