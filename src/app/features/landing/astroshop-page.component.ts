import { Component, inject } from '@angular/core';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';
import { BrandsSectionComponent } from '../home/components/brands-section.component';
import { HeroCarouselComponent } from '../home/components/hero-carousel.component';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-astroshop-page',
  standalone: true,
  imports: [LandingHeroComponent, BrandsSectionComponent, HeroCarouselComponent],
  templateUrl: './astroshop-page.component.html',
})
export class AstroshopPageComponent {
  protected readonly theme  = inject(ThemeService);
  protected readonly accent = BRAND_ACCENTS.shop;

  protected readonly banners = [
    '/Banners/BAADER.webp',
    '/Banners/NUEVO-SPRIT-EDX.webp',
    '/Banners/OPTOLONG-10_.webp',
    '/Banners/S30-PRO-_1_.webp',
    '/Banners/BANNER-5.webp',
  ];

  protected readonly categories = [
    { label: 'Telescopios' },
    { label: 'Binoculares' },
    { label: 'Astrofotografía' },
    { label: 'Accesorios' },
  ];
}
