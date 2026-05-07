import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [],
  template: `
    <div
      class="flex items-center gap-2 select-none"
      [class.justify-center]="compact()"
    >
      <svg
        class="shrink-0 text-accent"
        [attr.width]="size()"
        [attr.height]="size()"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="16" cy="16" r="14"
          stroke="currentColor" stroke-width="1.5"
          stroke-dasharray="3 2" opacity="0.4"
        />
        <path
          d="M16 4 L17.8 13.2 L27 12 L19.6 18.4 L22 28 L16 22.4 L10 28 L12.4 18.4 L5 12 L14.2 13.2 Z"
          fill="currentColor" opacity="0.9"
        />
        <circle cx="16" cy="16" r="2" fill="var(--color-surface-2)" />
      </svg>

      @if (!compact()) {
        <div class="flex flex-col leading-none gap-0.5">
          <span class="text-sm font-bold tracking-widest text-ink-1 uppercase">
            Andromeda
          </span>
          <span class="text-[10px] tracking-[0.2em] text-ink-3 uppercase">
            Astroshop
          </span>
        </div>
      }
    </div>
  `,
})
export class LogoComponent {
  compact = input<boolean>(false);
  size = input<number>(28);
}
