import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-api-validation-errors',
  standalone: true,
  templateUrl: './api-validation-errors.component.html',
})
export class ApiValidationErrorsComponent {
  message     = input('');
  fieldErrors = input<Record<string, string>>({});

  dismissed = output<void>();

  protected readonly entries = computed(() => Object.entries(this.fieldErrors()));
  protected readonly hasFields = computed(() => this.entries().length > 0);
}
