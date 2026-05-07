import {
  ApplicationRef,
  Component,
  ElementRef,
  EmbeddedViewRef,
  HostListener,
  inject,
  OnDestroy,
  Renderer2,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { CurrencyArsPipe } from '../../../../shared/pipes/currency-ars.pipe';
import { SearchService, SearchProduct, SearchResults, SearchUser } from '../../../../core/services/search.service';
import { AdminOrder } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CurrencyArsPipe],
  templateUrl: './search-bar.component.html',
})
export class SearchBarComponent implements OnDestroy {
  private readonly svc    = inject(SearchService);
  private readonly router = inject(Router);
  private readonly appRef = inject(ApplicationRef);
  private readonly doc    = inject(DOCUMENT);

  @ViewChild('inputEl')     private inputEl!: ElementRef<HTMLInputElement>;
  @ViewChild('dropdownTpl') private dropdownTpl!: TemplateRef<unknown>;

  private readonly query$ = new Subject<string>();
  private portalView: EmbeddedViewRef<unknown> | null = null;

  protected readonly results     = signal<SearchResults | null>(null);
  protected readonly isLoading   = signal(false);
  protected readonly dropdownTop  = signal('0px');
  protected readonly dropdownLeft = signal('0px');

  private readonly sub = this.query$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(q => {
      if (q.trim().length < 2) {
        this.results.set(null);
        this.isLoading.set(false);
        return of(null);
      }
      this.isLoading.set(true);
      return this.svc.search(q);
    }),
  ).subscribe({
    next: res => {
      this.isLoading.set(false);
      if (res) this.results.set(res);
      (this.portalView as any)?.detectChanges();
    },
    error: () => {
      this.isLoading.set(false);
      (this.portalView as any)?.detectChanges();
    },
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.portalView) return;
    const target = event.target as Node;
    if (this.inputEl?.nativeElement.contains(target)) return;
    const isInsidePortal = this.portalView.rootNodes.some(
      n => (n as HTMLElement).contains?.(target),
    );
    if (!isInsidePortal) this.close();
  }

  protected onInput(value: string): void {
    if (value.trim().length < 2) {
      this.results.set(null);
      this.destroyPortal();
    } else {
      const rect = this.inputEl.nativeElement.getBoundingClientRect();
      this.dropdownTop.set(`${rect.bottom + 6}px`);
      this.dropdownLeft.set(`${rect.left}px`);
      this.openPortal();
    }
    this.query$.next(value);
  }

  private openPortal(): void {
    if (this.portalView) return;
    this.portalView = this.dropdownTpl.createEmbeddedView({});
    this.appRef.attachView(this.portalView);
    // detectChanges() applies [style.top]/[style.left] BEFORE the node
    // reaches the DOM — sin esto el browser lo coloca en posición "auto" (abajo).
    (this.portalView as any).detectChanges();
    this.portalView.rootNodes.forEach(n => this.doc.body.appendChild(n));
  }

  private destroyPortal(): void {
    if (!this.portalView) return;
    this.portalView.rootNodes.forEach(n => (n as HTMLElement).parentNode?.removeChild(n));
    this.appRef.detachView(this.portalView);
    this.portalView.destroy();
    this.portalView = null;
  }

  protected close(): void {
    this.results.set(null);
    this.destroyPortal();
  }

  protected hasResults(res: SearchResults): boolean {
    return res.orders.length > 0 || res.users.length > 0 || res.products.length > 0;
  }

  protected goToOrder(o: AdminOrder): void {
    this.router.navigate(['/admin/orders', o.id]);
    this.close();
  }

  protected goToUser(u: SearchUser): void {
    this.router.navigate(['/admin/users', u.id]);
    this.close();
  }

  protected goToProduct(p: SearchProduct): void {
    this.router.navigate(['/admin/products', p.id]);
    this.close();
  }

  ngOnDestroy(): void {
    this.destroyPortal();
    this.sub.unsubscribe();
  }
}
