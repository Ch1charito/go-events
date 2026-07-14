import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { SwipeDirection } from '../../core/models/swipe.model';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';

const SWIPE_THRESHOLD = 100; // px, ab hier zählt der Swipe
const MAX_ROTATION = 12; // Grad bei voller Auslenkung

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [EventCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
})
export class FeedComponent {
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);

  /** Oberste zwei Karten reichen für den Stack-Effekt */
  readonly stack = computed(() => this.eventService.feed().slice(0, 2));
  readonly isEmpty = computed(() => this.eventService.feed().length === 0);

  // Drag-State der obersten Karte
  readonly dragX = signal(0);
  readonly dragY = signal(0);
  readonly isDragging = signal(false);
  /** Karte fliegt gerade raus (Animation läuft) */
  readonly leaving = signal<SwipeDirection | null>(null);

  readonly rotation = computed(() => (this.dragX() / 300) * MAX_ROTATION);
  /** 0..1 – steuert Like/Nope-Badge-Sichtbarkeit */
  readonly likeOpacity = computed(() => Math.min(Math.max(this.dragX() / SWIPE_THRESHOLD, 0), 1));
  readonly nopeOpacity = computed(() => Math.min(Math.max(-this.dragX() / SWIPE_THRESHOLD, 0), 1));

  private startX = 0;
  private startY = 0;
  private moved = false;

  onPointerDown(event: PointerEvent): void {
    if (this.leaving()) return;
    this.isDragging.set(true);
    this.moved = false;
    this.startX = event.clientX;
    this.startY = event.clientY;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) return;
    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) this.moved = true;
    this.dragX.set(dx);
    this.dragY.set(dy * 0.4); // vertikal gedämpft
  }

  onPointerUp(): void {
    if (!this.isDragging()) return;
    this.isDragging.set(false);

    const dx = this.dragX();
    if (dx > SWIPE_THRESHOLD) {
      this.flyOut('like');
    } else if (dx < -SWIPE_THRESHOLD) {
      this.flyOut('dislike');
    } else {
      if (!this.moved) this.openDetail();
      // zurückschnappen
      this.dragX.set(0);
      this.dragY.set(0);
    }
  }

  /** Buttons unter dem Stack */
  swipeByButton(direction: SwipeDirection): void {
    if (this.leaving() || this.isEmpty()) return;
    this.flyOut(direction);
  }

  private flyOut(direction: SwipeDirection): void {
    this.leaving.set(direction);
    this.dragX.set(direction === 'like' ? 600 : -600);

    const topEvent = this.stack()[0];
    setTimeout(() => {
      this.eventService.swipe(topEvent.id, direction);
      this.leaving.set(null);
      this.dragX.set(0);
      this.dragY.set(0);
    }, 250); // muss zur CSS-Transition passen
  }

  private openDetail(): void {
    const topEvent = this.stack()[0];
    if (topEvent) this.router.navigate(['/event', topEvent.id]);
  }
}
