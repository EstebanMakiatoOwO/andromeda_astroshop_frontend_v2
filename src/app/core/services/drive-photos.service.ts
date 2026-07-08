import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  private readonly photos$: Observable<DrivePhoto[]> = environment.driveScriptUrl
    ? this.http.get<{ files: { id: string; name: string; createdTime: string }[] }>(
        environment.driveScriptUrl,
      ).pipe(
        map(r => r.files.map(f => this.toPhoto(f))),
        shareReplay(1),
      )
    : of([]);   // sin URL configurada → lista vacía

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

  private toPhoto(f: { id: string; name: string; createdTime: string }): DrivePhoto {
    return {
      id:          f.id,
      name:        f.name.replace(/\.[^.]+$/, ''),
      createdTime: f.createdTime,
      thumbUrl:    `https://lh3.googleusercontent.com/d/${f.id}=w600`,
      fullUrl:     `https://lh3.googleusercontent.com/d/${f.id}=w1200`,
    };
  }
}
