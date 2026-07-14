import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CATEGORY_LABELS, GoEvent } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.scss',
})
export class EventCardComponent {
  readonly event = input.required<GoEvent>();

  readonly categoryLabel = computed(() => CATEGORY_LABELS[this.event().category]);

  readonly priceLabel = computed(() => {
    const price = this.event().price;
    if (price === undefined) return null;
    return price === 0 ? 'frei' : `${price}€`;
  });
}
