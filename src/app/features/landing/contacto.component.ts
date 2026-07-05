import { Component, signal } from '@angular/core';
import { LandingHeroComponent } from './components/landing-hero.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [LandingHeroComponent],
  templateUrl: './contacto.component.html',
})
export class ContactoComponent {
  protected readonly temas = ['AstroShop', 'AstroTurismo', 'AstroDome', 'Prensa', 'Otro'];
  protected readonly temaActivo = signal('AstroTurismo');

  protected readonly datos = [
    { ico: '💬', tipo: 'WhatsApp',  valor: '+54 9 351 234-5678',    sub: 'respuesta más rápida' },
    { ico: '✉️', tipo: 'Email',     valor: 'hola@andromeda.com.ar', sub: '24h hábiles' },
    { ico: '📍', tipo: 'Local',     valor: 'Av. Colón 1234, Córdoba', sub: 'lun a sáb · 10-19h' },
    { ico: '📞', tipo: 'Teléfono', valor: '+54 351 234-5678',        sub: 'horario comercial' },
  ];
}
