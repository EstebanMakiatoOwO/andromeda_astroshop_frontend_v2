import {
  Component, computed, input, ElementRef, OnInit, OnDestroy, AfterViewInit,
  NgZone, QueryList, ViewChildren,
} from '@angular/core';

interface Star {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
  dur: number;
  begin: number;
  animVals: string;
}

interface Layer {
  depth: number; // 0 (far, barely moves) .. 1 (near, moves most)
  stars: Star[];
}

@Component({
  selector: 'app-star-field',
  standalone: true,
  template: `
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      @for (layer of layers(); track layer.depth) {
        <g #layerGroup [attr.data-depth]="layer.depth">
          @for (star of layer.stars; track $index) {
            <circle
              [attr.cx]="star.cx"
              [attr.cy]="star.cy"
              [attr.r]="star.r"
              [attr.fill]="color()"
              [attr.opacity]="star.opacity"
            >
              <animate
                attributeName="opacity"
                [attr.values]="star.animVals"
                [attr.dur]="star.dur + 's'"
                [attr.begin]="star.begin + 's'"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;0.5;1"
                keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
              />
            </circle>
          }
        </g>
      }
    </svg>
  `,
})
export class StarFieldComponent implements OnInit, AfterViewInit, OnDestroy {
  count = input(60);
  seed  = input(42);
  color = input('white');
  /** Max px the nearest layer shifts per 1000px of scroll. 0 disables parallax. */
  parallax = input(18);

  @ViewChildren('layerGroup') private layerGroups!: QueryList<ElementRef<SVGGElement>>;

  private rafId?: number;
  private readonly reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /** Touch/Android devices: skip the scroll listener entirely — fling-scroll
   *  + a parallax repaint on a fixed full-viewport layer is a classic jank
   *  source on budget GPUs, and the effect reads best with a mouse anyway. */
  private readonly coarsePointer =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  private readonly onScroll = () => {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = undefined;
      const y = window.scrollY;
      this.layerGroups?.forEach(ref => {
        const depth = parseFloat(ref.nativeElement.getAttribute('data-depth') ?? '0');
        const offset = (y / 1000) * this.parallax() * depth;
        ref.nativeElement.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    });
  };

  protected readonly layers = computed<Layer[]>(() => {
    const rand = this.lcg(this.seed());
    const depths = [0.2, 0.5, 1];
    const buckets: Layer[] = depths.map(depth => ({ depth, stars: [] }));

    for (let i = 0; i < this.count(); i++) {
      const opacity = 0.15 + rand() * 0.65;
      const dur     = 2 + rand() * 5;
      const begin   = rand() * 6;
      const bucket  = buckets[Math.floor(rand() * buckets.length)];
      bucket.stars.push({
        cx: rand() * 100,
        cy: rand() * 100,
        r:  0.08 + rand() * 0.22,
        opacity,
        dur,
        begin,
        animVals: `${opacity};${+(opacity * 0.08).toFixed(3)};${opacity}`,
      });
    }
    return buckets;
  });

  constructor(private readonly host: ElementRef<HTMLElement>, private readonly zone: NgZone) {}

  private lcg(seed: number): () => number {
    let s = seed | 0;
    return () => {
      s = (Math.imul(1664525, s) + 1013904223) | 0;
      return (s >>> 0) / 0xffffffff;
    };
  }

  ngOnInit(): void {
    const el = this.host.nativeElement;
    el.style.position = 'fixed';
    el.style.inset = '0';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '0';
  }

  ngAfterViewInit(): void {
    if (this.reduceMotion || this.coarsePointer || this.parallax() === 0) return;
    this.layerGroups?.forEach(ref => { ref.nativeElement.style.willChange = 'transform'; });
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
