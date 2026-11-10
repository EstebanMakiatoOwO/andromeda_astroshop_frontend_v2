import { Component, computed, input, signal } from '@angular/core';
import { PublicProduct } from '../../../core/models/public-product.model';
import { ProductReviewsComponent } from './product-reviews.component';
import { RichDescriptionDirective } from '../../../shared/directives/rich-description.directive';

@Component({
  selector: 'app-product-tabs',
  standalone: true,
  imports: [ProductReviewsComponent, RichDescriptionDirective],
  templateUrl: './product-tabs.component.html',
})
export class ProductTabsComponent {
  product = input.required<PublicProduct>();

  protected readonly tabs = [
    { id: 'desc',     label: 'Descripción' },
    { id: 'specs',    label: 'Especificaciones' },
    { id: 'reviews',  label: 'Reseñas' },
    { id: 'shipping', label: 'Envíos y devoluciones' },
  ];
  protected readonly activeTab = signal('desc');

  // Descripción en HTML (secciones <details> o plantilla .asd) ya filtrada por el backend;
  // RichDescriptionDirective la pinta y le da el comportamiento (pestañas, modales, zoom).
  protected readonly descHtml = computed(() => {
    const text = (this.product().longDescription ?? '').trim();
    return /<[a-z][\s\S]*>/i.test(text) ? text : null;
  });

  // Split long description on bullet char → [intro, bullet1, bullet2, ...]
  protected readonly descParts = computed(() => {
    const text = this.product().longDescription ?? '';
    return text.split('•').map(s => s.replace(/ /g, ' ').trim()).filter(Boolean);
  });

  protected readonly warrantyExclusions = [
    'El producto haya sido utilizado en condiciones diferentes a las normales.',
    'El producto NO haya sido operado conforme al instructivo.',
    'El producto haya sido dañado por mal uso, caídas o movimientos bruscos.',
    'El producto haya sido reparado o alterado por personas no autorizadas.',
  ];

  activateReviews(): void {
    this.activeTab.set('reviews');
  }

  protected get reviewLabel(): string {
    const n = this.product().reviewCount;
    return n ? `Reseñas · ${n}` : 'Reseñas';
  }
}
