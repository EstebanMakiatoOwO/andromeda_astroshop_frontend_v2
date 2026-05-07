import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyArs', standalone: true })
export class CurrencyArsPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '$ 0';
    const formatted = Math.round(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$ ${formatted}`;
  }
}
