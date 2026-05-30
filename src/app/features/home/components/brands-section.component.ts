import { Component, computed, input } from '@angular/core';
import { Brand } from '../../../core/models/brand.model';
import { AssetUrlPipe } from '../../../shared/pipes/asset-url.pipe';

const FALLBACK_BRANDS: Brand[] = [
  'Vaonis', 'Dwarf Lab', 'Sky-Watcher', 'Lunt Solar Systems', 'DayStar',
  'PlaneWave Instruments', 'Astro-Physics', 'Starizona', 'PrimaLuce Lab',
  'TeleVue', 'Baader Planetarium', 'Takahashi', 'William Optics', 'iOptron',
  'Explore Scientific', 'Askar', 'Celestron', 'ZWO', 'Antlia', 'Optolong',
  'ToupTek', 'Player One Astronomy', 'SharpStar', 'Losmandy', 'Software Bisque',
].map((name, i) => ({ id: -(i + 1), name, description: '', logoUrl: null }));

@Component({
  selector: 'app-brands-section',
  standalone: true,
  imports: [AssetUrlPipe],
  templateUrl: './brands-section.component.html',
})
export class BrandsSectionComponent {
  brands = input<Brand[]>([]);

  protected readonly track = computed<Brand[]>(() => {
    const list = this.brands().length ? this.brands() : FALLBACK_BRANDS;
    return [...list, ...list, ...list, ...list];
  });
}
