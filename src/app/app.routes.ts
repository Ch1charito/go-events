import { Routes } from '@angular/router';

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
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Go – Nicht gefunden',
  },
];
