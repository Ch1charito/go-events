import { ChangeDetectionStrategy, Component, computed, inject, Injector, runInInjectionContext } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { of, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { GoUser } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly injector = inject(Injector);
  private readonly authService = inject(AuthService);
  private readonly eventService = inject(EventService);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);

  readonly user = this.authService.user;

  private readonly userDoc = toSignal(
    toObservable(this.authService.user).pipe(
      switchMap((user) => {
        if (!user) return of<GoUser | undefined>(undefined);
        return runInInjectionContext(this.injector, () =>
          docData(doc(this.firestore, `users/${user.uid}`)) as import('rxjs').Observable<GoUser>,
        );
      }),
    ),
    { initialValue: undefined },
  );

  readonly displayName = computed(() => this.userDoc()?.displayName ?? this.user()?.displayName ?? 'Nutzer');
  readonly email = computed(() => this.userDoc()?.email ?? this.user()?.email ?? '');
  readonly isAdmin = computed(() => this.userDoc()?.isAdmin === true);

  /** Top 5 Tags/Kategorien mit positivem Score, absteigend sortiert. */
  readonly topInterests = computed(() => {
    const scores = this.eventService.tagScores();
    return Object.entries(scores)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
  });

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
