import { Component, inject, OnInit, signal } from '@angular/core';
import { PublicProduct } from '../../core/models/public-product.model';
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
import { CategoryTabsSectionComponent } from './components/category-tabs-section.component';
import { EditorialSectionComponent } from './components/editorial-section.component';
import { BrandsSectionComponent } from './components/brands-section.component';
import { LandingHomeComponent } from '../landing/landing-home.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    LandingHomeComponent,
    HeroCarouselComponent,
    LoyaltyBannerComponent,
    ProductCarouselComponent,
    CategoryTabsSectionComponent,
    EditorialSectionComponent,
    BrandsSectionComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
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

  ngOnInit(): void {
    if (!this.storeConfig.ecommerceEnabled()) return;

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
