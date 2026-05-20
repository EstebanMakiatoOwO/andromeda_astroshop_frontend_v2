import { Component, input } from '@angular/core';
import { PublicProduct } from '../../../core/models/public-product.model';
import { ProductCardComponent } from '../../../shared/components/product-card.component';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './featured-products.component.html',
})
export class FeaturedProductsComponent {
  products  = input<PublicProduct[]>([]);
  isLoading = input(false);

  protected readonly skeletons = Array(8).fill(null);
}
