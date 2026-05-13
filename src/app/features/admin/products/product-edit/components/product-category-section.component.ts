import { Component, input, output } from '@angular/core';
import { ProductCategory } from '../../../../../core/models/product.model';

@Component({
  selector: 'app-product-category-section',
  standalone: true,
  templateUrl: './product-category-section.component.html',
})
export class ProductCategorySectionComponent {
  categories  = input.required<ProductCategory[]>();
  categoryIds = input.required<number[]>();
  brandId     = input.required<number | null>();

  categoryIdsChange = output<number[]>();
  brandIdChange     = output<number | null>();

  protected isSelected(id: number): boolean {
    return this.categoryIds().includes(id);
  }

  protected toggleCategory(id: number): void {
    const current = this.categoryIds();
    const next = current.includes(id)
      ? current.filter(c => c !== id)
      : [...current, id];
    this.categoryIdsChange.emit(next);
  }

  protected emitBrandId(value: string): void {
    this.brandIdChange.emit(value ? Number(value) : null);
  }
}
