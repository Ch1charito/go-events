import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  query,
  where,
  orderBy,
} from '@angular/fire/firestore';
import { GoEvent } from '../models/event.model';
import { Swipe, SwipeDirection } from '../models/swipe.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly firestore = inject(Firestore);

  /** Events aus Firestore: nur published, nur ab heute, nach Start sortiert */
  private readonly events = toSignal(
    collectionData(
      query(
        collection(this.firestore, 'events'),
        where('status', '==', 'published'),
        where('start', '>=', new Date().toISOString()),
        orderBy('start'),
      ),
      { idField: 'id' },
    ),
    { initialValue: [] },
  ) as import('@angular/core').Signal<GoEvent[]>;

  /** Swipes: vorerst weiter lokal, wird mit Auth auf Firestore umgestellt */
  private readonly swipes = signal<Swipe[]>([]);

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

  swipe(eventId: string, direction: SwipeDirection): void {
    this.swipes.update((list) => [
      ...list,
      { userId: 'local', eventId, direction, timestamp: new Date().toISOString() },
    ]);
  }

  removeLike(eventId: string): void {
    this.swipes.update((list) => list.filter((s) => s.eventId !== eventId));
  }

  /** Nur für die Übergangszeit: Dummy-Events nach Firestore importieren */
  async seedDummyData(events: Omit<GoEvent, 'id'>[]): Promise<void> {
    const ref = collection(this.firestore, 'events');
    for (const event of events) {
      await addDoc(ref, event);
    }
  }

  private score(event: GoEvent): number {
    const scores = this.tagScores();
    return [...event.tags, event.category].reduce((sum, tag) => sum + (scores[tag] ?? 0), 0);
  }
}