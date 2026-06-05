import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, catchError, of } from 'rxjs';
import { PublicCategory } from '../../../core/models/public-category.model';
import { PublicProduct } from '../../../core/models/public-product.model';
import { PublicCategoriesService } from '../../../core/services/public-categories.service';
import { PublicProductsService } from '../../../core/services/public-products.service';
import { ProductCarouselComponent } from './product-carousel.component';

@Component({
  selector: 'app-category-tabs-section',
  standalone: true,
  imports: [ProductCarouselComponent],
  templateUrl: './category-tabs-section.component.html',
})
export class CategoryTabsSectionComponent implements OnInit {
  private readonly categoriesService = inject(PublicCategoriesService);
  private readonly productsService   = inject(PublicProductsService);
  private readonly destroyRef        = inject(DestroyRef);

  protected readonly categories  = signal<PublicCategory[]>([]);
  protected readonly products    = signal<PublicProduct[]>([]);
  protected readonly selectedId  = signal<number | null>(null);
  protected readonly loading     = signal(true);

  private readonly select$ = new Subject<number>();

  ngOnInit(): void {
    this.select$.pipe(
      switchMap(id => {
        this.loading.set(true);
        this.products.set([]);
        return this.productsService.getByCategory(id, 12).pipe(
          catchError(() => of([]))
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(prods => {
      this.products.set(prods);
      this.loading.set(false);
    });

    this.categoriesService.getCategories().pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(cats => {
      const topLevel = cats.filter(c => c.parentId == null && c.isActive);
      this.categories.set(topLevel);
      if (topLevel.length > 0) {
        this.selectCategory(topLevel[0].id);
      }
    });
  }

  protected selectCategory(id: number): void {
    this.selectedId.set(id);
    this.select$.next(id);
  }

  protected selectedName(): string {
    return this.categories().find(c => c.id === this.selectedId())?.name ?? '';
  }
}
