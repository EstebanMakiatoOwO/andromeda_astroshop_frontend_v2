import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { StarFieldComponent } from '../../../shared/components/star-field.component';

interface HeroSlide {
  kicker: string;
  titleLine1: string;
  titleLine2: string;
  desc: string;
  cta1: string;
  cta2: string;
  bg: string;
  accent: string;
  dark: boolean;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [StarFieldComponent],
  templateUrl: './hero-carousel.component.html',
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  protected readonly slides: HeroSlide[] = [
    {
      kicker: '// catálogo 2026',
      titleLine1: 'Mirá el cielo',
      titleLine2: 'como nunca antes.',
      desc: 'Equipamiento profesional para amateurs serios. Telescopios, monturas y accesorios con envío a todo el país.',
      cta1: 'Ver telescopios',
      cta2: 'Guía: tu primer telescopio',
      bg: 'linear-gradient(180deg, var(--color-surface-2), var(--color-surface-1))',
      accent: 'var(--color-accent)',
      dark: false,
    },
    {
      kicker: '// liquidación de invierno',
      titleLine1: 'Hasta 30% off',
      titleLine2: 'en binoculares.',
      desc: 'Stock limitado · Bushnell, Celestron y Vixen seleccionados. Termina el domingo.',
      cta1: 'Ver ofertas',
      cta2: 'Cómo elegir binoculares',
      bg: 'linear-gradient(180deg, oklch(92% 0.06 70), var(--color-surface-1))',
      accent: 'oklch(50% 0.16 70)',
      dark: false,
    },
    {
      kicker: '// evento · 2026',
      titleLine1: 'Lluvia de meteoros',
      titleLine2: 'en el sur argentino.',
      desc: 'Equipate para la Eta Acuáridas. Kits de observación disponibles en catálogo.',
      cta1: 'Ver kits',
      cta2: 'Calendario astronómico',
      bg: 'linear-gradient(180deg, oklch(35% 0.08 270), oklch(20% 0.05 270))',
      accent: 'oklch(85% 0.12 280)',
      dark: true,
    },
  ];

  protected readonly current = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.current.update(i => (i + 1) % this.slides.length);
    }, 6000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  protected prev(): void {
    this.current.update(i => (i - 1 + this.slides.length) % this.slides.length);
  }

  protected next(): void {
    this.current.update(i => (i + 1) % this.slides.length);
  }

  protected goTo(i: number): void {
    this.current.set(i);
  }
}
