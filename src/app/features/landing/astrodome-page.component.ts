import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';

@Component({
  selector: 'app-astrodome-page',
  standalone: true,
  imports: [RouterLink, LandingHeroComponent],
  templateUrl: './astrodome-page.component.html',
})
export class AstrodomePageComponent {
  protected readonly accent = BRAND_ACCENTS.dome;
  protected readonly uses = [
    { name: 'Escuelas y universidades' },
    { name: 'Museos y centros culturales' },
    { name: 'Festivales y eventos' },
    { name: 'Empresas y corporativos' },
  ];
}
