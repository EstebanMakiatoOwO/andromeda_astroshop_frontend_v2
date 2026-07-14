import { Component, OnInit, OnDestroy, signal, inject, input } from '@angular/core';
import { BannerService, Banner } from '../../../core/services/banner.service';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [],
  templateUrl: './hero-carousel.component.html',
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  private readonly svc = inject(BannerService);

  /** Modo offline: pasa rutas de imágenes locales directamente, sin llamar al backend */
  readonly offline = input<boolean>(false);
  readonly images  = input<string[]>([]);

  protected readonly banners  = signal<Banner[]>([]);
  protected readonly current  = signal(0);
  protected readonly loading  = signal(true);

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (this.offline()) {
      const bs: Banner[] = this.images().map((url, i) => ({
        id: i,
        title: `Banner ${i + 1}`,
        imageUrl: url,
        linkUrl: null,
        sortOrder: i,
        isActive: 1,
        createdAt: '',
      }));
      this.banners.set(bs);
      this.loading.set(false);
      this.startTimer(bs.length);
      return;
    }

    this.svc.getBanners().subscribe({
      next: bs => {
        this.banners.set(bs);
        this.loading.set(false);
        this.startTimer(bs.length);
      },
      error: () => this.loading.set(false),
    });
  }

  private startTimer(len: number): void {
    if (len > 1) {
      this.timer = setInterval(() => {
        this.current.update(i => (i + 1) % len);
      }, 6000);
    }
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

  private touchStartX = 0;

  protected onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].clientX;
  }

  protected onTouchEnd(e: TouchEvent): void {
    const delta = e.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(delta) < 40) return;
    delta < 0 ? this.next() : this.prev();
  }
}
