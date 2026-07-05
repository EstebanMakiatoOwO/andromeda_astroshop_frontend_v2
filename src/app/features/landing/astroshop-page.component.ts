import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';

@Component({
  selector: 'app-astroshop-page',
  standalone: true,
  imports: [RouterLink, LandingHeroComponent],
  templateUrl: './astroshop-page.component.html',
})
export class AstroshopPageComponent {
  protected readonly accent = BRAND_ACCENTS.shop;
  protected readonly categories = [
    { label: 'Telescopios' },
    { label: 'Binoculares' },
    { label: 'Astrofotografía' },
    { label: 'Accesorios' },
  ];
}
