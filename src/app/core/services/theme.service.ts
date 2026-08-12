import { Injectable, computed, effect, signal } from '@angular/core';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'astroshop_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.loadTheme());

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    effect(() => {
      const theme = this._theme();
      document.documentElement.classList.toggle('light', theme === 'light');
      localStorage.setItem(STORAGE_KEY, theme);
    });
  }

  toggle(): void {
    this._theme.update(t => (t === 'dark' ? 'light' : 'dark'));
  }

  private loadTheme(): Theme {
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'light';
  }
}
