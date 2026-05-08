import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './topbar/admin-topbar.component';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  protected readonly bc = inject(BreadcrumbService);
}
