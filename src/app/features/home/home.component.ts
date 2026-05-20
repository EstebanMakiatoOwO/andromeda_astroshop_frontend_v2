import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PublicProduct } from '../../core/models/public-product.model';
import { Brand } from '../../core/models/brand.model';
import { PublicProductsService } from '../../core/services/public-products.service';
import { BrandsService } from '../../core/services/brands.service';
import { PublicAuthService } from '../../core/services/public-auth.service';
import { HeroSectionComponent } from './components/hero-section.component';
import { LoyaltyBannerComponent } from './components/loyalty-banner.component';
import { FeaturedProductsComponent } from './components/featured-products.component';
import { EditorialSectionComponent } from './components/editorial-section.component';
import { BrandsSectionComponent } from './components/brands-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroSectionComponent,
    LoyaltyBannerComponent,
    FeaturedProductsComponent,
    EditorialSectionComponent,
    BrandsSectionComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly productsService = inject(PublicProductsService);
  private readonly brandsService   = inject(BrandsService);
  protected readonly auth          = inject(PublicAuthService);

  protected readonly featuredProducts  = signal<PublicProduct[]>([]);
  protected readonly brands            = signal<Brand[]>([]);
  protected readonly isLoadingProducts = signal(true);
  protected readonly isLoadingBrands   = signal(true);

  ngOnInit(): void {
    this.productsService.getFeatured(8).subscribe({
      next:     p  => { this.featuredProducts.set(p); this.isLoadingProducts.set(false); },
      error:    () => this.isLoadingProducts.set(false),
    });

    this.brandsService.getBrands().subscribe({
      next:     b  => { this.brands.set(b); this.isLoadingBrands.set(false); },
      error:    () => this.isLoadingBrands.set(false),
    });
  }
}
