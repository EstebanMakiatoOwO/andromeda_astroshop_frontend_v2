import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicProduct } from '../../../core/models/public-product.model';
import { ProductCardComponent } from '../../../shared/components/product-card.component';

/** Cuadrícula de productos de la portada (en lugar de carruseles con pocos productos). */
@Component({
  selector: 'app-featured-grid',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './featured-grid.component.html',
})
export class FeaturedGridComponent {
  title    = input.required<string>();
  subtitle = input<string>('');
  products = input.required<PublicProduct[]>();
  total    = input<number>(0);
  loading  = input<boolean>(false);
}
