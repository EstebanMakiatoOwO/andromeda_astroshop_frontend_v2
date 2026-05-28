import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiReview } from '../../../core/models/review.model';
import { ReviewsService } from '../../../core/services/reviews.service';
import { PublicAuthService } from '../../../core/services/public-auth.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './review-card.component.html',
})
export class ReviewCardComponent implements OnInit {
  review = input.required<ApiReview>();

  private readonly reviewsService = inject(ReviewsService);
  protected readonly publicAuth   = inject(PublicAuthService);
  protected readonly adminAuth    = inject(AuthService);

  // Helpful
  protected readonly helpful        = signal(0);
  protected readonly marked         = signal(false);
  protected readonly helpfulLoading = signal(false);

  // Owner reply
  protected readonly showReplyForm = signal(false);
  protected readonly replyText     = signal('');
  protected readonly replyLoading  = signal(false);
  protected readonly replyError    = signal<string | null>(null);
  protected readonly localReply    = signal<string | null>(null);

  // Edit
  protected readonly showEditForm  = signal(false);
  protected readonly editTitle     = signal('');
  protected readonly editDetail    = signal('');
  protected readonly editRating    = signal(0);
  protected readonly hoverRating   = signal(0);
  protected readonly editLoading   = signal(false);
  protected readonly editError     = signal<string | null>(null);

  // Local edited values (optimistic)
  protected readonly localTitle    = signal('');
  protected readonly localDetail   = signal('');
  protected readonly localRating   = signal(0);

  protected readonly stars = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.helpful.set(this.review().helpfulCount ?? 0);
    this.marked.set(this.review().userHasMarked ?? false);
    this.localReply.set(this.review().ownerReply ?? null);
    this.localTitle.set(this.review().title);
    this.localDetail.set(this.review().detail);
    this.localRating.set(this.review().rating);
  }

  protected get isOwner(): boolean {
    const user = this.publicAuth.currentUser();
    return !!user && user.name === this.review().nickname;
  }

  protected initials(): string {
    return this.review().nickname
      .split(' ').filter(Boolean)
      .map(p => p[0].toUpperCase())
      .join('').slice(0, 2);
  }

  protected starsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => (i < rating ? 1 : 0));
  }

  protected displayRating(): number {
    return this.hoverRating() || this.editRating();
  }

  protected formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).format(new Date(dateStr.replace(' ', 'T')));
  }

  protected openEdit(): void {
    this.editTitle.set(this.localTitle());
    this.editDetail.set(this.localDetail());
    this.editRating.set(this.localRating());
    this.editError.set(null);
    this.showEditForm.set(true);
  }

  protected onEdit(): void {
    if (!this.editTitle().trim() || !this.editDetail().trim() || !this.editRating()) return;
    this.editLoading.set(true);
    this.editError.set(null);
    this.reviewsService.editReview(this.review().id, {
      title:  this.editTitle().trim(),
      detail: this.editDetail().trim(),
      rating: this.editRating(),
    }).subscribe({
      next: () => {
        this.localTitle.set(this.editTitle().trim());
        this.localDetail.set(this.editDetail().trim());
        this.localRating.set(this.editRating());
        this.showEditForm.set(false);
        this.editLoading.set(false);
      },
      error: (err) => {
        const msg: string = err?.error?.message ?? '';
        this.editError.set(msg || 'No se pudo guardar la reseña.');
        this.editLoading.set(false);
      },
    });
  }

  protected onHelpful(): void {
    if (!this.publicAuth.isAuthenticated() || this.helpfulLoading()) return;
    this.helpfulLoading.set(true);
    this.reviewsService.toggleHelpful(this.review().id).subscribe({
      next: isMarked => {
        this.marked.set(isMarked);
        this.helpful.update(n => isMarked ? n + 1 : Math.max(0, n - 1));
        this.helpfulLoading.set(false);
      },
      error: () => this.helpfulLoading.set(false),
    });
  }

  protected onReply(): void {
    if (!this.replyText().trim() || this.replyLoading()) return;
    this.replyLoading.set(true);
    this.replyError.set(null);
    this.reviewsService.replyToReview(this.review().id, this.replyText().trim()).subscribe({
      next: () => {
        this.localReply.set(this.replyText().trim());
        this.replyText.set('');
        this.showReplyForm.set(false);
        this.replyLoading.set(false);
      },
      error: () => {
        this.replyError.set('No se pudo enviar la respuesta.');
        this.replyLoading.set(false);
      },
    });
  }
}
