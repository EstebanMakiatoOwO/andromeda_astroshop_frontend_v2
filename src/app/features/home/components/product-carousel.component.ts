import { Component, AfterViewInit, ElementRef, ViewChild, input, signal } from '@angular/core';
import { PublicProduct } from '../../../core/models/public-product.model';
import { ProductCardComponent } from '../../../shared/components/product-card.component';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './product-carousel.component.html',
})
export class ProductCarouselComponent implements AfterViewInit {
  readonly products = input.required<PublicProduct[]>();
  readonly title    = input.required<string>();
  readonly subtitle = input('');

  @ViewChild('scroller') private scroller!: ElementRef<HTMLElement>;

  protected readonly canPrev = signal(false);
  protected readonly canNext = signal(true);

  ngAfterViewInit(): void {
    this.updateArrows();
  }

  protected onScroll(): void {
    this.updateArrows();
  }

  protected scroll(dir: 1 | -1): void {
    const el = this.scroller.nativeElement;
    el.scrollTo({ left: el.scrollLeft + dir * el.clientWidth * 0.7, behavior: 'smooth' });
  }

  private updateArrows(): void {
    const el = this.scroller?.nativeElement;
    if (!el) return;
    this.canPrev.set(el.scrollLeft > 4);
    this.canNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }
}
