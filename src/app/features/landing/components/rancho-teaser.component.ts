import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

@Component({
  selector: 'app-rancho-teaser',
  standalone: true,
  imports: [RouterLink, RevealDirective, TiltDirective],
  template: `
    <div appReveal appTilt
         class="rounded-2xl border border-line bg-surface-2 overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_1.3fr]
                transition-all duration-300 hover:shadow-lg hover:border-accent">
      <div class="h-44 md:h-auto flex items-center justify-center p-6 bg-surface-3">
        <img [src]="theme.isDark() ? '/RanchoLaConcepcion/rancho_logo.webp' : '/RanchoLaConcepcion/rancho_logo_black.webp'"
             alt="Rancho La Concepción"
             width="627" height="226"
             class="max-w-full max-h-full object-contain"
             loading="lazy" />
      </div>
      <div class="p-6 md:p-7 flex flex-col gap-2 justify-center">
        <p class="text-xs font-mono text-accent uppercase tracking-widest">// colaboración</p>
        <h2 class="text-lg md:text-xl font-bold text-ink-1">Expediciones astrofotográficas en Rancho La Concepción</h2>
        <p class="text-sm text-ink-3 leading-relaxed">
          De junio a septiembre, en el primer alojamiento DarkSky Approved de México. Con la Experiencia Andrómeda
          obtienes 20% de descuento desde la segunda noche.
        </p>
        <a routerLink="/rancho" class="inline-flex items-center gap-1 text-xs text-accent font-medium w-fit mt-1 hover:underline">
          Conoce la colaboración &rarr;
        </a>
      </div>
    </div>
  `,
})
export class RanchoTeaserComponent {
  protected readonly theme = inject(ThemeService);
}
