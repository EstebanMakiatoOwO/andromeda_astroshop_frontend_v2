import { Component } from '@angular/core';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [LogoComponent],
  template: `
    <footer class="border-t border-line bg-surface-2 mt-16">
      <div class="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-12 flex flex-col items-center gap-5 md:gap-6">
        <app-logo [size]="24" />
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-ink-3">
          <a href="#" class="hover:text-ink-2 transition-colors">Sobre nosotros</a>
          <a href="#" class="hover:text-ink-2 transition-colors">Guías de compra</a>
          <a href="#" class="hover:text-ink-2 transition-colors">Términos y condiciones</a>
          <a href="#" class="hover:text-ink-2 transition-colors">Privacidad</a>
          <a href="#" class="hover:text-ink-2 transition-colors">Contacto</a>
        </div>
        <p class="font-mono text-[11px] text-ink-3 text-center">
          // andromeda.shop · {{ year }} · envíos a todo el país
        </p>
      </div>
    </footer>
  `,
})
export class PublicFooterComponent {
  protected readonly year = new Date().getFullYear();
}
