import { Component, input, output } from '@angular/core';
import { OrderCounts } from '../../../../core/models/order.model';

export interface Tab {
  key:      string;
  label:    string;
  status:   string | null;
  countKey: keyof OrderCounts;
}

@Component({
  selector: 'app-orders-tabs',
  standalone: true,
  template: `
    <div class="flex items-center border-b border-line bg-surface-3 overflow-x-auto shrink-0">
      @for (tab of tabs(); track tab.key) {
        <button
          (click)="tabSelect.emit(tab.status)"
          class="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2
                 whitespace-nowrap transition-colors"
          [class.border-accent]="activeStatus() === tab.status"
          [class.text-ink-1]="activeStatus() === tab.status"
          [class.border-transparent]="activeStatus() !== tab.status"
          [class.text-ink-3]="activeStatus() !== tab.status"
          [class.hover:text-ink-2]="activeStatus() !== tab.status"
        >
          {{ tab.label }}
          <span class="font-mono text-[10px] text-ink-3">{{ counts()?.[tab.countKey] ?? 0 }}</span>
        </button>
      }
    </div>
  `,
})
export class OrdersTabsComponent {
  tabs         = input.required<Tab[]>();
  activeStatus = input.required<string | null>();
  counts       = input<OrderCounts | null>(null);

  tabSelect = output<string | null>();
}
