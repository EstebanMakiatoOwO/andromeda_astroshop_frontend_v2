import { Component, inject, signal } from '@angular/core';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';
import { ThemeService } from '../../core/services/theme.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-rancho-colaboracion',
  standalone: true,
  imports: [LandingHeroComponent, RevealDirective],
  templateUrl: './rancho-colaboracion.component.html',
})
export class RanchoColaboracionComponent {
  protected readonly theme  = inject(ThemeService);
  protected readonly accent = BRAND_ACCENTS.turismo;

  protected readonly codigo = 'ANDROMEDA20';
  protected readonly copiado = signal(false);

  /** WhatsApp de César Guerrero (reservas del rancho), formato wa.me sin "+".
   *  Si se pone en null se oculta el botón de reservar. */
  protected readonly ranchoReservasWhatsapp: string | null = '5216461882271';
  protected readonly ranchoTelefonoVisible = '+52 1 646 188 2271';

  protected readonly expedicionesUrl =
    'https://wa.me/524427151880?text=' +
    encodeURIComponent('Hola, quiero saber las fechas de las expediciones astrofotográficas 2027 en Rancho La Concepción.');

  protected get reservaUrl(): string {
    return `https://wa.me/${this.ranchoReservasWhatsapp}?text=` +
      encodeURIComponent(`Hola César, vengo de parte de Andrómeda AstroShop. Quiero reservar en Rancho La Concepción con el código ${this.codigo} (Experiencia Andrómeda).`);
  }

  protected readonly beneficios = [
    { title: '20% de descuento', desc: 'A partir de la segunda noche de hospedaje con el código ANDROMEDA20 (normalmente es 15% en la segunda y tercera noche).' },
    { title: 'Acceso anticipado a eventos', desc: 'Preventa exclusiva para noches de observación, lunadas, encuentros de astronomía, talleres y otros eventos con cupo limitado del rancho.' },
    { title: 'Vino de bienvenida', desc: 'Una botella de vino de cortesía en estancias de tres noches o más reservadas con la Experiencia Andrómeda.' },
  ];

  protected readonly destacados = [
    { title: 'Observa el cielo', desc: 'Telescopios y binoculares disponibles en el rancho.' },
    { title: 'Oscuridad natural', desc: 'Vía Láctea visible casi todo el año, lejos de la contaminación lumínica.' },
    { title: 'Iluminación responsable', desc: 'Reconocido como DarkSky Approved Lodging por DarkSky International.' },
  ];

  protected async copiarCodigo(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.codigo);
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el código sigue visible para copiarlo a mano.
    }
  }
}
