import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'check-email',
    loadComponent: () => import('./features/login/check-email.component').then(m => m.CheckEmailComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/login/verify-email.component').then(m => m.VerifyEmailComponent),
  },
  {
    path: 'terminos',
    loadComponent: () => import('./features/legal/terms.component').then(m => m.TermsComponent),
  },
  {
    path: 'privacidad',
    loadComponent: () => import('./features/legal/privacy.component').then(m => m.PrivacyComponent),
  },
  {
    path: '',
    loadComponent: () => import('./features/layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'productos/:id',
        loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
      },
      {
        path: 'guias/:slug',
        loadComponent: () => import('./features/article/article-detail.component').then(m => m.ArticleDetailComponent),
      },
      {
        path: 'carrito',
        loadComponent: () => import('./features/checkout/cart/cart.component').then(m => m.CartComponent),
      },
    ],
  },
  {
    path: 'checkout/envio',
    loadComponent: () => import('./features/checkout/checkout-shipping/checkout-shipping.component').then(m => m.CheckoutShippingComponent),
  },
  {
    path: 'checkout/pago',
    loadComponent: () => import('./features/checkout/mp-handoff/mp-handoff.component').then(m => m.MPHandoffComponent),
  },
  {
    path: 'checkout/confirmacion',
    loadComponent: () => import('./features/checkout/order-success/order-success.component').then(m => m.OrderSuccessComponent),
  },
  {
    path: 'checkout/error',
    loadComponent: () => import('./features/checkout/order-failure/order-failure.component').then(m => m.OrderFailureComponent),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
