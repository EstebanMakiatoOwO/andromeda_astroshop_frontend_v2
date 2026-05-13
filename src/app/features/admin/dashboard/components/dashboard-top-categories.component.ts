import { Component, input } from '@angular/core';

export interface TopCategoryRow {
  name: string;
  percent: number;
  amount: string;
}

@Component({
  selector: 'app-dashboard-top-categories',
  standalone: true,
  template: `
    <div class="rounded-xl border border-line bg-surface-3 p-4 h-full">
      <h3 class="text-sm font-semibold text-ink-1 mb-3">Top categorías</h3>
      <div class="flex flex-col gap-2.5">
        @for (cat of categories(); track cat.name) {
          <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <small class="text-xs font-medium text-ink-2">{{ cat.name }}</small>
              <small class="font-mono text-[11px] text-ink-3">{{ cat.amount }}</small>
            </div>
            <div class="h-1 rounded-full bg-surface-4">
              <div
                class="h-full rounded-full bg-accent transition-all duration-500"
                [style.width.%]="cat.percent"
              ></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardTopCategoriesComponent {
  categories = input.required<TopCategoryRow[]>();
}
