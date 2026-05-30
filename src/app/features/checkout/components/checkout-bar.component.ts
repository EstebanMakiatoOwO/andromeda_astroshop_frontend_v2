import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

interface Step { n: number; label: string; }

@Component({
  selector: 'app-checkout-bar',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  templateUrl: './checkout-bar.component.html',
})
export class CheckoutBarComponent {
  step = input<number | null>(null);

  protected readonly steps: Step[] = [
    { n: 1, label: 'Carrito' },
    { n: 2, label: 'Envío' },
    { n: 3, label: 'Pago · Mercado Pago' },
    { n: 4, label: 'Confirmación' },
  ];

  protected stateOf(n: number): 'done' | 'active' | 'next' {
    const s = this.step();
    if (s === null) return 'next';
    return n < s ? 'done' : n === s ? 'active' : 'next';
  }
}
