import { Component, signal } from '@angular/core';
import { LandingHeroComponent } from './components/landing-hero.component';
import { LandingSectionHeadComponent } from './components/landing-section-head.component';

interface GaleriaShot {
  height: number;
  cat: string;
  by: string;
  title: string;
}

const CATS = ['Todas', 'Planetaria', 'Cielo profundo', 'Luna', 'Eventos', 'Paisaje nocturno'] as const;

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [LandingHeroComponent, LandingSectionHeadComponent],
  templateUrl: './galeria.component.html',
})
export class GaleriaComponent {
  protected readonly cats = CATS;
  protected readonly catActiva = signal<string>('Todas');

  protected readonly shots: GaleriaShot[] = [
    { height: 240, cat: 'Cielo profundo',    by: '@martin.avalos', title: 'Nebulosa de Carina' },
    { height: 180, cat: 'Luna',              by: '@luciaf',        title: 'Luna llena · 400mm' },
    { height: 300, cat: 'Planetaria',        by: '@diego.r',       title: 'Saturno y sus anillos' },
    { height: 200, cat: 'Paisaje nocturno',  by: '@sofi.led',      title: 'Vía Láctea sobre las sierras' },
    { height: 260, cat: 'Eventos',           by: '@andromeda',     title: 'Noche de observación · Alta Gracia' },
    { height: 190, cat: 'Cielo profundo',    by: '@invitado',      title: 'Galaxia de Andrómeda' },
    { height: 230, cat: 'Planetaria',        by: '@martin.avalos', title: 'Júpiter y lunas galileanas' },
    { height: 170, cat: 'Luna',              by: '@nicoastro',     title: 'Cráter Copérnico' },
    { height: 280, cat: 'Paisaje nocturno',  by: '@luciaf',        title: 'Campamento astronómico' },
    { height: 210, cat: 'Eventos',           by: '@andromeda',     title: 'Taller de astrofoto' },
    { height: 250, cat: 'Cielo profundo',    by: '@diego.r',       title: 'Nebulosa de Orión' },
    { height: 185, cat: 'Planetaria',        by: '@sofi.led',      title: 'Marte en oposición' },
  ];

  protected readonly today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

  protected get filteredShots(): GaleriaShot[] {
    const cat = this.catActiva();
    return cat === 'Todas' ? this.shots : this.shots.filter(s => s.cat === cat);
  }
}
