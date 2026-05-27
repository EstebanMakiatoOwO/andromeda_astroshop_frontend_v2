import { Component, computed, input, signal } from '@angular/core';
import { PublicProduct } from '../../../core/models/public-product.model';

@Component({
  selector: 'app-product-tabs',
  standalone: true,
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

  // Split long description on bullet char → [intro, bullet1, bullet2, ...]
  protected readonly descParts = computed(() => {
    const text = this.product().longDescription ?? '';
    return text.split('•').map(s => s.replace(/ /g, ' ').trim()).filter(Boolean);
  });

  protected get reviewLabel(): string {
    const n = this.product().reviewCount;
    return n ? `Reseñas · ${n}` : 'Reseñas';
  }
}
