import { Component, input } from '@angular/core';

export interface LowStockRow {
  name: string;
  sku: string;
  units: number;
  initial: string;
}

@Component({
  selector: 'app-dashboard-low-stock',
  standalone: true,
  template: `
    <div class="rounded-xl border border-line bg-surface-3 h-full overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3.5 border-b border-line">
        <h3 class="text-sm font-semibold text-ink-1">Stock bajo</h3>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warn-soft text-warn">
          {{ count() }} producto{{ count() !== 1 ? 's' : '' }}
        </span>
      </div>
      <div class="flex flex-col p-2">
        @for (product of products(); track product.sku) {
          <div class="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-surface-4 transition-colors">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-surface-4 border border-line flex items-center justify-center text-[10px] font-bold text-ink-3 shrink-0">
                {{ product.initial }}
              </div>
              <div class="flex flex-col gap-0">
                <span class="text-xs font-semibold text-ink-1">{{ product.name }}</span>
                <span class="text-[11px] text-ink-3">quedan {{ product.units }}</span>
              </div>
            </div>
            <button class="h-6 px-2.5 rounded border border-line bg-surface-4 text-[11px] text-ink-2 hover:text-ink-1 hover:bg-surface-3 transition-colors">
              Reponer
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardLowStockComponent {
  products = input.required<LowStockRow[]>();
  count    = input.required<number>();
}
