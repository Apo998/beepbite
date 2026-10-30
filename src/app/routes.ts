import { inject } from '@angular/core';
import { type CanActivateFn, Router, Routes } from '@angular/router';
import { type Role } from './shared/data';
import { Session } from './shared/session';

// Mirrors the backend's role guards: each area only opens for its role.
const only = (role: Role): CanActivateFn => () => {
  const user = Session.user();
  const router = inject(Router);
  if (!user) return router.parseUrl(Session.stale() ? `/auth/callback?state=expired&role=${role}` : '/login');
  return user.role === role || router.parseUrl(`/auth/callback?state=denied&role=${user.role}`);
};
const customer = only('CUSTOMER'), restaurant = only('RESTAURANT'), admin = only('ADMIN');

// Old design URLs. Detail screens take ?id=…, and open the list without one.
const legacy: [string, string, boolean?][] = [
  ['screens/public/P-01-landing', '/'],
  ['screens/auth/AU-01-login', '/login'],
  ['screens/auth/AU-02-register', '/register'],
  ['screens/auth/AU-03-callback', '/auth/callback'],
  ['screens/customer/C-01-home', '/customer'],
  ['screens/customer/C-04-history', '/customer/orders'],
  ['screens/customer/C-02-order-tracker', '/customer/orders', true],
  ['screens/customer/C-03-ready', '/customer/ready'],
  ['screens/customer/C-05-profile', '/customer/profile'],
  ['screens/restaurant/R-01-new-order', '/restaurant/orders/new'],
  ['screens/restaurant/R-02-board', '/restaurant/orders'],
  ['screens/restaurant/R-03-order-detail', '/restaurant/orders', true],
  ['screens/restaurant/R-04-account', '/restaurant/account'],
  ['screens/admin/AD-01-restaurants', '/admin/restaurants'],
  ['screens/admin/AD-02-add-restaurant', '/admin/restaurants/new'],
  ['screens/admin/AD-03-restaurant-detail', '/admin/restaurants', true],
  ['screens/shared/S-04-not-found', '/not-found'],
];

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./public/landing/landing').then(m => m.LandingPage) },
  { path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./auth/register/register').then(m => m.RegisterPage) },
  { path: 'forgot-password', loadComponent: () => import('./auth/forgot-password/forgot-password').then(m => m.ForgotPasswordPage) },
  { path: 'reset-password', loadComponent: () => import('./auth/reset-password/reset-password').then(m => m.ResetPasswordPage) },
  { path: 'support', loadComponent: () => import('./public/support/support').then(m => m.SupportPage) },
  { path: 'auth/callback', loadComponent: () => import('./auth/callback/callback').then(m => m.CallbackPage) },
  { path: 'customer', canActivate: [customer], loadComponent: () => import('./customer/home/home').then(m => m.HomePage) },
  { path: 'customer/orders', canActivate: [customer], loadComponent: () => import('./customer/history/history').then(m => m.HistoryPage) },
  { path: 'customer/orders/:id', canActivate: [customer], loadComponent: () => import('./customer/order-tracker/order-tracker').then(m => m.OrderTrackerPage) },
  { path: 'customer/ready', canActivate: [customer], loadComponent: () => import('./customer/ready/ready').then(m => m.ReadyPage) },
  { path: 'customer/profile', canActivate: [customer], loadComponent: () => import('./customer/profile/profile').then(m => m.ProfilePage) },
  { path: 'restaurant/orders/new', canActivate: [restaurant], loadComponent: () => import('./restaurant/new-order/new-order').then(m => m.NewOrderPage) },
  { path: 'restaurant/orders', canActivate: [restaurant], loadComponent: () => import('./restaurant/board/board').then(m => m.BoardPage) },
  { path: 'restaurant/orders/:id', canActivate: [restaurant], loadComponent: () => import('./restaurant/order-detail/order-detail').then(m => m.OrderDetailPage) },
  { path: 'restaurant/account', canActivate: [restaurant], loadComponent: () => import('./restaurant/account/account').then(m => m.AccountPage) },
  { path: 'admin/restaurants', canActivate: [admin], loadComponent: () => import('./admin/restaurants/restaurants').then(m => m.RestaurantsPage) },
  { path: 'admin/restaurants/new', canActivate: [admin], loadComponent: () => import('./admin/add-restaurant/add-restaurant').then(m => m.AddRestaurantPage) },
  { path: 'admin/restaurants/:id', canActivate: [admin], loadComponent: () => import('./admin/restaurant-detail/restaurant-detail').then(m => m.RestaurantDetailPage) },
  { path: 'not-found', loadComponent: () => import('./shared/not-found/not-found').then(m => m.NotFoundPage) },
  ...legacy.map(([path, target, takesId]) => ({
    path,
    pathMatch: 'full' as const,
    redirectTo: ({ queryParams, fragment }) => {
      const { id, ...rest } = queryParams;
      return inject(Router).createUrlTree(
        takesId && id ? [target, id] : [target],
        { queryParams: takesId ? rest : queryParams, fragment: fragment ?? undefined }
      );
    }
  } satisfies Routes[number])),
  { path: '**', loadComponent: () => import('./shared/not-found/not-found').then(m => m.NotFoundPage) }
];
