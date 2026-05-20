import { Component, input } from '@angular/core';
import { Brand } from '../../../core/models/brand.model';
import { AssetUrlPipe } from '../../../shared/pipes/asset-url.pipe';

@Component({
  selector: 'app-brands-section',
  standalone: true,
  imports: [AssetUrlPipe],
  templateUrl: './brands-section.component.html',
})
export class BrandsSectionComponent {
  brands = input<Brand[]>([]);
}
