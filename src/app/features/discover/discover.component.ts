import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  EventCategory,
  GoEvent,
} from '../../core/models/event.model';

type TimeFilter = 'all' | 'today' | 'weekend';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.scss',
})
export class DiscoverComponent {
  private readonly eventService = inject(EventService);

  readonly categories = CATEGORIES;
  readonly categoryLabels = CATEGORY_LABELS;

  readonly search = signal('');
  readonly time = signal<TimeFilter>('all');
  readonly freeOnly = signal(false);
  readonly activeCategories = signal<Set<EventCategory>>(new Set());

  /** Alle sichtbaren Events (published + zukünftig), aus EventService. */
  private readonly events = this.eventService.allVisible;

  readonly filtered = computed<GoEvent[]>(() => {
    const q = this.search().trim().toLowerCase();
    const time = this.time();
    const freeOnly = this.freeOnly();
    const cats = this.activeCategories();

    return this.events().filter((event) => {
      if (cats.size > 0 && !cats.has(event.category)) return false;
      if (freeOnly && event.price !== 0) return false;
      if (!this.matchesTime(event, time)) return false;
      if (q && !this.matchesText(event, q)) return false;
      return true;
    });
  });

  toggleCategory(cat: EventCategory): void {
    this.activeCategories.update((set) => {
      const next = new Set(set);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  setTime(value: TimeFilter): void {
    this.time.update((current) => (current === value ? 'all' : value));
  }

  toggleFree(): void {
    this.freeOnly.update((v) => !v);
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  private matchesText(event: GoEvent, q: string): boolean {
    return (
      event.title.toLowerCase().includes(q) ||
      event.locationName.toLowerCase().includes(q) ||
      event.district.toLowerCase().includes(q) ||
      event.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  private matchesTime(event: GoEvent, filter: TimeFilter): boolean {
    if (filter === 'all') return true;
    const start = new Date(event.start);
    const now = new Date();
    if (filter === 'today') {
      return start.toDateString() === now.toDateString();
    }
    // weekend = Freitag ab 18:00 bis Sonntag 23:59, relativ zu heute
    const dow = start.getDay();
    const isFriEvening = dow === 5 && start.getHours() >= 18;
    return isFriEvening || dow === 6 || dow === 0;
  }
}
