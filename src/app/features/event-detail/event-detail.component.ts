import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { CATEGORY_LABELS, GoEvent } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent {
  private readonly eventService = inject(EventService);
  private readonly location = inject(Location);

  /** Kommt aus der Route dank withComponentInputBinding() */
  readonly id = input.required<string>();

  readonly event = computed<GoEvent | undefined>(() => this.eventService.getById(this.id()));
  readonly categoryLabel = computed(() => {
    const e = this.event();
    return e ? CATEGORY_LABELS[e.category] : '';
  });

  /** Aktueller Swipe-Status für dieses Event: 'like', 'dislike' oder null. */
  readonly currentSwipe = computed<'like' | 'dislike' | null>(() => {
    const id = this.id();
    const swipe = this.eventService.effectiveSwipes().find((s) => s.eventId === id);
    return swipe?.direction ?? null;
  });

  back(): void {
    this.location.back();
  }

  async share(): Promise<void> {
    const e = this.event();
    if (!e) return;
    const shareData = {
      title: e.title,
      text: `${e.title} – ${e.locationName}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Nutzer hat abgebrochen – kein Fehler
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      // TODO: Toast "Link kopiert" statt alert
      alert('Link kopiert');
    }
  }

  async toggleLike(): Promise<void> {
    if (this.currentSwipe() === 'like') {
      await this.eventService.removeLike(this.id());
    } else {
      await this.eventService.swipe(this.id(), 'like');
    }
  }

}
