import { Component, inject, input, OnInit, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { OrdersService } from '../../../../core/services/orders.service';
import { AdminPageActionsService } from '../../../../core/services/admin-page-actions.service';
import { Breadcrumb } from '../sidebar/nav.model';
import { NotificationReview } from '../../../../core/models/dashboard.model';
import { SearchBarComponent } from './search-bar.component';
import { NotificationsBellComponent } from './notifications-bell.component';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet, SearchBarComponent, NotificationsBellComponent],
  templateUrl: './admin-topbar.component.html',
})
export class AdminTopbarComponent implements OnInit {
  crumbs = input<Breadcrumb[]>([]);

  protected readonly themeService  = inject(ThemeService);
  protected readonly pageActions   = inject(AdminPageActionsService);
  private  readonly dashSvc        = inject(DashboardService);
  private  readonly ordersSvc      = inject(OrdersService);

  protected readonly notifCount    = signal(0);
  protected readonly notifReviews  = signal<NotificationReview[]>([]);
  protected readonly pendingOrders = signal(0);

  ngOnInit(): void {
    this.dashSvc.getNotifications().subscribe({
      next: n => {
        this.notifCount.set(n.unrepliedReviews);
        this.notifReviews.set(n.reviews);
      },
    });
    this.ordersSvc.getCounts().subscribe({
      next: c => this.pendingOrders.set(c.pending),
    });
  }

  protected onNotifSeen(): void {
    this.notifCount.set(0);
    this.notifReviews.set([]);
  }
}
