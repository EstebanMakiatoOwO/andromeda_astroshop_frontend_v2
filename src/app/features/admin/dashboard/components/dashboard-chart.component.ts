import { Component, input, output, signal } from '@angular/core';
import { SalesPeriod } from '../../../../core/models/dashboard.model';

export interface ChartPoint {
  x: number;
  y: number;
  date: string;
  amount: string;
}

interface TipPos {
  cx: number;
  cy: number;
  point: ChartPoint;
}

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  template: `
    <div class="rounded-xl border border-line bg-surface-3 p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-ink-1">
          Ventas · últimos
          {{ period() === '1h' ? '1' : period() === '1d' ? '1' : period() === '7d' ? '7' : period() === '30d' ? '30' : '90' }}
          días
        </h3>
        <div class="flex gap-1">
          @for (p of periods(); track p) {
            <button
              (click)="onPeriodClick(p)"
              class="h-6 px-2 rounded border text-[11px] transition-colors"
              [class.border-accent]="period() === p"
              [class.bg-accent]="period() === p"
              [class.text-white]="period() === p"
              [class.border-line]="period() !== p"
              [class.bg-surface-4]="period() !== p"
              [class.text-ink-2]="period() !== p"
            >{{ p }}</button>
          }
        </div>
      </div>

      <svg viewBox="0 0 600 160" class="w-full">
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="var(--color-accent)" stop-opacity="0.3" />
            <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0"   />
          </linearGradient>
          <filter id="dotGlow" x="-120%" y="-120%" width="340%" height="340%">
            <feDropShadow dx="0" dy="0" stdDeviation="4"
                          flood-color="var(--color-accent)" flood-opacity="1"/>
          </filter>
        </defs>
        <line x1="0" x2="600" y1="40"  y2="40"  stroke="var(--color-line)" stroke-dasharray="2 4" />
        <line x1="0" x2="600" y1="80"  y2="80"  stroke="var(--color-line)" stroke-dasharray="2 4" />
        <line x1="0" x2="600" y1="120" y2="120" stroke="var(--color-line)" stroke-dasharray="2 4" />
        <path [attr.d]="areaPath()" fill="url(#salesGradient)" />
        <polyline fill="none" stroke="var(--color-accent)" stroke-width="2" [attr.points]="linePoints()" />

        @for (pt of points(); track pt.date) {
          @if (hoveredPoint()?.date === pt.date) {
            <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="9"   fill="var(--color-accent)" opacity="0.18" />
            <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4.5" fill="var(--color-accent)" filter="url(#dotGlow)" />
          } @else {
            <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3" fill="var(--color-accent)" />
          }
          <circle
            [attr.cx]="pt.x" [attr.cy]="pt.y" r="12"
            fill="transparent"
            (mouseenter)="onPointEnter($event, pt)"
            (mouseleave)="onPointLeave()"
          />
        }

        @if (hoveredPoint(); as pt) {
          <line
            [attr.x1]="pt.x" [attr.x2]="pt.x"
            [attr.y1]="pt.y" y2="160"
            stroke="var(--color-accent)" stroke-width="1" stroke-dasharray="3 3" opacity="0.5"
          />
        }
      </svg>

      @if (tipPos(); as tip) {
        <div
          class="fixed z-9999 pointer-events-none flex flex-col items-center"
          [style.left.px]="tip.cx"
          [style.top.px]="tip.cy - 14"
          style="transform: translate(-50%, -100%)"
        >
          <div class="rounded-xl px-3.5 py-2.5 shadow-xl shadow-black/20 border border-white/10"
               style="background: var(--color-accent)">
            <p class="font-mono text-[10px] leading-none mb-1.5" style="color: rgba(255,255,255,0.6)">{{ tip.point.date }}</p>
            <p class="text-sm font-bold leading-none text-white">{{ tip.point.amount }}</p>
          </div>
          <div class="w-0 h-0"
               style="border-left:7px solid transparent;border-right:7px solid transparent;border-top:8px solid var(--color-accent)">
          </div>
        </div>
      }

      <div class="flex justify-between mt-2">
        <small class="font-mono text-[11px] text-ink-3">{{ dates().start }}</small>
        <small class="font-mono text-[11px] text-ink-3">{{ dates().end }}</small>
      </div>
    </div>
  `,
})
export class DashboardChartComponent {
  period     = input.required<SalesPeriod>();
  periods    = input.required<SalesPeriod[]>();
  linePoints = input.required<string>();
  areaPath   = input.required<string>();
  points     = input.required<ChartPoint[]>();
  dates      = input.required<{ start: string; end: string }>();

  periodChange = output<SalesPeriod>();

  protected readonly hoveredPoint = signal<ChartPoint | null>(null);
  protected readonly tipPos       = signal<TipPos | null>(null);

  protected onPeriodClick(p: SalesPeriod): void {
    if (this.period() !== p) this.periodChange.emit(p);
  }

  protected onPointEnter(e: MouseEvent, pt: ChartPoint): void {
    this.hoveredPoint.set(pt);
    this.tipPos.set({ cx: e.clientX, cy: e.clientY, point: pt });
  }

  protected onPointLeave(): void {
    this.hoveredPoint.set(null);
    this.tipPos.set(null);
  }
}
