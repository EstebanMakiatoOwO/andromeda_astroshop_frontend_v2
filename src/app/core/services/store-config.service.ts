import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StoreConfigService {
  private readonly http = inject(HttpClient);

  readonly ecommerceEnabled = signal(false);

  load() {
    return this.http
      .get<boolean[]>(`${environment.apiBase}/api/v1/config`)
      .pipe(
        tap(cfg => this.ecommerceEnabled.set(cfg[0] ?? true)),
        catchError(() => of(null)),
      );
  }
}
