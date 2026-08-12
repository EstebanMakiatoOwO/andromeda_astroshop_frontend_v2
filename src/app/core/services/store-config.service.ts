import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StoreConfigService {
  private readonly http = inject(HttpClient);

  readonly ecommerceEnabled = signal(false);
  /** true una vez que se resolvió la llamada a /v1/config (con éxito o no) */
  readonly loaded = signal(false);

  private loaded$?: Observable<boolean>;

  /** Dispara (una sola vez) y cachea la carga del config. Nunca falla. */
  load(): Observable<boolean> {
    if (!this.loaded$) {
      this.loaded$ = this.http
        .get<boolean[]>(`${environment.apiBase}/api/v1/config`)
        .pipe(
          map(cfg => cfg[0] ?? true),
          catchError(() => of(false)),
          tap(enabled => {
            this.ecommerceEnabled.set(enabled);
            this.loaded.set(true);
          }),
          shareReplay(1),
        );
    }
    return this.loaded$;
  }
}
