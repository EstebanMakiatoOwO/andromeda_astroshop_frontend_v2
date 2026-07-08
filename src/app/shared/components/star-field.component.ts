import { Component, computed, input } from '@angular/core';

interface Star {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
  dur: number;
  begin: number;
  animVals: string;
}

@Component({
  selector: 'app-star-field',
  standalone: true,
  template: `
    <svg
      class="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      @for (star of stars(); track $index) {
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
    </svg>
  `,
})
export class StarFieldComponent {
  count = input(60);
  seed  = input(42);
  color = input('white');

  protected readonly stars = computed<Star[]>(() => {
    const rand = this.lcg(this.seed());
    return Array.from({ length: this.count() }, () => {
      const opacity = 0.15 + rand() * 0.65;
      const dur     = 2 + rand() * 5;
      const begin   = rand() * 6;
      return {
        cx:       rand() * 100,
        cy:       rand() * 100,
        r:        0.08 + rand() * 0.22,
        opacity,
        dur,
        begin,
        animVals: `${opacity};${+(opacity * 0.08).toFixed(3)};${opacity}`,
      };
    });
  });

  private lcg(seed: number): () => number {
    let s = seed | 0;
    return () => {
      s = (Math.imul(1664525, s) + 1013904223) | 0;
      return (s >>> 0) / 0xffffffff;
    };
  }
}
