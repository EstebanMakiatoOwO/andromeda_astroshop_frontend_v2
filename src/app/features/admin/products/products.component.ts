import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductsService } from '../../../core/services/products.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { AdminProduct } from '../../../core/models/product.model';
import { ProductsFiltersComponent } from './components/products-filters.component';
import { ProductsTableComponent } from './components/products-table.component';
import { ProductsPaginationComponent } from './components/products-pagination.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ProductsFiltersComponent, ProductsTableComponent, ProductsPaginationComponent],
  templateUrl: './products.component.html',
})
export class ProductsComponent {
  private readonly svc        = inject(ProductsService);
  private readonly bc         = inject(BreadcrumbService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly PAGE_SIZE = 20;

  protected readonly page               = signal(0);
  protected readonly searchTerm         = signal('');
  protected readonly statusFilter       = signal('');
  protected readonly availabilityFilter = signal('');
  protected readonly stockFilter        = signal('');
  protected readonly products           = signal<AdminProduct[]>([]);
  protected readonly totalPages         = signal(0);
  protected readonly totalElems         = signal(0);
  protected readonly isLoading          = signal(true);
  protected readonly selectedIds        = signal<Set<number>>(new Set());

  protected readonly pageNumbers = computed(() => {
    const total   = this.totalPages();
    const current = this.page();
    const pages: number[] = [];
    for (let i = Math.max(0, current - 2); i <= Math.min(total - 1, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  });

  private readonly searchInput$ = new Subject<string>();

  constructor() {
    this.bc.set([{ label: 'Productos' }]);

    this.searchInput$.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(q => {
      this.searchTerm.set(q);
      this.page.set(0);
    });

    effect(() => {
      const page         = this.page();
      const q            = this.searchTerm();
      const status       = this.statusFilter();
      const availability = this.availabilityFilter();
      const stock        = this.stockFilter();
      this.loadProducts(page, q, status, availability, stock);
    });
  }

  protected onSearch(value: string): void {
    this.searchInput$.next(value);
  }

  protected onStatusChange(value: string): void {
    this.statusFilter.set(value);
    this.page.set(0);
  }

  protected onAvailabilityChange(value: string): void {
    this.availabilityFilter.set(value);
    this.page.set(0);
  }

  protected onStockChange(value: string): void {
    this.stockFilter.set(value);
    this.page.set(0);
  }

  protected onSelectionChange(ids: Set<number>): void {
    this.selectedIds.set(new Set(ids));
  }

  protected setPage(p: number): void {
    this.page.set(p);
  }

  private loadProducts(
    page: number, q: string,
    status: string, availability: string, stock: string,
  ): void {
    this.isLoading.set(true);
    this.svc.getProducts({
      page,
      size:         this.PAGE_SIZE,
      q:            q || undefined,
      status:       status || undefined,
      availability: availability || undefined,
      stock:        stock || undefined,
    }).subscribe({
      next: result => {
        this.products.set(result.content);
        this.totalPages.set(result.totalPages);
        this.totalElems.set(result.totalElements);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
