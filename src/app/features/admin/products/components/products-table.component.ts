import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminProduct } from '../../../../core/models/product.model';
import { ars, badgeClass, statusLabel, stockBadgeClass, stockLabel } from '../products.helpers';

@Component({
  selector: 'app-products-table',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './products-table.component.html',
})
export class ProductsTableComponent {
  products    = input.required<AdminProduct[]>();
  isLoading   = input.required<boolean>();
  selectedIds = input.required<Set<number>>();

  selectionChange = output<Set<number>>();

  protected statusLabel    = statusLabel;
  protected badgeClass     = badgeClass;
  protected stockBadgeClass = stockBadgeClass;
  protected stockLabel     = stockLabel;
  protected ars            = ars;

  protected isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  protected isAllSelected(): boolean {
    return this.products().length > 0 &&
      this.products().every(p => this.selectedIds().has(p.id));
  }

  protected toggleOne(id: number): void {
    const next = new Set(this.selectedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selectionChange.emit(next);
  }

  protected toggleAll(checked: boolean): void {
    const next = checked
      ? new Set(this.products().map(p => p.id))
      : new Set<number>();
    this.selectionChange.emit(next);
  }
}
