import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicProduct } from '../../core/models/public-product.model';
import { PublicProductsService } from '../../core/services/public-products.service';
import { ProductGalleryComponent } from './components/product-gallery.component';
import { ShippingCalculatorComponent } from './components/shipping-calculator.component';
import { ProductTabsComponent } from './components/product-tabs.component';
import { AssetUrlPipe } from '../../shared/pipes/asset-url.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    AssetUrlPipe,
    ProductGalleryComponent,
    ShippingCalculatorComponent,
    ProductTabsComponent,
  ],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private readonly route           = inject(ActivatedRoute);
  private readonly productsService = inject(PublicProductsService);

  protected readonly product         = signal<PublicProduct | null>(null);
  protected readonly relatedProducts = signal<PublicProduct[]>([]);
  protected readonly isLoading       = signal(true);
  protected readonly hasError        = signal(false);
  protected readonly qty             = signal(1);

  protected readonly loyaltyPts = computed(() =>
    this.product() ? Math.floor(this.product()!.price / 100) : 0
  );

  protected readonly breadcrumb = computed(() => {
    const p = this.product();
    if (!p) return [];
    const crumbs = ['Inicio'];
    if (p.categories.length > 0) crumbs.push(p.categories[0].name);
    if (p.categories.length > 1) crumbs.push(p.categories[1].name);
    crumbs.push(p.name);
    return crumbs;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.productsService.getProduct(id).subscribe({
      next: product => {
        this.product.set(product);
        this.isLoading.set(false);
        this.loadRelated(id);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private loadRelated(currentId: number): void {
    this.productsService.getFeatured(5).subscribe({
      next: products => this.relatedProducts.set(products.filter(p => p.id !== currentId).slice(0, 4)),
    });
  }

  protected decQty(): void { this.qty.update(v => Math.max(1, v - 1)); }
  protected incQty(): void { this.qty.update(v => Math.min(this.product()?.stock ?? 99, v + 1)); }

  protected formatPrice(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
    }).format(value);
  }

  protected stars(rating: number | null): number[] {
    const r = Math.round(rating ?? 0);
    return Array.from({ length: 5 }, (_, i) => i < r ? 1 : 0);
  }
}
