import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './saved.component.html',
  styleUrl: './saved.component.scss',
})
export class SavedComponent {
  private readonly eventService = inject(EventService);

  readonly saved = this.eventService.saved;

  remove(eventId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.eventService.removeLike(eventId);
  }
}
