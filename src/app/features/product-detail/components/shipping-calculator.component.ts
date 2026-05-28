import { Component, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ShippingRate, ShippingService } from '../../../core/services/shipping.service';

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
               (keydown.enter)="calculate()"
               placeholder="ej. 06600" maxlength="5"
               class="h-8 w-28 px-3 rounded-lg border border-line bg-surface-3
                      text-sm text-ink-1 placeholder-ink-3 outline-none
                      focus:border-accent transition-colors" />
        <button (click)="calculate()"
                [disabled]="loading() || cp().length < 4"
                class="h-8 px-3 rounded-lg border border-line text-xs text-ink-2
                       hover:text-ink-1 hover:border-accent transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed">
          {{ loading() ? 'Calculando…' : 'Calcular' }}
        </button>
        <a href="https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/Descarga.aspx"
           target="_blank" rel="noopener noreferrer"
           class="ml-auto font-mono text-[10px] text-accent hover:underline whitespace-nowrap">
          no sé mi CP →
        </a>
      </div>

      @if (error()) {
        <p class="text-xs text-error">{{ error() }}</p>
      }

      @if (loading()) {
        <div class="flex flex-col gap-0 divide-y divide-line text-xs animate-pulse">
          @for (i of [1,2,3]; track i) {
            <div class="flex justify-between items-center py-2">
              <div class="h-3 w-32 rounded bg-surface-3"></div>
              <div class="h-3 w-12 rounded bg-surface-3"></div>
            </div>
          }
        </div>
      }

      @if (!loading() && rates().length > 0) {
        <div class="flex flex-col gap-0 divide-y divide-line text-xs">
          @for (r of rates(); track r.methodCode) {
            <div class="flex justify-between items-center py-2">
              <span class="text-ink-2">{{ r.carrierTitle }} {{ r.methodTitle }}</span>
              @if (r.price === 0) {
                <strong class="text-success">Gratis</strong>
              } @else {
                <strong class="text-ink-1">{{ formatPrice(r.price) }}</strong>
              }
            </div>
          }
        </div>
      }

      @if (!loading() && searched() && rates().length === 0 && !error()) {
        <p class="text-xs text-ink-3 italic">
          No hay envíos disponibles para ese código postal.
        </p>
      }

    </div>
  `,
})
export class ShippingCalculatorComponent {
  productId = input.required<number>();
  qty       = input(1);

  private readonly shippingService = inject(ShippingService);

  protected readonly cp       = signal('');
  protected readonly rates    = signal<ShippingRate[]>([]);
  protected readonly loading  = signal(false);
  protected readonly error    = signal<string | null>(null);
  protected readonly searched = signal(false);

  protected onInput(value: string): void {
    this.cp.set(value.replace(/\D/g, '').slice(0, 5));
    this.rates.set([]);
    this.searched.set(false);
    this.error.set(null);
  }

  protected calculate(): void {
    if (this.cp().length < 4 || this.loading()) return;
    this.error.set(null);
    this.searched.set(false);
    this.loading.set(true);

    this.shippingService
      .estimate(this.cp(), this.productId(), this.qty())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next:  rates => { this.rates.set(rates); this.searched.set(true); },
        error: err   => this.error.set(err?.error?.message ?? 'Error al calcular envío'),
      });
  }

  protected formatPrice(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(value) + ' MXN';
  }
}
