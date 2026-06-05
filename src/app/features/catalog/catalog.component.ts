import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, of, switchMap } from 'rxjs';
import { PublicCategory } from '../../core/models/public-category.model';
import { CatalogFilters, CatalogPage, DEFAULT_FILTERS } from '../../core/models/catalog.model';
import { PublicProductsService } from '../../core/services/public-products.service';
import { PublicCategoriesService } from '../../core/services/public-categories.service';
import { CartService } from '../../core/services/cart.service';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { CatalogFiltersComponent } from './components/catalog-filters.component';

const POPULAR_SEARCHES_FALLBACK = [
  'NexStar 6SE', 'Dobsoniano 8"', 'Plössl 25mm', 'Bushnell 10×50', 'Filtro lunar',
];

const SORT_OPTIONS: { value: CatalogFilters['sortBy']; label: string }[] = [
  { value: 'relevance',  label: 'Ordenar: relevancia' },
  { value: 'price_asc',  label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'rating',     label: 'Mejor puntuados' },
];

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, CatalogFiltersComponent],
  templateUrl: './catalog.component.html',
})
export class CatalogComponent implements OnInit {
  private readonly productsService   = inject(PublicProductsService);
  private readonly categoriesService = inject(PublicCategoriesService);
  private readonly route             = inject(ActivatedRoute);
  private readonly router            = inject(Router);
  private readonly destroyRef        = inject(DestroyRef);
  protected readonly cart            = inject(CartService);

  protected readonly categories    = signal<PublicCategory[]>([]);
  protected readonly result        = signal<CatalogPage | null>(null);
  protected readonly loading       = signal(true);
  protected readonly error         = signal(false);
  protected readonly filters       = signal<CatalogFilters>({ ...DEFAULT_FILTERS });
  protected readonly drawerOpen    = signal(false);
  protected readonly searchInput   = signal('');
  protected readonly popularSearches = signal<string[]>(POPULAR_SEARCHES_FALLBACK);

  protected readonly PAGE_SIZE     = 16;
  protected readonly POPULAR       = this.popularSearches;
  protected readonly SORT_OPTIONS  = SORT_OPTIONS;
  protected readonly DEFAULT_FILTERS = DEFAULT_FILTERS;

  private readonly fetchSubject = new Subject<CatalogFilters>();

  ngOnInit(): void {
    this.categoriesService.getTree().subscribe(cats => this.categories.set(cats));

    this.productsService.getPopularSearches(8).pipe(
      catchError(() => of(POPULAR_SEARCHES_FALLBACK)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(terms => { if (terms.length) this.popularSearches.set(terms); });

    const p = this.route.snapshot.queryParams;
    const initial = this.paramsToFilters(p);
    this.filters.set(initial);
    this.searchInput.set(initial.q);

    this.fetchSubject.pipe(
      debounceTime(300),
      switchMap(f => {
        this.loading.set(true);
        this.error.set(false);
        return this.productsService.catalog(f, this.PAGE_SIZE).pipe(
          catchError(() => { this.error.set(true); return of(null); })
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(r => {
      if (r) this.result.set(r);
      this.loading.set(false);
    });

    this.fetchSubject.next(initial);
  }

  protected onFiltersChange(f: CatalogFilters): void {
    this.filters.set(f);
    this.searchInput.set(f.q);
    this.drawerOpen.set(false);
    this.syncUrl(f);
    this.fetchSubject.next(f);
  }

  protected onSearch(): void {
    this.onFiltersChange({ ...this.filters(), q: this.searchInput(), page: 1 });
  }

  protected onSearchKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.onSearch();
  }

  protected onSortChange(e: Event): void {
    const sortBy = (e.target as HTMLSelectElement).value as CatalogFilters['sortBy'];
    this.onFiltersChange({ ...this.filters(), sortBy, page: 1 });
  }

  protected setPopular(q: string): void {
    this.searchInput.set(q);
    this.onFiltersChange({ ...this.filters(), q, page: 1 });
  }

  protected goToPage(page: number): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.onFiltersChange({ ...this.filters(), page });
  }

  protected removeChip(key: string, value?: unknown): void {
    const f = { ...this.filters(), page: 1 };
    switch (key) {
      case 'q':       f.q = '';                                               break;
      case 'cat':     f.categoryIds = f.categoryIds.filter(x => x !== value); break;
      case 'brand':   f.brandIds    = f.brandIds.filter(x => x !== value);    break;
      case 'inStock': f.inStock = false; break;
      case 'onOrder': f.onOrder = false; break;
      case 'price':   f.minPrice = null; f.maxPrice = null;                    break;
    }
    this.onFiltersChange(f);
  }

  protected readonly activeChips = computed(() => {
    const f      = this.filters();
    const facets = this.result()?.facets;
    const chips: { label: string; key: string; value?: unknown }[] = [];

    if (f.q) chips.push({ label: `"${f.q}"`, key: 'q' });

    for (const id of f.categoryIds) {
      const name = this.categories().find(c => c.id === id)?.name
        ?? this.categories().flatMap(c => c.children ?? []).find(c => c.id === id)?.name
        ?? `Categoría #${id}`;
      chips.push({ label: name, key: 'cat', value: id });
    }

    for (const id of f.brandIds) {
      const name = facets?.brands.find(b => b.id === id)?.name ?? `Marca #${id}`;
      chips.push({ label: name, key: 'brand', value: id });
    }

    if (f.inStock) chips.push({ label: 'En stock', key: 'inStock' });
    if (f.onOrder) chips.push({ label: 'A pedido', key: 'onOrder' });

    if (f.minPrice != null || f.maxPrice != null) {
      const fmt = (n: number) => n.toLocaleString('es-MX');
      const label = f.minPrice != null && f.maxPrice != null
        ? `$${fmt(f.minPrice)} – $${fmt(f.maxPrice)}`
        : f.minPrice != null ? `Desde $${fmt(f.minPrice)}`
        : `Hasta $${fmt(f.maxPrice!)}`;
      chips.push({ label, key: 'price' });
    }

    return chips;
  });

  protected readonly pages = computed(() => {
    const total = this.result()?.totalPages ?? 0;
    const cur   = this.filters().page;
    const arr: (number | '...')[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= cur - 2 && i <= cur + 2)) {
        arr.push(i);
      } else if (arr[arr.length - 1] !== '...') {
        arr.push('...');
      }
    }
    return arr;
  });

  protected readonly skeletons = Array.from({ length: 16 });

  private syncUrl(f: CatalogFilters): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.filtersToParams(f),
      replaceUrl: true,
    });
  }

  private filtersToParams(f: CatalogFilters): Params {
    const p: Params = {};
    if (f.q)                      p['q']        = f.q;
    if (f.categoryIds.length)     p['cat']      = f.categoryIds.join(',');
    if (f.brandIds.length)        p['brand']    = f.brandIds.join(',');
    if (f.inStock)                p['inStock']  = '1';
    if (f.onOrder)                p['onOrder']  = '1';
    if (f.minPrice != null)       p['minPrice'] = f.minPrice;
    if (f.maxPrice != null)       p['maxPrice'] = f.maxPrice;
    if (f.sortBy !== 'relevance') p['sort']     = f.sortBy;
    if (f.page > 1)               p['page']     = f.page;
    return p;
  }

  private paramsToFilters(p: Params): CatalogFilters {
    return {
      q:           p['q'] ?? '',
      categoryIds: p['cat']   ? String(p['cat']).split(',').map(Number)   : [],
      brandIds:    p['brand'] ? String(p['brand']).split(',').map(Number) : [],
      inStock:     p['inStock']  === '1',
      onOrder:     p['onOrder']  === '1',
      minPrice:    p['minPrice'] ? Number(p['minPrice']) : null,
      maxPrice:    p['maxPrice'] ? Number(p['maxPrice']) : null,
      sortBy:      (p['sort'] ?? 'relevance') as CatalogFilters['sortBy'],
      page:        p['page'] ? Number(p['page']) : 1,
    };
  }
}
