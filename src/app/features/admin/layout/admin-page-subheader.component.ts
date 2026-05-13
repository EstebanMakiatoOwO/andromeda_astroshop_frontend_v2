import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-page-subheader',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-page-subheader.component.html',
})
export class AdminPageSubheaderComponent {
  backRoute  = input.required<string>();
  backLabel  = input.required<string>();
  title      = input.required<string>();
  badgeClass = input<string | null>(null);
  badgeLabel = input<string | null>(null);
}
