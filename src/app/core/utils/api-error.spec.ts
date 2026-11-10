import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from './api-error';

const httpError = (error: unknown) => new HttpErrorResponse({ status: 400, error });

describe('apiErrorMessage', () => {
  it('fills positional Magento placeholders', () => {
    const err = httpError({ message: 'Solo quedan %1 unidades disponibles de este producto.', parameters: [20] });
    expect(apiErrorMessage(err)).toBe('Solo quedan 20 unidades disponibles de este producto.');
  });

  it('fills named placeholders', () => {
    const err = httpError({ message: 'El campo %fieldName es obligatorio.', parameters: { fieldName: 'email' } });
    expect(apiErrorMessage(err)).toBe('El campo email es obligatorio.');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(apiErrorMessage(httpError({ message: 'Hola %1 y %2', parameters: ['a'] }))).toBe('Hola a y %2');
  });

  it('returns the message as-is when there are no parameters', () => {
    expect(apiErrorMessage(httpError({ message: 'Carrito no encontrado.' }))).toBe('Carrito no encontrado.');
  });

  it('falls back when the error has no message', () => {
    expect(apiErrorMessage(httpError('<html>502</html>'))).toBe('Ocurrió un error, intenta de nuevo.');
    expect(apiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});
