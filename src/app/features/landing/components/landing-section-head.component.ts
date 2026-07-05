import { Component, input } from '@angular/core';

@Component({
  selector: 'app-landing-section-head',
  standalone: true,
  template: `
    <div class="flex flex-col gap-1.5 mb-6"
         [class.items-center]="center()"
         [class.text-center]="center()">
      @if (kicker()) {
        <span class="font-mono text-xs" [style.color]="accent()">{{ kicker() }}</span>
      }
      <h2 class="text-2xl font-bold text-ink-1">{{ title() }}</h2>
      @if (desc()) {
        <p class="text-sm text-ink-2 max-w-lg">{{ desc() }}</p>
      }
    </div>
  `,
})
export class LandingSectionHeadComponent {
  kicker = input('');
  title  = input.required<string>();
  desc   = input('');
  accent = input('var(--color-accent)');
  center = input(false);
}
