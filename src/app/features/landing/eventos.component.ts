import { Component, signal } from '@angular/core';
import { LandingHeroComponent, BRAND_ACCENTS } from './components/landing-hero.component';

interface Evento {
  day: string;
  mes: string;
  tipo: string;
  title: string;
  place: string;
  time: string;
  price: string;
  spots: string;
  accent: string;
}

const FILTROS = ['Todos', 'Observación', 'Talleres', 'Campamentos', 'Gratuitos'] as const;

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [LandingHeroComponent],
  templateUrl: './eventos.component.html',
})
export class EventosComponent {
  protected readonly filtros   = FILTROS;
  protected readonly filtroActivo = signal<string>('Todos');

  protected readonly eventos: Evento[] = [
    { day: '18', mes: 'JUL', tipo: 'Observación',  title: 'Noche de observación · Alta Gracia',  place: 'Observatorio Bosque Alegre', time: '20:00 – 23:30', price: '$ 12.000', spots: '8 lugares',  accent: BRAND_ACCENTS.turismo },
    { day: '26', mes: 'JUL', tipo: 'Talleres',      title: 'Taller de astrofotografía inicial',   place: 'Local Andromeda · Córdoba',  time: '18:00 – 21:00', price: '$ 18.000', spots: '5 lugares',  accent: BRAND_ACCENTS.base },
    { day: '03', mes: 'AGO', tipo: 'Campamentos',   title: 'Campamento astronómico de invierno',  place: 'Sierras Grandes · 2 noches', time: 'sáb 15h – dom 12h', price: '$ 65.000', spots: '12 lugares', accent: BRAND_ACCENTS.turismo },
    { day: '10', mes: 'AGO', tipo: 'Gratuitos',     title: 'AstroDome en la plaza · observación pública', place: 'Plaza San Martín', time: '19:00 – 22:00', price: 'Gratis', spots: 'sin reserva', accent: BRAND_ACCENTS.dome },
  ];

  protected get eventosFiltrados(): Evento[] {
    const f = this.filtroActivo();
    return f === 'Todos' ? this.eventos : this.eventos.filter(e => e.tipo === f);
  }

  protected readonly turismo = BRAND_ACCENTS.turismo;
}
