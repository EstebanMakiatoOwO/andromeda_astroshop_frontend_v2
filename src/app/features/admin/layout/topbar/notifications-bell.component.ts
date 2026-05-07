import {
  ApplicationRef,
  Component,
  EmbeddedViewRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  signal,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { NotificationReview } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  templateUrl: './notifications-bell.component.html',
})
export class NotificationsBellComponent implements OnChanges, OnDestroy {
  private readonly appRef = inject(ApplicationRef);
  private readonly doc    = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly svc    = inject(DashboardService);

  @Input() count   = 0;
  @Input() reviews: NotificationReview[] = [];
  @Output() seen   = new EventEmitter<void>();

  @ViewChild('bellBtn')  private bellBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('panelTpl') private panelTpl!: TemplateRef<unknown>;

  protected readonly localCount   = signal(0);
  protected readonly localReviews = signal<NotificationReview[]>([]);
  protected readonly dropdownTop  = signal('0px');
  protected readonly dropdownLeft = signal('0px');

  private portalView: EmbeddedViewRef<unknown> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['count'])   this.localCount.set(this.count);
    if (changes['reviews']) this.localReviews.set(this.reviews);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.portalView) return;
    const target = event.target as Node;
    if (this.bellBtn?.nativeElement.contains(target)) return;
    const isInsidePortal = this.portalView.rootNodes.some(
      n => (n as HTMLElement).contains?.(target),
    );
    if (!isInsidePortal) this.destroyPortal();
  }

  protected toggle(): void {
    if (this.portalView) { this.destroyPortal(); return; }
    const rect = this.bellBtn.nativeElement.getBoundingClientRect();
    this.dropdownTop.set(`${rect.bottom + 6}px`);
    this.dropdownLeft.set(`${rect.right - 288}px`);
    this.openPortal();
  }

  protected dismissOne(review: NotificationReview): void {
    this.svc.markOneNotificationSeen(review.id).subscribe({
      next: () => {
        this.localReviews.update(list => list.filter(r => r.id !== review.id));
        this.localCount.update(n => Math.max(0, n - 1));
        if (this.localCount() === 0) this.seen.emit();
        this.updatePortal();
      },
    });
  }

  protected dismissAll(): void {
    this.svc.markNotificationsSeen().subscribe({
      next: () => {
        this.localReviews.set([]);
        this.localCount.set(0);
        this.seen.emit();
        this.updatePortal();
      },
    });
  }

  protected goToReviews(): void {
    this.router.navigate(['/admin/reviews']);
    this.destroyPortal();
  }

  private openPortal(): void {
    this.portalView = this.panelTpl.createEmbeddedView({});
    this.appRef.attachView(this.portalView);
    (this.portalView as any).detectChanges();
    this.portalView.rootNodes.forEach(n => this.doc.body.appendChild(n));
  }

  private updatePortal(): void {
    (this.portalView as any)?.detectChanges();
  }

  private destroyPortal(): void {
    if (!this.portalView) return;
    this.portalView.rootNodes.forEach(n => (n as HTMLElement).parentNode?.removeChild(n));
    this.appRef.detachView(this.portalView);
    this.portalView.destroy();
    this.portalView = null;
  }

  ngOnDestroy(): void {
    this.destroyPortal();
  }
}
