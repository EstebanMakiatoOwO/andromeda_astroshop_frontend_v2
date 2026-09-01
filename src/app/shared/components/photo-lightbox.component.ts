import { Component, HostListener, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PhotoLightboxService } from '../../core/services/photo-lightbox.service';

@Component({
  selector: 'app-photo-lightbox',
  standalone: true,
  imports: [DatePipe],
  template: `
    @if (lightbox.photo(); as photo) {
      <div class="fixed inset-0 z-[100] flex flex-col"
           style="background:rgba(0,0,0,0.92)"
           (click)="lightbox.close()">

        <div class="flex items-center justify-between px-4 py-3 shrink-0"
             (click)="$event.stopPropagation()">
          <div class="flex flex-col">
            <span class="text-white font-semibold text-sm leading-snug truncate max-w-[70vw]">
              {{ photo.name }}
            </span>
            <span class="font-mono text-[11px] text-white/50">
              {{ lightbox.subtitle() || ((photo.createdTime | date:'d MMM y') + ' · comunidad Andrómeda') }}
            </span>
          </div>
          <button (click)="lightbox.close()"
                  class="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xl shrink-0"
                  aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div class="flex-1 flex items-center justify-center px-4 pb-4 min-h-0"
             (click)="$event.stopPropagation()">
          <img [src]="zoomUrl(photo.fullUrl)"
               [alt]="photo.name"
               loading="eager" fetchpriority="high"
               class="max-w-full max-h-full object-contain rounded-lg select-none"
               style="max-height: calc(100dvh - 80px)" />
        </div>
      </div>
    }
  `,
})
export class PhotoLightboxComponent {
  protected readonly lightbox = inject(PhotoLightboxService);

  @HostListener('document:keydown.escape')
  protected onEscape(): void { this.lightbox.close(); }

  /** Pide una versión de mayor resolución para la vista a pantalla completa. */
  protected zoomUrl(url: string): string {
    return url.replace(/=w\d+/, '=w1600');
  }
}
