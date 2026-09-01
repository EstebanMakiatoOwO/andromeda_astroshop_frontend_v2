import { Injectable, signal } from '@angular/core';
import { DrivePhoto } from './drive-photos.service';

@Injectable({ providedIn: 'root' })
export class PhotoLightboxService {
  readonly photo    = signal<DrivePhoto | null>(null);
  readonly subtitle = signal<string | null>(null);

  open(photo: DrivePhoto, subtitle?: string): void {
    this.photo.set(photo);
    this.subtitle.set(subtitle ?? null);
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.photo.set(null);
    document.body.style.overflow = '';
  }
}
