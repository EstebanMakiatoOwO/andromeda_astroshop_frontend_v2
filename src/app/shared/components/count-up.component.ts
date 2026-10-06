import { Component, ElementRef, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';

/**
 * Animates the numeric part of a string ("+1,500", "6 años", "5.0 ★") from 0
 * up to its value once it scrolls into view. Prefix/suffix text stays static.
 */
@Component({
  selector: 'app-count-up',
  standalone: true,
  template: `{{ display() }}`,
})
export class CountUpComponent implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private rafId?: number;

  private prefix = '';
  private suffix = '';
  private end = 0;
  private decimals = 0;
  private useCommas = false;

  protected readonly display = signal('');

  @Input({ required: true })
  set value(raw: string) {
    this.parse(raw);
    this.display.set(raw);
  }

  private parse(raw: string): void {
    const match = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!match) {
      this.prefix = '';
      this.suffix = raw;
      this.end = 0;
      return;
    }
    const [, prefix, numStr, suffix] = match;
    this.prefix = prefix;
    this.suffix = suffix;
    this.useCommas = numStr.includes(',');
    const decimalPart = numStr.match(/\.(\d+)$/);
    this.decimals = decimalPart ? decimalPart[1].length : 0;
    this.end = parseFloat(numStr.replace(/,/g, ''));
  }

  private format(n: number): string {
    const fixed = n.toFixed(this.decimals);
    if (!this.useCommas) return `${this.prefix}${fixed}${this.suffix}`;
    const [int, dec] = fixed.split('.');
    const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${this.prefix}${dec ? `${withCommas}.${dec}` : withCommas}${this.suffix}`;
  }

  ngOnInit(): void {
    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return; // display() already holds the final static value
    }

    this.observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.animate();
            this.observer?.unobserve(this.el.nativeElement);
          }
        }
      },
      { threshold: 0.4 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  private animate(): void {
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      this.display.set(this.format(this.end * eased));
      if (t < 1) {
        this.rafId = requestAnimationFrame(tick);
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
