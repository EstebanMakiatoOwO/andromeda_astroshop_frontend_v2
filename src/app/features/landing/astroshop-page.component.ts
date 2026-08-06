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
    { desktop: '/Banners/BAADER.webp',          mobile: '/Banners/BAADER_mobile.webp' },
    { desktop: '/Banners/NUEVO-SPRIT-EDX.webp', mobile: '/Banners/NUEVO-SPRIT-EDX_mobile.webp' },
    { desktop: '/Banners/OPTOLONG-10_.webp',    mobile: '/Banners/OPTOLONG-10_mobile.webp' },
    { desktop: '/Banners/S30-PRO-_1_.webp',     mobile: '/Banners/S30-PRO-_1_mobile.webp' },
    { desktop: '/Banners/BANNER-5.webp',         mobile: '/Banners/BANNER-5_mobile.webp' },
  ];

  protected readonly categories = [
    { label: 'Telescopios' },
    { label: 'Binoculares' },
    { label: 'Astrofotografía' },
    { label: 'Accesorios' },
  ];
}
