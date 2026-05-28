import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiReview, SubmitReviewBody } from '../models/review.model';

interface ApiResponse<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/api/v1`;

  getReviews(productId: number): Observable<ApiReview[]> {
    return this.http
      .get<ApiResponse<ApiReview[]>>(`${this.base}/products/${productId}/reviews`)
      .pipe(map(r => r.data));
  }

  submitReview(productId: number, body: SubmitReviewBody): Observable<boolean> {
    return this.http.post<boolean>(`${this.base}/products/${productId}/reviews`, body);
  }

  toggleHelpful(reviewId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.base}/reviews/${reviewId}/helpful`, {});
  }

  editReview(reviewId: number, body: SubmitReviewBody): Observable<unknown> {
    return this.http.put(`${this.base}/reviews/${reviewId}`, body);
  }

  replyToReview(reviewId: number, reply: string): Observable<unknown> {
    return this.http.post(`${this.base}/admin/reviews/${reviewId}/reply`, { reply });
  }
}
