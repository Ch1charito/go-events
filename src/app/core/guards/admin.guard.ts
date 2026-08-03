import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { authState } from '@angular/fire/auth';
import { Auth } from '@angular/fire/auth';
import { map, switchMap, take } from 'rxjs';
import { GoUser } from '../models/user.model';

/**
 * Schützt Admin-Routen. Lässt nur eingeloggte User mit isAdmin=true rein.
 * Alle anderen werden zur Startseite umgeleitet.
 *
 * Nutzt authState() direkt statt des user-Signals, weil authState
 * beim ersten Emit auf die Wiederherstellung des Login-Zustands wartet
 * (nach Reload/Direktaufruf sonst kurz null).
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);

  return authState(auth).pipe(
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