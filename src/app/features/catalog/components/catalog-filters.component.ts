import { Component, DestroyRef, inject, input, OnChanges, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { PublicCategory } from '../../../core/models/public-category.model';
import { CatalogFacets, CatalogFilters, DEFAULT_FILTERS } from '../../../core/models/catalog.model';

@Component({
  selector: 'app-catalog-filters',
  standalone: true,
  imports: [],
  templateUrl: './catalog-filters.component.html',
})
export class CatalogFiltersComponent implements OnChanges {
  readonly filters    = input.required<CatalogFilters>();
  readonly categories = input<PublicCategory[]>([]);
  readonly facets     = input<CatalogFacets | null>(null);

  readonly filtersChange = output<CatalogFilters>();
  readonly close         = output<void>();

  private readonly destroyRef = inject(DestroyRef);

  protected localMinPrice = signal('');
  protected localMaxPrice = signal('');

  private readonly priceSubject = new Subject<void>();

  constructor() {
    this.priceSubject.pipe(
      debounceTime(700),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      const min = this.localMinPrice() ? Number(this.localMinPrice()) : null;
      const max = this.localMaxPrice() ? Number(this.localMaxPrice()) : null;
      this.emit({ minPrice: min, maxPrice: max, page: 1 });
    });
  }

  ngOnChanges(): void {
    const f = this.filters();
    this.localMinPrice.set(f.minPrice != null ? String(f.minPrice) : '');
    this.localMaxPrice.set(f.maxPrice != null ? String(f.maxPrice) : '');
  }

  protected toggleCategory(id: number): void {
    const ids = this.filters().categoryIds;
    this.emit({
      categoryIds: ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id],
      page: 1,
    });
  }

  protected toggleBrand(id: number): void {
    const ids = this.filters().brandIds;
    this.emit({
      brandIds: ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id],
      page: 1,
    });
  }

  protected setInStock(e: Event): void {
    this.emit({ inStock: (e.target as HTMLInputElement).checked, page: 1 });
  }

  protected setOnOrder(e: Event): void {
    this.emit({ onOrder: (e.target as HTMLInputElement).checked, page: 1 });
  }

  protected onMinPriceInput(e: Event): void {
    this.localMinPrice.set((e.target as HTMLInputElement).value);
    this.priceSubject.next();
  }

  protected onMaxPriceInput(e: Event): void {
    this.localMaxPrice.set((e.target as HTMLInputElement).value);
    this.priceSubject.next();
  }

  protected clearAll(): void {
    this.filtersChange.emit({ ...DEFAULT_FILTERS });
  }

  private emit(partial: Partial<CatalogFilters>): void {
    this.filtersChange.emit({ ...this.filters(), ...partial });
  }
}
