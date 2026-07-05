import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';

@Component({
  selector: 'app-astroturismo-page',
  standalone: true,
  imports: [RouterLink, LandingHeroComponent],
  templateUrl: './astroturismo-page.component.html',
})
export class AstroturismoPageComponent {
  protected readonly accent = BRAND_ACCENTS.turismo;
  protected readonly experiences = [
    { icon: '🌙', title: 'Noches de observación',   desc: 'Sesiones guiadas bajo cielos oscuros con telescopios profesionales.' },
    { icon: '🏕️', title: 'Campamentos astronómicos', desc: 'Experiencias de 1 o más noches en destinos de cielo oscuro certificados.' },
    { icon: '📸', title: 'Astrofotografía',           desc: 'Talleres prácticos para capturar galaxias, nebulosas y planetas.' },
  ];
}
