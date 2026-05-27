import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-shipping-calculator',
  standalone: true,
  template: `
    <div class="rounded-xl border border-line bg-surface-2 p-4 flex flex-col gap-3">

      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-ink-1">Envíos</h4>
        <span class="font-mono text-[10px] text-ink-3">código postal</span>
      </div>

      <div class="flex items-center gap-2">
        <input type="text" [value]="cp()"
               (input)="onInput($any($event.target).value)"
               placeholder="ej. 06600" maxlength="5"
               class="h-8 w-28 px-3 rounded-lg border border-line bg-surface-3
                      text-sm text-ink-1 placeholder-ink-3 outline-none
                      focus:border-accent transition-colors" />
        <button (click)="calculate()"
                class="h-8 px-3 rounded-lg border border-line text-xs text-ink-2
                       hover:text-ink-1 hover:border-accent transition-colors">
          Calcular
        </button>
        <a class="ml-auto font-mono text-[10px] text-accent cursor-pointer hover:underline">
          no sé mi CP →
        </a>
      </div>

      @if (calculated()) {
        <div class="flex flex-col gap-0 divide-y divide-line text-xs">
          <div class="flex justify-between items-center py-2">
            <span class="text-ink-2">Estándar · 5-7 días</span>
            <strong class="text-ink-1">$99.00</strong>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-ink-2">Express · 2-3 días</span>
            <strong class="text-ink-1">$149.00</strong>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-ink-2">Retiro en sucursal</span>
            <strong style="color:oklch(0.65 0.15 150)">Gratis</strong>
          </div>
        </div>
      }

    </div>
  `,
})
export class ShippingCalculatorComponent {
  protected readonly cp         = signal('');
  protected readonly calculated = signal(false);

  protected onInput(value: string): void {
    this.cp.set(value.replace(/\D/g, '').slice(0, 5));
  }

  protected calculate(): void {
    if (this.cp().length >= 4) this.calculated.set(true);
  }
}
