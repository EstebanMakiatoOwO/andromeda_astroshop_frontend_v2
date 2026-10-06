import { Routes } from '@angular/router';
import { ecommerceGuard } from './core/guards/ecommerce.guard';
// Eager: shell + the two real entry pages ("/" redirects to /conocenos when
// ecommerce is off). Lazy-loading them chained main.js → layout chunk →
// page chunk → shared deps, adding ~2s of render delay on slow 4G. As
// static imports they land in the initial bundle and get <link rel=modulepreload>
// in index.html, so the browser fetches them in parallel from the first byte.
import { PublicLayoutComponent } from './features/layout/public-layout.component';
import { HomeComponent } from './features/home/home.component';
import { ConocenosComponent } from './features/landing/conocenos.component';

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
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'productos/:id',
        canActivate: [ecommerceGuard],
        loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
      },
      {
        path: 'guias',
        loadComponent: () => import('./features/landing/guias-list.component').then(m => m.GuiasListComponent),
      },
      {
        path: 'guias/:slug',
        loadComponent: () => import('./features/article/article-detail.component').then(m => m.ArticleDetailComponent),
      },
      {
        path: 'conocenos',
        component: ConocenosComponent,
      },
      {
        path: 'contacto',
        loadComponent: () => import('./features/landing/contacto.component').then(m => m.ContactoComponent),
      },
      {
        path: 'galeria',
        loadComponent: () => import('./features/landing/galeria.component').then(m => m.GaleriaComponent),
      },
      {
        path: 'eventos',
        loadComponent: () => import('./features/landing/eventos.component').then(m => m.EventosComponent),
      },
      {
        path: 'astroshop',
        loadComponent: () => import('./features/landing/astroshop-page.component').then(m => m.AstroshopPageComponent),
      },
      {
        path: 'astroturismo',
        loadComponent: () => import('./features/landing/astroturismo-page.component').then(m => m.AstroturismoPageComponent),
      },
      {
        path: 'astrodome',
        loadComponent: () => import('./features/landing/astrodome-page.component').then(m => m.AstrodomePageComponent),
      },
      {
        path: 'rancho',
        loadComponent: () => import('./features/landing/rancho-colaboracion.component').then(m => m.RanchoColaboracionComponent),
      },
      {
        path: 'catalogo',
        canActivate: [ecommerceGuard],
        loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
      },
      {
        path: 'carrito',
        canActivate: [ecommerceGuard],
        loadComponent: () => import('./features/checkout/cart/cart.component').then(m => m.CartComponent),
      },
    ],
  },
  {
    path: 'checkout/envio',
    canActivate: [ecommerceGuard],
    loadComponent: () => import('./features/checkout/checkout-shipping/checkout-shipping.component').then(m => m.CheckoutShippingComponent),
  },
  {
    path: 'checkout/pago',
    canActivate: [ecommerceGuard],
    loadComponent: () => import('./features/checkout/mp-handoff/mp-handoff.component').then(m => m.MPHandoffComponent),
  },
  {
    path: 'checkout/confirmacion',
    canActivate: [ecommerceGuard],
    loadComponent: () => import('./features/checkout/order-success/order-success.component').then(m => m.OrderSuccessComponent),
  },
  {
    path: 'checkout/error',
    canActivate: [ecommerceGuard],
    loadComponent: () => import('./features/checkout/order-failure/order-failure.component').then(m => m.OrderFailureComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
