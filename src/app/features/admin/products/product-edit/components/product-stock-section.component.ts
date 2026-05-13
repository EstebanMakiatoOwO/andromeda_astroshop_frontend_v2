import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-product-stock-section',
  standalone: true,
  templateUrl: './product-stock-section.component.html',
})
export class ProductStockSectionComponent {
  price               = input.required<number>();
  costPrice           = input.required<number>();
  stock               = input.required<number>();
  stockAlertThreshold = input.required<number>();
  isActive            = input.required<boolean>();
  isCatalog           = input.required<boolean>();

  priceChange               = output<number>();
  costPriceChange           = output<number>();
  stockChange               = output<number>();
  stockAlertThresholdChange = output<number>();
  isActiveChange            = output<boolean>();
  isCatalogChange           = output<boolean>();
}
