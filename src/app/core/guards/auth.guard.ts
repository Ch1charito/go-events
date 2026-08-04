import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

/**
 * Schützt Routen, die einen eingeloggten User brauchen.
 * Gäste werden zur Auth-Seite umgeleitet.
 */
export const authGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const router = inject(Router);

    return authState(auth).pipe(
        take(1),
        map((user) => {
            if (!user) {
                router.navigate(['/auth']);
                return false;
            }
            return true;
        }),
    );
};