import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products-filters',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './products-filters.component.html',
})
export class ProductsFiltersComponent {
  selectedCount     = input.required<number>();
  statusFilter      = input.required<string>();
  availabilityFilter = input.required<string>();
  stockFilter       = input.required<string>();

  searchChange      = output<string>();
  statusChange      = output<string>();
  availabilityChange = output<string>();
  stockChange       = output<string>();
  deleteSelected    = output<void>();
}
