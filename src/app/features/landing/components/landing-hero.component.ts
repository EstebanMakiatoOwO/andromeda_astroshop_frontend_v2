import { Component, computed, input, output } from '@angular/core';
import { StarFieldComponent } from '../../../shared/components/star-field.component';

export const BRAND_ACCENTS = {
  base:    'oklch(0.55 0.16 290)',
  shop:    'oklch(0.55 0.16 290)',
  turismo: 'oklch(0.58 0.15 245)',
  dome:    'oklch(0.50 0.16 275)',
} as const;

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [StarFieldComponent],
  templateUrl: './landing-hero.component.html',
})
export class LandingHeroComponent {
  kicker    = input('');
  title     = input('');
  desc      = input('');
  accent    = input<string>(BRAND_ACCENTS.base);
  dark      = input(true);
  minHeight = input(340);
  stars     = input(80);
  ctas      = input<string[]>([]);

  ctaClick  = output<number>();

  protected readonly bgStyle = computed(() => {
    if (!this.dark()) {
      return 'linear-gradient(180deg, var(--color-surface-2), var(--color-bg))';
    }
    const a = this.accent();
    return `radial-gradient(circle at 80% 20%, color-mix(in oklch, ${a} 40%, transparent), transparent 55%), oklch(0.18 0.04 275)`;
  });

  protected readonly kickerColor = computed(() =>
    this.dark()
      ? `color-mix(in oklch, ${this.accent()} 60%, white)`
      : this.accent()
  );

  protected readonly orbitColor = computed(() =>
    `color-mix(in oklch, ${this.accent()} 35%, transparent)`
  );

  protected ctaStyle(i: number): Record<string, string> {
    if (i === 0) {
      return { background: this.accent(), color: 'white', border: 'none' };
    }
    return {
      background: 'transparent',
      color: this.dark() ? 'white' : 'var(--color-ink-1)',
      border: this.dark()
        ? '1px solid rgba(255,255,255,0.35)'
        : '1px solid var(--color-line)',
    };
  }
}
