import { Directive, ElementRef, Input, NgZone, OnDestroy, OnInit, inject } from '@angular/core';

/**
 * Fade+slide-in an element the first time it scrolls into view.
 * Usage: <div appReveal [appRevealDelay]="i * 80">...</div>
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: { class: 'reveal' },
})
export class RevealDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;

  /** Stagger delay in ms, typically `i * 80` inside a @for loop. */
  @Input('appRevealDelay') delayMs = 0;

  ngOnInit(): void {
    const el = this.el.nativeElement;
    el.style.setProperty('--reveal-delay', `${this.delayMs}ms`);

    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }

    // Pure DOM/CSS work (a class toggle driving a CSS transition) — runs
    // outside Angular so it never forces a full app change-detection cycle.
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              el.classList.add('is-visible');
              this.observer?.unobserve(el);
              // Drop the will-change hint only once the transition has
              // actually finished, freeing the compositor layer instead of
              // holding it forever on pages with many revealed elements.
              el.addEventListener('transitionend', () => { el.style.willChange = 'auto'; }, { once: true });
            }
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
      );
      this.observer.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
