import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiReview } from '../../../core/models/review.model';
import { ReviewsService } from '../../../core/services/reviews.service';
import { PublicAuthService } from '../../../core/services/public-auth.service';
import { ReviewCardComponent } from './review-card.component';

const STAR_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: '5',   label: '5 ★'  },
  { id: '4',   label: '4 ★'  },
  { id: '3',   label: '3 ★'  },
  { id: '2',   label: '2 ★'  },
  { id: '1',   label: '1 ★'  },
];

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [ReviewCardComponent, RouterLink, FormsModule],
  templateUrl: './product-reviews.component.html',
})
export class ProductReviewsComponent implements OnInit {
  productId = input.required<number>();

  private readonly reviewsService = inject(ReviewsService);
  protected readonly auth         = inject(PublicAuthService);

  protected readonly reviews      = signal<ApiReview[]>([]);
  protected readonly isLoading    = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly submitError  = signal<string | null>(null);
  protected readonly submitSuccess = signal(false);

  // Filters
  protected readonly starFilter  = signal('all');
  protected readonly sort        = signal('recent');
  protected readonly starFilters = STAR_FILTERS;
  protected readonly stars       = [1, 2, 3, 4, 5];

  // Form
  protected readonly formTitle   = signal('');
  protected readonly formDetail  = signal('');
  protected readonly formRating  = signal(0);
  protected readonly hoverRating = signal(0);

  // Stats
  protected readonly avgRating = computed(() => {
    const list = this.reviews();
    if (!list.length) return null;
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return (sum / list.length).toFixed(1);
  });

  protected readonly dist = computed(() =>
    [5, 4, 3, 2, 1].map(stars => {
      const count = this.reviews().filter(r => r.rating === stars).length;
      const pct   = this.reviews().length
        ? Math.round((count / this.reviews().length) * 100)
        : 0;
      return { stars, count, pct };
    })
  );

  protected readonly visibleReviews = computed(() => {
    let list = this.reviews();
    if (this.starFilter() !== 'all') {
      list = list.filter(r => r.rating === Number(this.starFilter()));
    }
    switch (this.sort()) {
      case 'high':    return [...list].sort((a, b) => b.rating - a.rating);
      case 'low':     return [...list].sort((a, b) => a.rating - b.rating);
      case 'helpful': return [...list].sort((a, b) => (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0));
      default:        return [...list].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  });

  ngOnInit(): void {
    this.loadReviews();
  }

  private loadReviews(): void {
    this.isLoading.set(true);
    this.reviewsService.getReviews(this.productId()).subscribe({
      next:  r => { this.reviews.set(r); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  protected get formValid(): boolean {
    return !!this.formTitle().trim() && !!this.formDetail().trim() && this.formRating() > 0;
  }

  protected displayRating(): number {
    return this.hoverRating() || this.formRating();
  }

  protected onSubmit(): void {
    if (!this.formValid || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.reviewsService.submitReview(this.productId(), {
      title:  this.formTitle().trim(),
      detail: this.formDetail().trim(),
      rating: this.formRating(),
    }).subscribe({
      next: () => {
        this.submitSuccess.set(true);
        this.formTitle.set(''); this.formDetail.set(''); this.formRating.set(0);
        this.isSubmitting.set(false);
        this.loadReviews();
      },
      error: (err) => {
        const msg: string = err?.error?.message ?? '';
        this.submitError.set(msg || 'No se pudo enviar la reseña. Intenta de nuevo.');
        this.isSubmitting.set(false);
      },
    });
  }
}
