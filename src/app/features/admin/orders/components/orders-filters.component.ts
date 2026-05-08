import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-orders-filters',
  standalone: true,
  template: `
    <div class="flex items-center gap-2 px-6 py-2.5 border-b border-line bg-surface-3 shrink-0">
      <input
        (input)="searchChange.emit($any($event.target).value)"
        placeholder="Buscar por # orden, email, nombre…"
        class="h-7 px-3 rounded border border-line bg-surface-4 text-xs text-ink-1
               placeholder:text-ink-3 outline-none focus:border-accent focus:ring-1
               focus:ring-accent w-72"
      />
      <select
        [value]="datePreset()"
        (change)="datePresetChange.emit($any($event.target).value)"
        class="h-7 px-2 rounded border border-line bg-surface-4 text-xs text-ink-2
               outline-none focus:border-accent cursor-pointer">
        <option value="all">Cualquier fecha</option>
        <option value="today">Hoy</option>
        <option value="7d">Últimos 7 días</option>
        <option value="30d">Últimos 30 días</option>
      </select>
    </div>
  `,
})
export class OrdersFiltersComponent {
  datePreset = input.required<string>();

  searchChange     = output<string>();
  datePresetChange = output<string>();
}
