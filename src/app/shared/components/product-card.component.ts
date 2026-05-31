import { Component, inject, input, signal, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicProduct } from '../../core/models/public-product.model';
import { AssetUrlPipe } from '../pipes/asset-url.pipe';
import { StarRatingComponent } from './star-rating.component';
import { CurrencyService } from '../../core/services/currency.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [AssetUrlPipe, StarRatingComponent, RouterLink],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent implements OnDestroy {
  product = input.required<PublicProduct>();
  private readonly currency = inject(CurrencyService);
  private readonly cart    = inject(CartService);

  protected currentIndex = signal(0);
  protected adding       = signal(false);
  protected added        = signal(false);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  protected onMouseEnter(): void {
    const images = this.product().images;
    if (images.length <= 1) return;
    this.intervalId = setInterval(() => {
      this.currentIndex.update(i => (i + 1) % images.length);
    }, 1200);
  }

  protected onMouseLeave(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentIndex.set(0);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  protected formatPrice(): string {
    const p = this.product();
    return this.currency.format(p.priceMxn, p.priceUsd);
  }

  protected onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.adding()) return;
    this.adding.set(true);
    this.cart.addItem(this.product().id, 1).subscribe({
      next: () => {
        this.adding.set(false);
        this.added.set(true);
        setTimeout(() => this.added.set(false), 1800);
      },
      error: () => this.adding.set(false),
    });
  }

  protected formatSalePrice(): string {
    const p = this.product();
    return this.currency.format(p.salePriceMxn ?? p.priceMxn, p.salePriceUsd ?? p.priceUsd);
  }
}
