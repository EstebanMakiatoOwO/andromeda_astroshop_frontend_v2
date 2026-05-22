import { Component } from '@angular/core';

@Component({
  selector: 'app-loyalty-teaser',
  standalone: true,
  host: { class: 'flex' },
  template: `
    <div class="flex flex-col gap-3 p-5 rounded-xl border flex-1"
         style="background:var(--color-accent-soft);border-color:color-mix(in oklch,var(--color-accent) 30%,transparent)">

      <span class="font-mono text-xs" style="color:var(--color-accent)">
        // la única razón para crear cuenta
      </span>
      <h3 class="text-sm font-semibold" style="color:var(--color-accent)">
        Sumá puntos de loyalty
      </h3>

      <div class="flex flex-col gap-3 mt-1">
        @for (item of perks; track item.value) {
          <div class="flex items-start gap-2">
            <span class="text-sm font-bold shrink-0" style="color:var(--color-accent)">{{ item.value }}</span>
            <small class="text-xs leading-relaxed" style="color:var(--color-accent)">{{ item.label }}</small>
          </div>
        }
      </div>

      <div class="pt-3 mt-1 border-t"
           style="border-color:color-mix(in oklch,var(--color-accent) 30%,transparent)">
        <small class="text-xs" style="color:var(--color-accent)">
          + seguimiento de órdenes y tus reseñas en un lugar
        </small>
      </div>
    </div>
  `,
})
export class LoyaltyTeaserComponent {
  protected readonly perks = [
    { value: '+100', label: 'pts de bienvenida al registrarte' },
    { value: '+1',   label: 'pt por cada $100 que gastás' },
    { value: '$1',   label: 'de descuento por cada 10 pts canjeados' },
  ];
}
