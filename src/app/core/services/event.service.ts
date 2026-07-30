import { Injectable, computed, inject, Injector, runInInjectionContext } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
} from '@angular/fire/firestore';
import { GoEvent } from '../models/event.model';
import { Swipe, SwipeDirection } from '../models/swipe.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly injector = inject(Injector);
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);

  /** Events aus Firestore: nur published, nur ab heute, nach Start sortiert */
  private readonly events = toSignal(
    this.run(() =>
      collectionData(
        query(
          collection(this.firestore, 'events'),
          where('status', '==', 'published'),
          where('start', '>=', new Date().toISOString()),
          orderBy('start'),
        ),
        { idField: 'id' },
      ),
    ),
    { initialValue: [] },
  ) as import('@angular/core').Signal<GoEvent[]>;

  /**
   * Swipes des eingeloggten Users, live aus users/{uid}/swipes.
   * toObservable(user) feuert bei Login/Logout; switchMap wechselt
   * dann die Firestore-Query. Gast (kein User) => leerer Stream.
   */
  private readonly swipes = toSignal(
    toObservable(this.authService.user).pipe(
      switchMap((user) => {
        if (!user) return of<Swipe[]>([]);
        return this.run(() =>
          collectionData(
            collection(this.firestore, `users/${user.uid}/swipes`),
            { idField: 'id' },
          ),
        ) as import('rxjs').Observable<Swipe[]>;
      }),
    ),
    { initialValue: [] },
  );

  readonly feed = computed(() => {
    const swipedIds = new Set(this.swipes().map((s) => s.eventId));
    return this.events()
      .filter((e) => !swipedIds.has(e.id))
      .sort((a, b) => this.score(b) - this.score(a) || a.start.localeCompare(b.start));
  });

  readonly saved = computed(() => {
    const likedIds = new Set(
      this.swipes()
        .filter((s) => s.direction === 'like')
        .map((s) => s.eventId),
    );
    return this.events()
      .filter((e) => likedIds.has(e.id))
      .sort((a, b) => a.start.localeCompare(b.start));
  });

  private readonly tagScores = computed(() => {
    const scores: Record<string, number> = {};
    for (const s of this.swipes()) {
      const event = this.events().find((e) => e.id === s.eventId);
      if (!event) continue;
      const delta = s.direction === 'like' ? 1 : -1;
      for (const tag of [...event.tags, event.category]) {
        scores[tag] = (scores[tag] ?? 0) + delta;
      }
    }
    return scores;
  });

  getById(id: string): GoEvent | undefined {
    return this.events().find((e) => e.id === id);
  }

  /** Swipe speichern. Nur für eingeloggte User; Gäste-Swipes bleiben flüchtig. */
  async swipe(eventId: string, direction: SwipeDirection): Promise<void> {
    const user = this.authService.user();
    if (!user) return;
    await this.run(() =>
      addDoc(collection(this.firestore, `users/${user.uid}/swipes`), {
        eventId,
        direction,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  /** Like entfernen: passendes Swipe-Dokument suchen und löschen. */
  async removeLike(eventId: string): Promise<void> {
    const user = this.authService.user();
    if (!user) return;
    const snapshot = await this.run(() =>
      getDocs(
        query(
          collection(this.firestore, `users/${user.uid}/swipes`),
          where('eventId', '==', eventId),
        ),
      ),
    );
    await Promise.all(
      snapshot.docs.map((d) => this.run(() => deleteDoc(d.ref))),
    );
  }

  private score(event: GoEvent): number {
    const scores = this.tagScores();
    return [...event.tags, event.category].reduce((sum, tag) => sum + (scores[tag] ?? 0), 0);
  }

  private run<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }
}