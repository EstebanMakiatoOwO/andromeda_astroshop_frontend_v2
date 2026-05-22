import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1">
      <small class="text-xs text-ink-3">{{ label() }}</small>
      <div class="relative">
        <input
          [formControl]="control()"
          [type]="show() ? 'text' : 'password'"
          [placeholder]="placeholder()"
          class="w-full h-9 pl-3 pr-9 rounded-lg border text-sm text-ink-1
                 bg-surface-3 placeholder-ink-3 outline-none transition-colors focus:border-accent"
          [class.border-error]="errorMsg()"
          [class.border-line]="!errorMsg()"
        />
        <button type="button" (click)="show.update(v => !v)"
                class="absolute right-2.5 top-1/2 -translate-y-1/2
                       text-ink-3 hover:text-ink-1 transition-colors">
          @if (show()) {
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          } @else {
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          }
        </button>
      </div>
      @if (errorMsg()) {
        <span class="text-[10px] text-error">{{ errorMsg() }}</span>
      }
    </div>
  `,
})
export class PasswordInputComponent {
  control     = input.required<FormControl<string | null>>();
  label       = input('Contraseña');
  placeholder = input('••••••••');
  errorMsg    = input<string | null>(null);

  protected readonly show = signal(false);
}
