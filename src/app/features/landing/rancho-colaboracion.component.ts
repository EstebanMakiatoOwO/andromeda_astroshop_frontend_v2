import { Component, inject } from '@angular/core';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-rancho-colaboracion',
  standalone: true,
  imports: [LandingHeroComponent],
  templateUrl: './rancho-colaboracion.component.html',
})
export class RanchoColaboracionComponent {
  protected readonly theme  = inject(ThemeService);
  protected readonly accent = BRAND_ACCENTS.turismo;

  protected readonly destacados = [
    { title: 'Observa el cielo', desc: 'Telescopios y binoculares de Andrómeda AstroShop disponibles durante tu estancia.' },
    { title: 'Oscuridad natural', desc: 'Vía Láctea visible casi todo el año, lejos de la contaminación lumínica.' },
    { title: 'Iluminación responsable', desc: 'El rancho está certificado bajo los estándares DarkSky.' },
  ];
}
