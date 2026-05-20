import { Component, computed, input } from '@angular/core';

interface Star { cx: number; cy: number; r: number; opacity: number; }

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
          fill="white"
          [attr.opacity]="star.opacity"
        />
      }
    </svg>
  `,
})
export class StarFieldComponent {
  count = input(60);
  seed  = input(42);

  protected readonly stars = computed<Star[]>(() => {
    const rand = this.lcg(this.seed());
    return Array.from({ length: this.count() }, () => ({
      cx:      rand() * 100,
      cy:      rand() * 100,
      r:       0.08 + rand() * 0.22,
      opacity: 0.15 + rand() * 0.65,
    }));
  });

  private lcg(seed: number): () => number {
    let s = seed | 0;
    return () => {
      s = (Math.imul(1664525, s) + 1013904223) | 0;
      return (s >>> 0) / 0xffffffff;
    };
  }
}
