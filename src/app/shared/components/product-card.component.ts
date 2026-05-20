import { Component, input } from '@angular/core';
import { PublicProduct } from '../../core/models/public-product.model';
import { AssetUrlPipe } from '../pipes/asset-url.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [AssetUrlPipe],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  product = input.required<PublicProduct>();

  protected formatPrice(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
