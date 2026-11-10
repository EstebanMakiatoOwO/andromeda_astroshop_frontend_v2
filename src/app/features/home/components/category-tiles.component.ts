import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AssetUrlPipe } from '../../../shared/pipes/asset-url.pipe';

export interface CategoryTile {
  id: number;
  name: string;
  count: number;
  image: string | null;
}

/** Tarjetas de categoría con foto (la de su primer producto) y número de productos. */
@Component({
  selector: 'app-category-tiles',
  standalone: true,
  imports: [RouterLink, AssetUrlPipe],
  templateUrl: './category-tiles.component.html',
})
export class CategoryTilesComponent {
  tiles = input.required<CategoryTile[]>();
}
