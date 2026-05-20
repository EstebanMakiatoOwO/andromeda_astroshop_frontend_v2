import { Component, DestroyRef, HostListener, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { PublicCategory } from '../../../core/models/public-category.model';
import { PublicProduct } from '../../../core/models/public-product.model';
import { PublicProductsService } from '../../../core/services/public-products.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { AssetUrlPipe } from '../../../shared/pipes/asset-url.pipe';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [LogoComponent, AssetUrlPipe],
  templateUrl: './public-navbar.component.html',
})
export class PublicNavbarComponent {
  private readonly productsService = inject(PublicProductsService);
  private readonly destroyRef      = inject(DestroyRef);

  categories = input<PublicCategory[]>([]);

  protected readonly megaOpen       = signal(false);
  protected readonly mobileMenuOpen = signal(false);
  protected readonly cartCount      = signal(2);
  protected readonly loyaltyPts     = signal(1240);

  protected readonly navCategories = computed(() =>
    this.categories().filter(c => c.showInMenu !== false && c.slug !== 'nivel')
  );
  protected readonly nivelChildren = computed(() =>
    this.categories().find(c => c.slug === 'nivel')?.children ?? []
  );

  // ── Search ────────────────────────────────────────────────────────────
  protected readonly searchQuery       = signal('');
  protected readonly searchResults     = signal<PublicProduct[]>([]);
  protected readonly isSearching       = signal(false);
  protected readonly showDropdown      = signal(false);

  private readonly searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      filter(q => q.trim().length >= 2),
      switchMap(q => {
        this.isSearching.set(true);
        return this.productsService.search(q);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: results => {
        this.searchResults.set(results.slice(0, 6));
        this.isSearching.set(false);
        this.showDropdown.set(true);
      },
      error: () => this.isSearching.set(false),
    });
  }

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
    if (value.trim().length < 2) {
      this.showDropdown.set(false);
      this.searchResults.set([]);
      return;
    }
    this.searchSubject.next(value.trim());
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.showDropdown.set(false);
    this.searchResults.set([]);
  }

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
    if (this.mobileMenuOpen()) this.showDropdown.set(false);
  }

  @HostListener('document:click')
  protected onDocumentClick(): void {
    this.showDropdown.set(false);
  }

  protected formatPrice(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
    }).format(value);
  }

  // ── Mega menu ─────────────────────────────────────────────────────────
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  protected openMega(): void {
    if (this.showDropdown()) return;
    if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; }
    this.megaOpen.set(true);
  }

  protected scheduleMegaClose(): void {
    this.closeTimer = setTimeout(() => this.megaOpen.set(false), 120);
  }

  protected formatPts(n: number): string {
    return n.toLocaleString('es-AR');
  }
}
