import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/admin-login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/orders.component').then(m => m.OrdersComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/products.component').then(m => m.ProductsComponent),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./products/product-edit/product-edit.component').then(m => m.ProductEditComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/categories.component').then(m => m.CategoriesComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
