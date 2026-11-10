import { Component } from '@angular/core';

/** Franja de confianza bajo el banner: envío, pago, garantía y puntos. */
@Component({
  selector: 'app-store-highlights',
  standalone: true,
  templateUrl: './store-highlights.component.html',
})
export class StoreHighlightsComponent {
  protected readonly items = [
    { icon: 'truck',  title: 'Envío a todo México',     text: 'FedEx y DHL, cotizado al momento' },
    { icon: 'lock',   title: 'Pago seguro',             text: 'Con MercadoPago' },
    { icon: 'shield', title: 'Garantía de fábrica',     text: 'Marcas oficiales importadas de EE.UU.' },
    { icon: 'star',   title: 'Gana puntos',             text: 'Canjéalos en tus próximas compras' },
  ] as const;
}
