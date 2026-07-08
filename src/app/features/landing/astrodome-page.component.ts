import { Component, inject } from '@angular/core';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-astrodome-page',
  standalone: true,
  imports: [LandingHeroComponent],
  templateUrl: './astrodome-page.component.html',
})
export class AstrodomePageComponent {
  protected readonly theme  = inject(ThemeService);
  protected readonly accent = BRAND_ACCENTS.dome;
  protected readonly uses = [
    { name: 'Escuelas y universidades' },
    { name: 'Museos y centros culturales' },
    { name: 'Festivales y eventos' },
    { name: 'Empresas y corporativos' },
  ];
}
