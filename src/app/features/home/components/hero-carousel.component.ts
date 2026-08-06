import { Component, OnInit, OnDestroy, signal, inject, input } from '@angular/core';
import { BannerService } from '../../../core/services/banner.service';

interface Slide {
  id:      number;
  title:   string;
  desktop: string;
  mobile:  string;
  linkUrl: string | null;
}

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
  readonly images  = input<({ desktop: string; mobile: string } | string)[]>([]);

  protected readonly slides  = signal<Slide[]>([]);
  protected readonly current = signal(0);
  protected readonly loading = signal(true);

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (this.offline()) {
      const ss: Slide[] = this.images().map((img, i) => ({
        id:      i,
        title:   `Banner ${i + 1}`,
        desktop: typeof img === 'string' ? img : img.desktop,
        mobile:  typeof img === 'string' ? img : img.mobile,
        linkUrl: null,
      }));
      this.slides.set(ss);
      this.loading.set(false);
      this.startTimer(ss.length);
      return;
    }

    this.svc.getBanners().subscribe({
      next: bs => {
        const ss: Slide[] = bs.map(b => ({
          id:      b.id,
          title:   b.title,
          desktop: b.imageUrl,
          mobile:  b.imageUrl,
          linkUrl: b.linkUrl,
        }));
        this.slides.set(ss);
        this.loading.set(false);
        this.startTimer(ss.length);
      },
      error: () => this.loading.set(false),
    });
  }

  private startTimer(len: number): void {
    if (len > 1) {
      this.timer = setInterval(() => {
        this.current.update(i => (i + 1) % len);
      }, 4000);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  protected prev(): void {
    const len = this.slides().length;
    this.current.update(i => (i - 1 + len) % len);
  }

  protected next(): void {
    this.current.update(i => (i + 1) % this.slides().length);
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
