import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LandingHeroComponent } from './components/landing-hero.component';
import { LandingSectionHeadComponent } from './components/landing-section-head.component';
import { ApodFeatureComponent } from './components/apod-feature.component';
import { DrivePhotosService, DrivePhoto } from '../../core/services/drive-photos.service';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [LandingHeroComponent, LandingSectionHeadComponent, ApodFeatureComponent, DatePipe],
  templateUrl: './galeria.component.html',
})
export class GaleriaComponent implements OnInit {
  private readonly drive = inject(DrivePhotosService);

  protected readonly photos    = signal<DrivePhoto[]>([]);
  protected readonly loading   = signal(true);
  protected readonly selected  = signal<DrivePhoto | null>(null);

  ngOnInit(): void {
    this.drive.getGallery().subscribe({
      next:  p  => { this.photos.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected open(photo: DrivePhoto): void {
    this.selected.set(photo);
    document.body.style.overflow = 'hidden';
  }

  protected close(): void {
    this.selected.set(null);
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void { this.close(); }
}
