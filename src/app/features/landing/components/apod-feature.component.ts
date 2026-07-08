import { Component, HostListener, OnInit, computed, inject, input, signal } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { DrivePhotosService, DrivePhoto } from '../../../core/services/drive-photos.service';
import { BRAND_ACCENTS } from './landing-hero.component';

@Component({
  selector: 'app-apod-feature',
  standalone: true,
  templateUrl: './apod-feature.component.html',
})
export class ApodFeatureComponent implements OnInit {
  private readonly theme  = inject(ThemeService);
  private readonly drive  = inject(DrivePhotosService);

  variant = input<'hero' | 'band'>('hero');

  protected readonly dark    = computed(() => this.variant() === 'hero' && this.theme.isDark());
  protected readonly accent  = BRAND_ACCENTS.base;
  protected readonly photo   = signal<DrivePhoto | null>(null);
  protected readonly loading   = signal(true);
  protected readonly lightbox  = signal(false);

  protected readonly today = new Date().toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  ngOnInit(): void {
    this.drive.getFotoDelDia().subscribe({
      next:  p  => { this.photo.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected openLightbox(): void {
    this.lightbox.set(true);
    document.body.style.overflow = 'hidden';
  }

  protected closeLightbox(): void {
    this.lightbox.set(false);
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void { this.closeLightbox(); }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }
}
