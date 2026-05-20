import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <span class="text-warn text-xs tracking-tight leading-none" [attr.aria-label]="value() + ' de ' + of() + ' estrellas'">
      @for (filled of stars(); track $index) {
        {{ filled ? '★' : '☆' }}
      }
    </span>
  `,
})
export class StarRatingComponent {
  value = input(4);
  of    = input(5);

  protected readonly stars = computed(() =>
    Array.from({ length: this.of() }, (_, i) => i < Math.round(this.value()))
  );
}
