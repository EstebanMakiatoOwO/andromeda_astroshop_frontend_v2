import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PublicProduct } from '../../core/models/public-product.model';
import { CatalogPage, DEFAULT_FILTERS } from '../../core/models/catalog.model';
import { Brand } from '../../core/models/brand.model';
import { Article } from '../../core/models/article.model';
import { PublicProductsService } from '../../core/services/public-products.service';
import { BrandsService } from '../../core/services/brands.service';
import { ArticlesService } from '../../core/services/articles.service';
import { PublicAuthService } from '../../core/services/public-auth.service';
import { StoreConfigService } from '../../core/services/store-config.service';
import { HeroCarouselComponent } from './components/hero-carousel.component';
import { LoyaltyBannerComponent } from './components/loyalty-banner.component';
import { ProductCarouselComponent } from './components/product-carousel.component';
import { EditorialSectionComponent } from './components/editorial-section.component';
import { StoreHighlightsComponent } from './components/store-highlights.component';
import { CategoryTile, CategoryTilesComponent } from './components/category-tiles.component';
import { FeaturedGridComponent } from './components/featured-grid.component';
import { BrandsSectionComponent } from './components/brands-section.component';
import { RanchoTeaserComponent } from '../landing/components/rancho-teaser.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroCarouselComponent,
    LoyaltyBannerComponent,
    ProductCarouselComponent,
    EditorialSectionComponent,
    StoreHighlightsComponent,
    CategoryTilesComponent,
    FeaturedGridComponent,
    BrandsSectionComponent,
    RanchoTeaserComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly router          = inject(Router);
  private readonly productsService = inject(PublicProductsService);
  private readonly brandsService   = inject(BrandsService);
  private readonly articlesService = inject(ArticlesService);
  protected readonly auth          = inject(PublicAuthService);
  protected readonly storeConfig   = inject(StoreConfigService);

  protected readonly popularProducts  = signal<PublicProduct[]>([]);
  protected readonly newProducts      = signal<PublicProduct[]>([]);
  protected readonly brands           = signal<Brand[]>([]);
  protected readonly articles         = signal<Article[]>([]);
  protected readonly isLoadingPopular = signal(true);
  protected readonly isLoadingNew     = signal(true);
  protected readonly isLoadingArticles = signal(true);

  /** First catalog page: feeds the category tiles and the featured grid. */
  protected readonly catalog          = signal<CatalogPage | null>(null);
  protected readonly isLoadingCatalog = signal(true);

  /** Only categories that actually have products, with their first product's photo as cover. */
  protected readonly categoryTiles = computed<CategoryTile[]>(() => {
    const page = this.catalog();
    if (!page) return [];
    return page.facets.categories
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(c => ({
        id:    c.id,
        name:  c.name,
        count: c.count,
        image: page.products.find(p => p.images.length && p.categories.some(pc => pc.id === c.id))?.images[0] ?? null,
      }));
  });

  /** Up to 8 products for the grid: with photo and in stock first. */
  protected readonly featuredProducts = computed(() => {
    const products = this.catalog()?.products ?? [];
    const score = (p: PublicProduct) => (p.images.length ? 2 : 0) + (p.isInStock && p.stock > 0 ? 1 : 0);
    return [...products].sort((a, b) => score(b) - score(a)).slice(0, 8);
  });

  ngOnInit(): void {
    this.storeConfig.load().subscribe(enabled => {
      if (!enabled) {
        this.router.navigateByUrl('/conocenos', { replaceUrl: true });
        return;
      }
      this.loadHomeData();
    });
  }

  private loadHomeData(): void {
    this.productsService.catalog(DEFAULT_FILTERS, 24).subscribe({
      next:  page => { this.catalog.set(page); this.isLoadingCatalog.set(false); },
      error: () => this.isLoadingCatalog.set(false),
    });

    this.productsService.getPopular(12).subscribe({
      next:  p  => { this.popularProducts.set(p); this.isLoadingPopular.set(false); },
      error: () => this.isLoadingPopular.set(false),
    });

    this.productsService.getNew(12).subscribe({
      next:  p  => { this.newProducts.set(p); this.isLoadingNew.set(false); },
      error: () => this.isLoadingNew.set(false),
    });

    this.brandsService.getBrands().subscribe({
      next: b => this.brands.set(b),
    });

    this.articlesService.getArticles().subscribe({
      next:  a  => { this.articles.set(a); this.isLoadingArticles.set(false); },
      error: () => this.isLoadingArticles.set(false),
    });
  }
}
