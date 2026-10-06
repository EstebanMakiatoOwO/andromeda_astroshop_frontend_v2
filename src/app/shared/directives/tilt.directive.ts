import { Directive, ElementRef, NgZone, OnDestroy, OnInit, Renderer2, inject } from '@angular/core';

/**
 * 3D tilt + cursor-spotlight on hover. Desktop-only (skips touch devices
 * and prefers-reduced-motion). Host should have `overflow-hidden` so the
 * glow clips to its rounded corners.
 */
@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly renderer = inject(Renderer2);

  private glowEl?: HTMLElement;
  private rafId?: number;
  private readonly maxTilt = 7; // degrees

  private readonly onMove = (e: MouseEvent) => {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * this.maxTilt * 2;
    const rotateX = (0.5 - y) * this.maxTilt * 2;

    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      this.el.nativeElement.style.transform =
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015,1.015,1.015)`;
      if (this.glowEl) {
        this.glowEl.style.opacity = '1';
        this.glowEl.style.background =
          `radial-gradient(circle at ${x * 100}% ${y * 100}%, color-mix(in oklch, var(--color-accent) 22%, transparent), transparent 60%)`;
      }
    });
  };

  private readonly onEnter = () => {
    this.el.nativeElement.style.willChange = 'transform';
  };

  private readonly onLeave = () => {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    const host = this.el.nativeElement;
    host.style.transform = '';
    if (this.glowEl) this.glowEl.style.opacity = '0';
    // Release the compositor layer once the reset transition settles
    // instead of holding it for the lifetime of the page.
    host.addEventListener('transitionend', () => { host.style.willChange = 'auto'; }, { once: true });
  };

  ngOnInit(): void {
    const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hoverCapable || reduceMotion) return;

    const host = this.el.nativeElement;
    host.style.transition = 'transform 0.2s ease-out';
    host.style.transformStyle = 'preserve-3d';
    if (getComputedStyle(host).position === 'static') {
      host.style.position = 'relative';
    }

    this.glowEl = this.renderer.createElement('div');
    this.renderer.setAttribute(this.glowEl, 'aria-hidden', 'true');
    this.renderer.setStyle(this.glowEl, 'position', 'absolute');
    this.renderer.setStyle(this.glowEl, 'inset', '0');
    this.renderer.setStyle(this.glowEl, 'pointer-events', 'none');
    this.renderer.setStyle(this.glowEl, 'opacity', '0');
    this.renderer.setStyle(this.glowEl, 'transition', 'opacity 0.3s ease-out');
    this.renderer.setStyle(this.glowEl, 'z-index', '1');
    this.renderer.appendChild(host, this.glowEl);

    this.zone.runOutsideAngular(() => {
      host.addEventListener('mouseenter', this.onEnter);
      host.addEventListener('mousemove', this.onMove);
      host.addEventListener('mouseleave', this.onLeave);
    });
  }

  ngOnDestroy(): void {
    const host = this.el.nativeElement;
    host.removeEventListener('mouseenter', this.onEnter);
    host.removeEventListener('mousemove', this.onMove);
    host.removeEventListener('mouseleave', this.onLeave);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
