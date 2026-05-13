import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-products-pagination',
  standalone: true,
  templateUrl: './products-pagination.component.html',
})
export class ProductsPaginationComponent {
  page        = input.required<number>();
  totalPages  = input.required<number>();
  totalElems  = input.required<number>();
  pageNumbers = input.required<number[]>();

  pageChange = output<number>();
}
