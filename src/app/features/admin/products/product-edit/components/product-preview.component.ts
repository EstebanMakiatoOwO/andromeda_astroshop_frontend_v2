import { Component, input } from '@angular/core';
import { ars, stockBadgeClass, stockLabel } from '../../products.helpers';
import { AssetUrlPipe } from '../../../../../shared/pipes/asset-url.pipe';

@Component({
  selector: 'app-product-preview',
  standalone: true,
  imports: [AssetUrlPipe],
  templateUrl: './product-preview.component.html',
})
export class ProductPreviewComponent {
  name             = input.required<string>();
  shortDescription = input.required<string>();
  price            = input.required<number>();
  stock            = input.required<number>();
  isCatalog        = input.required<boolean>();
  images           = input.required<string[]>();

  protected ars            = ars;
  protected stockBadgeClass = stockBadgeClass;
  protected stockLabel     = stockLabel;

  protected get coverUrl(): string | null {
    return this.images()[0] ?? null;
  }
}
