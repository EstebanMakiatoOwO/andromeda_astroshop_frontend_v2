import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { BannerService, Banner } from '../../../core/services/banner.service';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [],
  templateUrl: './hero-carousel.component.html',
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  private readonly svc = inject(BannerService);

  protected readonly banners  = signal<Banner[]>([]);
  protected readonly current  = signal(0);
  protected readonly loading  = signal(true);

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.svc.getBanners().subscribe({
      next: bs => {
        this.banners.set(bs);
        this.loading.set(false);
        if (bs.length > 1) {
          this.timer = setInterval(() => {
            this.current.update(i => (i + 1) % bs.length);
          }, 6000);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  protected prev(): void {
    const len = this.banners().length;
    this.current.update(i => (i - 1 + len) % len);
  }

  protected next(): void {
    this.current.update(i => (i + 1) % this.banners().length);
  }

  protected goTo(i: number): void {
    this.current.set(i);
  }
}
