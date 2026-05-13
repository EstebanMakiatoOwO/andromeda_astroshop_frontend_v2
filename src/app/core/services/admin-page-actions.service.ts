import { Injectable, TemplateRef, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminPageActionsService {
  private readonly _ref       = signal<TemplateRef<unknown> | null>(null);
  private readonly _badge     = signal<{ cls: string; label: string } | null>(null);
  private readonly _backRoute = signal<string | null>(null);
  private readonly _backLabel = signal<string>('Volver');

  readonly actionsRef = this._ref.asReadonly();
  readonly badge      = this._badge.asReadonly();
  readonly backRoute  = this._backRoute.asReadonly();
  readonly backLabel  = this._backLabel.asReadonly();

  setActions(ref: TemplateRef<unknown>): void          { this._ref.set(ref); }
  setBadge(cls: string, label: string): void           { this._badge.set({ cls, label }); }
  setBack(route: string, label: string): void          { this._backRoute.set(route); this._backLabel.set(label); }

  clear(): void {
    this._ref.set(null);
    this._badge.set(null);
    this._backRoute.set(null);
    this._backLabel.set('Volver');
  }
}
