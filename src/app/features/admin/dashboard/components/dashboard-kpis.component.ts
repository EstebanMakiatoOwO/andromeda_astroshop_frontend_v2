import { Component, input } from '@angular/core';

export interface KpiCard {
  label: string;
  value: string;
  sparkPoints: string;
}

@Component({
  selector: 'app-dashboard-kpis',
  standalone: true,
  template: `
    <div class="grid grid-cols-4 gap-3 mb-5">
      @for (kpi of kpis(); track kpi.label) {
        <div class="rounded-xl border border-line bg-surface-3 p-4">
          <small class="font-mono text-xs text-ink-3">{{ kpi.label }}</small>
          <div class="text-[22px] font-semibold text-ink-1 mt-1">{{ kpi.value }}</div>
          <svg viewBox="0 0 200 30" class="w-full mt-2">
            <polyline
              fill="none"
              stroke="var(--color-accent)"
              stroke-width="1.5"
              [attr.points]="kpi.sparkPoints"
            />
          </svg>
        </div>
      }
    </div>
  `,
})
export class DashboardKpisComponent {
  kpis = input.required<KpiCard[]>();
}
