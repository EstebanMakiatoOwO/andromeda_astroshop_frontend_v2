import { HttpErrorResponse } from '@angular/common/http';

/**
 * Magento's REST API sends errors as `{ message: 'Solo quedan %1 unidades…', parameters: [20] }`
 * (or named: `%field` + `{ field: … }`). Returns the message with its placeholders filled in.
 */
export function apiErrorMessage(err: unknown, fallback = 'Ocurrió un error, intenta de nuevo.'): string {
  const body = err instanceof HttpErrorResponse ? err.error : null;
  const message: unknown = body?.message;
  if (typeof message !== 'string' || !message) return fallback;

  const params = body.parameters ?? [];
  return message.replace(/%(\w+)/g, (placeholder, key: string) => {
    const value = Array.isArray(params)
      ? (/^\d+$/.test(key) ? params[Number(key) - 1] : undefined)
      : params[key];
    return value === undefined || value === null ? placeholder : String(value);
  });
}
