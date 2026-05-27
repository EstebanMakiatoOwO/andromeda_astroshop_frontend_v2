import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(convertKeys);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        snakeToCamel(k),
        convertKeys(v),
      ])
    );
  }
  return value;
}

export function camelCaseInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse && event.body !== null) {
        return event.clone({ body: convertKeys(event.body) });
      }
      return event;
    })
  );
}
