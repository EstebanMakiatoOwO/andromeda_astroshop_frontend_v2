import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';
import { Breadcrumb } from '../sidebar/nav.model';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-topbar.component.html',
})
export class AdminTopbarComponent {
  crumbs = input<Breadcrumb[]>([]);

  protected readonly themeService = inject(ThemeService);
}
