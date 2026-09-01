import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LandingHeroComponent } from './components/landing-hero.component';
import { LandingSectionHeadComponent } from './components/landing-section-head.component';
import { ApodFeatureComponent } from './components/apod-feature.component';
import { DrivePhotosService, DrivePhoto } from '../../core/services/drive-photos.service';
import { PhotoLightboxService } from '../../core/services/photo-lightbox.service';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [LandingHeroComponent, LandingSectionHeadComponent, ApodFeatureComponent, DatePipe],
  templateUrl: './galeria.component.html',
})
export class GaleriaComponent implements OnInit {
  private readonly drive = inject(DrivePhotosService);
  protected readonly lightbox = inject(PhotoLightboxService);

  protected readonly photos    = signal<DrivePhoto[]>([]);
  protected readonly loading   = signal(true);

  ngOnInit(): void {
    this.drive.getGallery().subscribe({
      next:  p  => { this.photos.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
