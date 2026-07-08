import { Component, computed, signal } from '@angular/core';
import { LandingHeroComponent } from './components/landing-hero.component';

const EMAIL_MAP: Record<string, string> = {
  'AstroShop':    'andromeda.astroshop@gmail.com',
  'AstroTurismo': 'andromeda.astroturismo@gmail.com',
  'AstroDome':    'andromeda.astrodome@gmail.com',
  'Prensa':       'andromeda.astroshop@gmail.com',
  'Otro':         'andromeda.astroshop@gmail.com',
};

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [LandingHeroComponent],
  templateUrl: './contacto.component.html',
})
export class ContactoComponent {
  protected readonly temas      = ['AstroShop', 'AstroTurismo', 'AstroDome', 'Prensa', 'Otro'];
  protected readonly temaActivo = signal('AstroShop');

  protected readonly nombre  = signal('');
  protected readonly email   = signal('');
  protected readonly mensaje = signal('');

  protected readonly emailDestino = computed(() => EMAIL_MAP[this.temaActivo()]);

  protected readonly mailtoUrl = computed(() => {
    const to      = this.emailDestino();
    const subject = encodeURIComponent(`Contacto ${this.temaActivo()} — Andrómeda AstroShop`);
    const body    = encodeURIComponent(
      `Nombre: ${this.nombre() || '(no indicado)'}\nEmail: ${this.email() || '(no indicado)'}\n\n${this.mensaje()}`
    );
    return `mailto:${to}?subject=${subject}&body=${body}`;
  });

  protected readonly datos = [
    { ico: '💬', tipo: 'WhatsApp AstroShop',    valor: '+52 55 1267 2026',                  sub: 'respuesta rápida' },
    { ico: '💬', tipo: 'WhatsApp AstroDome',     valor: '+52 442 715 1880',                  sub: 'cotizaciones y eventos' },
    { ico: '✉️', tipo: 'AstroShop',             valor: 'andromeda.astroshop@gmail.com',     sub: '' },
    { ico: '✉️', tipo: 'AstroTurismo',          valor: 'andromeda.astroturismo@gmail.com',  sub: '' },
    { ico: '✉️', tipo: 'AstroDome',             valor: 'andromeda.astrodome@gmail.com',     sub: '' },
  ];
}
