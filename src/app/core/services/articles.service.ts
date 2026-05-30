import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Article } from '../models/article.model';

interface ApiResponse<T> { data: T; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapArticle(a: any): Article {
  return {
    id:          a.id,
    slug:        a.slug,
    title:       a.title,
    excerpt:     a.excerpt ?? '',
    content:     a.content ?? '',
    coverImage:  a.coverImage ?? null,
    publishedAt: a.publishedAt ?? '',
  };
}

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1/articles`;

  getArticles(): Observable<Article[]> {
    return this.http.get<ApiResponse<any[]>>(this.base)
      .pipe(map(r => r.data.map(mapArticle)));
  }

  getArticle(slug: string): Observable<Article> {
    return this.http.get<any>(`${this.base}/${slug}`)
      .pipe(map(a => mapArticle(a)));
  }
}
