import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

export interface DrivePhoto {
  id:           string;
  name:         string;
  createdTime:  string;
  thumbUrl:     string;   // =w600 — galería
  fullUrl:      string;   // =w1200 — APOD
}

@Injectable({ providedIn: 'root' })
export class DrivePhotosService {
  private readonly http = inject(HttpClient);

  private readonly photos$: Observable<DrivePhoto[]> =
    this.http.get<DrivePhoto[]>('/galeria/index.json').pipe(
      map(photos => photos.map(p => ({
        ...p,
        // =w700 alcanza para la tarjeta "foto del día"; el lightbox pide una
        // versión más grande por su cuenta (ver photo-lightbox.component.ts).
        fullUrl: p.fullUrl?.replace('=w1200', '=w700') ?? p.fullUrl,
      }))),
      catchError(() => of([])),
      shareReplay(1),
    );

  /** Todas las fotos (más nueva primero) */
  getAll(): Observable<DrivePhoto[]> {
    return this.photos$;
  }

  /** Última foto subida → foto del día */
  getFotoDelDia(): Observable<DrivePhoto | null> {
    return this.photos$.pipe(map(p => p[0] ?? null));
  }

  /** Resto → masonry de galería */
  getGallery(): Observable<DrivePhoto[]> {
    return this.photos$.pipe(map(p => p.slice(1)));
  }

}
