import { Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, switchMap, catchError, of } from 'rxjs';
import { CurrencyService } from '../../../../core/services/currency.service';
import { LoyaltyService, RedeemPreview } from '../../../../core/services/loyalty.service';
import { PublicAuthService } from '../../../../core/services/public-auth.service';

const SHIPPING_MXN = 14500;
const SHIPPING_USD = 841;

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  templateUrl: './cart-summary.component.html',
})
export class CartSummaryComponent implements OnInit {
  subtotal    = input.required<number>();
  subtotalUsd = input.required<number>();
  itemCount   = input.required<number>();
  loyaltyPts  = input.required<number>();

  checkout = output<{ pointsToRedeem: number; discountMxn: number }>();

  protected readonly discountCode   = signal('');
  protected readonly pointsInput    = signal(0);
  protected readonly preview        = signal<RedeemPreview | null>(null);
  protected readonly previewLoading = signal(false);
  protected readonly loyaltyBalance = signal(0);

  protected readonly auth    = inject(PublicAuthService);
  private readonly loyalty   = inject(LoyaltyService);
  private readonly currency  = inject(CurrencyService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly points$ = new Subject<number>();

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.loyalty.getMyAccount()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(acc => this.loyaltyBalance.set(acc.pointsBalance));
    }

    this.points$.pipe(
      debounceTime(500),
      switchMap(pts => {
        if (pts <= 0) { this.preview.set(null); return of(null); }
        this.previewLoading.set(true);
        return this.loyalty.redeemPreview(pts, Math.round(this.subtotal() * 100)).pipe(
          catchError(() => of(null))
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(result => {
      this.preview.set(result);
      if (result) this.pointsInput.set(result.pointsToRedeem); // clamp del back
      this.previewLoading.set(false);
    });
  }

  protected onPointsChange(val: string): void {
    const n = Math.max(0, Math.min(parseInt(val) || 0, this.loyaltyBalance()));
    this.pointsInput.set(n);
    this.points$.next(n);
  }

  protected useAllPoints(): void {
    const n = this.loyaltyBalance();
    this.pointsInput.set(n);
    this.points$.next(n);
  }

  protected clearPoints(): void {
    this.pointsInput.set(0);
    this.preview.set(null);
  }

  protected get discountMxn(): number { return (this.preview()?.discountMxn ?? 0) / 100; }
  protected get total(): number       { return this.subtotal() + SHIPPING_MXN - this.discountMxn; }
  protected get totalUsd(): number    { return this.subtotalUsd() + SHIPPING_USD; }

  protected fmt(mxn: number, usd: number): string { return this.currency.format(mxn, usd); }

  protected onCheckout(): void {
    this.checkout.emit({ pointsToRedeem: this.pointsInput(), discountMxn: this.discountMxn });
  }
}
