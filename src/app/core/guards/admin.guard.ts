import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { filter, map, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { GoUser } from '../models/user.model';

/**
 * Schützt Admin-Routen. Lässt nur eingeloggte User mit isAdmin=true rein.
 * Alle anderen werden zur Startseite umgeleitet.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const firestore = inject(Firestore);
  const router = inject(Router);

  return toObservable(authService.user).pipe(
    filter((user) => user !== undefined),
    take(1),
    switchMap((user) => {
      if (!user) {
        router.navigate(['/']);
        return [false];
      }
      return docData(doc(firestore, `users/${user.uid}`)).pipe(
        take(1),
        map((data) => {
          const isAdmin = (data as GoUser | undefined)?.isAdmin === true;
          if (!isAdmin) router.navigate(['/']);
          return isAdmin;
        }),
      );
    }),
  );
};