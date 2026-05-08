import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminOrder } from '../../../../core/models/order.model';
import { ars, fmtDate, statusLabel, badgeClass } from '../orders.helpers';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (isLoading()) {
      <div class="flex items-center justify-center h-40 text-ink-3 text-sm font-mono">
        Cargando órdenes…
      </div>
    } @else if (orders().length === 0) {
      <div class="flex flex-col items-center justify-center h-40 gap-2">
        <p class="text-ink-3 text-sm">Sin resultados</p>
        <p class="text-ink-3 text-xs">Probá con otro filtro o término de búsqueda</p>
      </div>
    } @else {
      <table class="w-full text-xs">
        <thead class="sticky top-0 z-10 bg-surface-3">
          <tr class="border-b border-line">
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">#</th>
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">Fecha</th>
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">Cliente</th>
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">Productos</th>
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">Total</th>
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">MP</th>
            <th class="px-4 py-2.5 text-left font-medium text-ink-3">Estado</th>
            <th class="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          @for (order of orders(); track order.id) {
            <tr class="border-b border-line last:border-0 hover:bg-surface-4 transition-colors">
              <td class="px-4 py-3 font-semibold text-ink-1">#A-{{ order.id }}</td>
              <td class="px-4 py-3 font-mono text-ink-3">{{ fmtDate(order.createdAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-0">
                  <span class="font-medium text-ink-1">
                    {{ order.guestName ?? 'Invitado' }}
                    @if (!order.guestName) {
                      <span class="ml-1 px-1 py-0.5 rounded text-[9px] font-semibold bg-surface-4 text-ink-3">guest</span>
                    }
                  </span>
                  <span class="text-[11px] text-ink-3">{{ order.guestEmail ?? '' }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-ink-2">
                {{ order.items.length }} ítem{{ order.items.length !== 1 ? 's' : '' }}
              </td>
              <td class="px-4 py-3 font-semibold text-ink-1">{{ ars(order.total) }}</td>
              <td class="px-4 py-3 font-mono text-ink-3">
                {{ order.mpPreferenceId ? 'vinculado' : '—' }}
              </td>
              <td class="px-4 py-3">
                <span [class]="badgeClass(order.status)">{{ statusLabel(order.status) }}</span>
              </td>
              <td class="px-4 py-3">
                <a [routerLink]="['/admin/orders', order.id]"
                   class="font-mono text-[11px] text-accent hover:underline cursor-pointer">
                  Ver →
                </a>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
})
export class OrdersTableComponent {
  orders    = input.required<AdminOrder[]>();
  isLoading = input.required<boolean>();

  protected ars         = ars;
  protected fmtDate     = fmtDate;
  protected statusLabel = statusLabel;
  protected badgeClass  = badgeClass;
}
