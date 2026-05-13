import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface RecentOrderRow {
  number: string;
  client: string;
  total: string;
  status: string;
  badge: string;
  hasMP: boolean;
}

@Component({
  selector: 'app-dashboard-recent-orders',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="rounded-xl border border-line bg-surface-3 overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3.5 border-b border-line gap-3">
        <h3 class="text-sm font-semibold text-ink-1">Órdenes recientes</h3>
        <div class="flex items-center gap-2">
          <select
            [ngModel]="datePreset()"
            (ngModelChange)="datePresetChange.emit($event)"
            class="h-6 px-2 rounded border border-line bg-surface-4 text-[11px] text-ink-2
                   outline-none focus:border-accent cursor-pointer">
            <option value="all">Cualquier fecha</option>
            <option value="today">Hoy</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
          </select>
          <a class="font-mono text-[11px] text-accent cursor-pointer hover:underline">ver todas →</a>
        </div>
      </div>
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-line">
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">#</th>
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">Cliente</th>
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">Total</th>
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">MP</th>
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          @for (order of orders(); track order.number) {
            <tr class="border-b border-line last:border-0 hover:bg-surface-4 transition-colors">
              <td class="px-4 py-3 font-semibold text-ink-1">{{ order.number }}</td>
              <td class="px-4 py-3 text-ink-2">{{ order.client }}</td>
              <td class="px-4 py-3 text-ink-1">{{ order.total }}</td>
              <td class="px-4 py-3 font-mono text-ink-3">{{ order.hasMP ? 'vinculado' : '—' }}</td>
              <td class="px-4 py-3">
                <span [class]="order.badge">{{ order.status }}</span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DashboardRecentOrdersComponent {
  orders     = input.required<RecentOrderRow[]>();
  datePreset = input.required<string>();

  datePresetChange = output<string>();
}
