import { Component, inject } from '@angular/core';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-astroturismo-page',
  standalone: true,
  imports: [LandingHeroComponent],
  templateUrl: './astroturismo-page.component.html',
})
export class AstroturismoPageComponent {
  protected readonly theme  = inject(ThemeService);
  protected readonly accent = BRAND_ACCENTS.turismo;
  protected readonly experiences = [
    { icon: '🌙', title: 'Noches de observación',   desc: 'Sesiones guiadas bajo cielos oscuros con telescopios profesionales.' },
    { icon: '🏕️', title: 'Campamentos astronómicos', desc: 'Experiencias de 1 o más noches en destinos de cielos oscuros.' },
    { icon: '📸', title: 'Astrofotografía',           desc: 'Talleres prácticos para capturar galaxias, nebulosas y planetas.' },
    { icon: '🪐', title: 'Charlas y conferencias',    desc: 'Presentaciones educativas sobre astronomía y ciencia del espacio.' },
    { icon: '🛶', title: 'Astroturismo de aventura', desc: 'Actividades al aire libre combinando astronomía y naturaleza.' },
    { icon: '👶', title: 'Experimentos para los mas chicos', desc: 'Actividades educativas diseñadas para pequeños interesados en astronomía.' },
  ];
}
