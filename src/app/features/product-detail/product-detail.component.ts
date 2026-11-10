import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicProduct } from '../../core/models/public-product.model';
import { PublicProductsService } from '../../core/services/public-products.service';
import { ReviewsService } from '../../core/services/reviews.service';
import { CurrencyService } from '../../core/services/currency.service';
import { CartService } from '../../core/services/cart.service';
import { PublicAuthService } from '../../core/services/public-auth.service';
import { apiErrorMessage } from '../../core/utils/api-error';
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
  private readonly router          = inject(Router);
  private readonly productsService = inject(PublicProductsService);
  private readonly reviewsService  = inject(ReviewsService);
  protected readonly currency      = inject(CurrencyService);
  protected readonly cartService   = inject(CartService);
  protected readonly auth          = inject(PublicAuthService);

  protected readonly adding     = signal(false);
  protected readonly added      = signal(false);
  protected readonly buyingNow  = signal(false);
  protected readonly cartError  = signal<string | null>(null);

  @ViewChild(ProductTabsComponent)  private tabsRef!: ProductTabsComponent;
  @ViewChild('tabsSection') private tabsSection!: ElementRef<HTMLElement>;

  protected readonly product   = signal<PublicProduct | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly hasError  = signal(false);
  protected readonly qty       = signal(1);

  protected readonly relatedProducts = computed(() => this.product()?.relatedProducts ?? []);
  protected readonly youMayLike      = computed(() => this.product()?.youMayLike ?? []);

  protected readonly reviewCount = signal(0);
  protected readonly avgRating   = signal<number | null>(null);

  /** Units of this product already in the cart, and how many more can still be added. */
  protected readonly inCart = computed(() => {
    const p = this.product();
    return p ? this.cartService.items().find(i => i.productId === p.id)?.qty ?? 0 : 0;
  });
  protected readonly maxAddable = computed(() => {
    const p = this.product();
    if (!p) return 0;
    const limit = p.maxSaleQty !== null ? Math.min(p.maxSaleQty, p.stock) : p.stock;
    return Math.max(0, limit - this.inCart());
  });

  /** Price × selected quantity, in the currency the visitor chose (shown when qty > 1). */
  protected readonly qtySubtotal = computed(() => {
    const p = this.product();
    return p ? this.currency.format(p.priceMxn * this.qty(), p.priceUsd * this.qty()) : '';
  });

  protected readonly loyaltyPts = computed(() =>
    this.product() ? this.product()!.loyaltyPoints * this.qty() : 0
  );

  // Usa tags del backend si existen; si no, construye desde brand + categorías
  protected readonly productTags = computed<string[]>(() => {
    const p = this.product();
    if (!p) return [];
    if (p.tags.length) return p.tags;
    const tags: string[] = [];
    if (p.brand?.name) tags.push(p.brand.name);
    p.categories.forEach(c => tags.push(c.name));
    return tags;
  });

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
    this.route.params.subscribe(params => {
      const slug: string = params['slug'];
      // Enlaces viejos /productos/6 → se cargan por id y se redirigen a la URL con slug
      const legacyId = /^\d+$/.test(slug) ? Number(slug) : null;
      this.isLoading.set(true);
      this.hasError.set(false);
      this.product.set(null);
      this.reviewCount.set(0);
      this.avgRating.set(null);
      const product$ = legacyId !== null
        ? this.productsService.getProduct(legacyId)
        : this.productsService.getProductBySlug(slug);
      product$.subscribe({
        next: product => {
          if (legacyId !== null && product.slug) {
            this.router.navigate(['/productos', product.slug], { replaceUrl: true });
            return;
          }
          this.product.set(product);
          this.qty.set(product.minSaleQty);
          this.isLoading.set(false);
          this.loadReviewStats(product.id);
        },
        error: () => {
          this.hasError.set(true);
          this.isLoading.set(false);
        },
      });
    });
  }

  private loadReviewStats(productId: number): void {
    this.reviewsService.getReviews(productId).subscribe({
      next: reviews => {
        this.reviewCount.set(reviews.length);
        if (reviews.length) {
          const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
          this.avgRating.set(Math.round(avg * 10) / 10);
        }
      },
    });
  }

  protected goToReviews(): void {
    this.tabsRef.activateReviews();
    this.tabsSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected onBuyNow(): void {
    if (this.buyingNow()) return;
    // Everything available is already in the cart: just go there
    if (this.maxAddable() === 0) {
      this.router.navigateByUrl('/carrito');
      return;
    }
    this.buyingNow.set(true);
    this.cartError.set(null);
    this.cartService.addItem(this.product()!.id, this.qty()).subscribe({
      next:  () => this.router.navigateByUrl('/carrito'),
      error: err => {
        this.buyingNow.set(false);
        this.cartError.set(apiErrorMessage(err));
      },
    });
  }

  protected onAddToCart(): void {
    if (this.adding()) return;
    this.adding.set(true);
    this.cartError.set(null);
    this.cartService.addItem(this.product()!.id, this.qty()).subscribe({
      next: () => {
        this.adding.set(false);
        this.added.set(true);
        // Keep the selector within what can still be added
        this.qty.set(Math.max(1, Math.min(this.qty(), this.maxAddable())));
        setTimeout(() => this.added.set(false), 2000);
      },
      error: err => {
        this.adding.set(false);
        this.cartError.set(apiErrorMessage(err));
      },
    });
  }

  protected decQty(): void {
    const p = this.product();
    if (!p) return;
    const next = this.qty() - p.qtyIncrements;
    if (next >= p.minSaleQty) this.qty.set(next);
  }

  protected incQty(): void {
    const p = this.product();
    if (!p) return;
    const next = this.qty() + p.qtyIncrements;
    if (next <= this.maxAddable()) this.qty.set(next);
  }

  protected formatPrice(p: { priceMxn: number; priceUsd: number }): string {
    return this.currency.format(p.priceMxn, p.priceUsd);
  }

  protected stars(rating: number | null): number[] {
    const r = Math.round(rating ?? 0);
    return Array.from({ length: 5 }, (_, i) => i < r ? 1 : 0);
  }
}
