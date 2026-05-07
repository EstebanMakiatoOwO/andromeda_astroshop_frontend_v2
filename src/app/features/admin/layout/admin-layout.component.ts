import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './topbar/admin-topbar.component';
import { SearchBarComponent } from './topbar/search-bar.component';
import { NotificationsBellComponent } from './topbar/notifications-bell.component';
import { Breadcrumb } from './sidebar/nav.model';
import { DashboardService } from '../../../core/services/dashboard.service';
import { NotificationReview } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebarComponent, AdminTopbarComponent, SearchBarComponent, NotificationsBellComponent],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit {
  private readonly svc = inject(DashboardService);

  protected readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Admin', route: '/admin' },
    { label: 'Dashboard' },
  ];

  protected readonly pendingCount      = signal(0);
  protected readonly unrepliedReviews  = signal(0);
  protected readonly notifReviews      = signal<NotificationReview[]>([]);

  ngOnInit(): void {
    this.svc.getPendingOrdersCount().subscribe({
      next: count => this.pendingCount.set(count),
    });
    this.svc.getNotifications().subscribe({
      next: n => {
        this.unrepliedReviews.set(n.unrepliedReviews);
        this.notifReviews.set(n.reviews ?? []);
      },
    });
  }
}
