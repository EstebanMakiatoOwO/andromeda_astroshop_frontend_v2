import { Component, input, signal } from '@angular/core';
import { AssetUrlPipe } from '../../../shared/pipes/asset-url.pipe';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [AssetUrlPipe],
  template: `
    <div class="flex flex-col gap-3">

      <!-- Imagen principal -->
      <div class="relative rounded-xl overflow-hidden bg-surface-3 aspect-square">
        @if (images().length > 0) {
          <img [src]="images()[active()] | assetUrl" alt="imagen del producto"
               class="w-full h-full object-cover" />
        } @else {
          <div class="w-full h-full flex items-center justify-center"
               style="background:repeating-linear-gradient(135deg,var(--color-surface-3) 0 8px,var(--color-surface-2) 8px 16px)">
            <span class="font-mono text-xs text-ink-3">sin imagen</span>
          </div>
        }

        <!-- Stock badge -->
        @if (stock() > 0) {
          <span class="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium
                       bg-success-soft text-success border border-success/20">
            en stock · {{ stock() }}
          </span>
        } @else {
          <span class="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-medium
                       bg-error-soft text-error border border-error/20">
            sin stock
          </span>
        }
      </div>

      <!-- Thumbnails -->
      @if (images().length > 1) {
        <div class="flex gap-2">
          @for (img of images(); track $index; let i = $index) {
            <button (click)="active.set(i)"
                    class="flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-all"
                    [class.border-accent]="active() === i"
                    [class.border-transparent]="active() !== i"
                    [class.opacity-60]="active() !== i">
              <img [src]="img | assetUrl" class="w-full h-full object-cover" />
            </button>
          }
        </div>
      } @else if (images().length === 0) {
        <div class="flex gap-2">
          @for (n of [1,2,3,4,5]; track n) {
            <div class="flex-1 aspect-square rounded-lg border border-line bg-surface-3
                        flex items-center justify-center">
              <span class="font-mono text-[9px] text-ink-3">{{ n }}</span>
            </div>
          }
        </div>
      }

    </div>
  `,
})
export class ProductGalleryComponent {
  images = input.required<string[]>();
  stock  = input(0);
  protected readonly active = signal(0);
}
