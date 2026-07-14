import { Injectable, computed, signal } from '@angular/core';
import { GoEvent } from '../models/event.model';
import { Swipe, SwipeDirection } from '../models/swipe.model';
import { DUMMY_EVENTS } from './dummy-events';

/**
 * Zentraler Event-State.
 *
 * Aktuell: Dummy-Daten im Speicher.
 * TODO (Firebase): Events aus Firestore laden (collection 'events',
 * where status == 'published', where start >= heute), Swipes in
 * collection 'swipes' persistieren.
 */
@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly events = signal<GoEvent[]>(DUMMY_EVENTS);
  private readonly swipes = signal<Swipe[]>([]);

  /** Events, die noch nicht geswiped wurden – der Feed-Stack */
  readonly feed = computed(() => {
    const swipedIds = new Set(this.swipes().map((s) => s.eventId));
    return this.events()
      .filter((e) => e.status === 'published' && !swipedIds.has(e.id))
      .sort((a, b) => this.score(b) - this.score(a) || a.start.localeCompare(b.start));
  });

  /** Merkliste: gelikte Events, nach Datum sortiert */
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

  /** Tag-Gewichtung aus bisherigen Swipes (simples Matching) */
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
    // TODO (Firebase): addDoc in 'swipes' + tagScores am User-Dokument aktualisieren
    this.swipes.update((list) => [
      ...list,
      { userId: 'local', eventId, direction, timestamp: new Date().toISOString() },
    ]);
  }

  removeLike(eventId: string): void {
    this.swipes.update((list) => list.filter((s) => s.eventId !== eventId));
  }

  private score(event: GoEvent): number {
    const scores = this.tagScores();
    return [...event.tags, event.category].reduce((sum, tag) => sum + (scores[tag] ?? 0), 0);
  }
}
