import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './topbar/admin-topbar.component';
import { Breadcrumb } from './sidebar/nav.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminTopbarComponent],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  protected readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Admin', route: '/admin' },
    { label: 'Dashboard' },
  ];
}
