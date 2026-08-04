import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/feed/feed.component').then((m) => m.FeedComponent),
    title: 'Go – Feed',
  },
  {
    path: 'saved',
    loadComponent: () =>
      import('./features/saved/saved.component').then((m) => m.SavedComponent),
    title: 'Go – Merkliste',
  },
  {
    path: 'event/:id',
    loadComponent: () =>
      import('./features/event-detail/event-detail.component').then(
        (m) => m.EventDetailComponent,
      ),
    title: 'Go – Event',
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent),
    title: 'Go – Anmelden',
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    title: 'Go – Profil',
  },
  {
    path: 'discover',
    loadComponent: () =>
      import('./features/discover/discover.component').then((m) => m.DiscoverComponent),
    title: 'Go – Entdecken',
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
    title: 'Go – Admin',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Go – Nicht gefunden',
  },
];
