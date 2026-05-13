import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-product-info-section',
  standalone: true,
  templateUrl: './product-info-section.component.html',
})
export class ProductInfoSectionComponent {
  name             = input.required<string>();
  sku              = input.required<string>();
  barcode          = input.required<string>();
  shortDescription = input.required<string>();
  longDescription  = input.required<string>();

  nameChange             = output<string>();
  skuChange              = output<string>();
  barcodeChange          = output<string>();
  shortDescriptionChange = output<string>();
  longDescriptionChange  = output<string>();
}
