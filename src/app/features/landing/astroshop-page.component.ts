import { Component, inject } from '@angular/core';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';
import { BrandsSectionComponent } from '../home/components/brands-section.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-astroshop-page',
  standalone: true,
  imports: [LandingHeroComponent, BrandsSectionComponent],
  templateUrl: './astroshop-page.component.html',
})
export class AstroshopPageComponent {
  protected readonly theme  = inject(ThemeService);
  protected readonly accent = BRAND_ACCENTS.shop;
  protected readonly categories = [
    { label: 'Telescopios' },
    { label: 'Binoculares' },
    { label: 'Astrofotografía' },
    { label: 'Accesorios' },
  ];
}
