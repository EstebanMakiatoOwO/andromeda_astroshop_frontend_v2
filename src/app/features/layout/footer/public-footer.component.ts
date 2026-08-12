import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-line bg-surface-2 mt-16">
      <div class="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-12 flex flex-col items-center gap-5 md:gap-6">
        <img [src]="theme.isDark()
                      ? '/Astroshop/IMAGOTIPO-AndromedaSHOP-BLANCO.webp'
                      : '/Astroshop/IMAGOTIPO-AndromedaSHOP-COLOR.webp'"
             alt="Andromeda AstroShop"
             width="200" height="200" loading="lazy"
             style="height:200px; width:auto; object-fit:contain" />
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-ink-3">
          <a routerLink="/conocenos"  class="hover:text-ink-2 transition-colors">Sobre nosotros</a>
          <a routerLink="/guias"      class="hover:text-ink-2 transition-colors">Guías de compra</a>
          <a routerLink="/terminos"   class="hover:text-ink-2 transition-colors">Términos y condiciones</a>
          <a routerLink="/privacidad" class="hover:text-ink-2 transition-colors">Privacidad</a>
          <a routerLink="/contacto"   class="hover:text-ink-2 transition-colors">Contacto</a>
        </div>
        <p class="font-mono text-[11px] text-ink-3 text-center">
          // andromeda.shop · {{ year }} · envíos a todo el país
        </p>
      </div>
    </footer>
  `,
})
export class PublicFooterComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly year  = new Date().getFullYear();
}
