import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { EventService } from '../../core/services/event.service';
import { DatePipe } from '@angular/common';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  EventCategory,
  GoEvent,
} from '../../core/models/event.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly eventService = inject(EventService);

  readonly categories = CATEGORIES;
  readonly categoryLabels = CATEGORY_LABELS;

  /** null = neues Event, sonst wird das bestehende bearbeitet */
  readonly editingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly message = signal<string | null>(null);

  readonly heading = computed(() =>
    this.editingId() ? 'Event bearbeiten' : 'Neues Event',
  );

  readonly sortBy = signal<'start' | 'title' | 'category'>('start');

  readonly sortedEvents = computed(() => {
    const events = [...this.eventService.allEvents()];
    const key = this.sortBy();
    return events.sort((a, b) => {
      if (key === 'start') return b.start.localeCompare(a.start); // neueste zuerst
      if (key === 'title') return a.title.localeCompare(b.title);
      return a.category.localeCompare(b.category);
    });
  });

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    imageUrl: ['', [Validators.required]],
    category: ['club' as EventCategory, [Validators.required]],
    tags: [''], // komma-separiert im Input, Array beim Speichern
    start: ['', [Validators.required]],
    end: [''],
    locationName: ['', [Validators.required]],
    address: ['', [Validators.required]],
    district: ['', [Validators.required]],
    price: [null as number | null],
    priceNote: [''],
    minAge: [null as number | null],
    organizerName: ['', [Validators.required]],
    organizerLink: [''],
    status: ['published' as 'draft' | 'published', [Validators.required]],
  });

  resetForm(): void {
    this.editingId.set(null);
    this.message.set(null);
    this.form.reset({
      title: '',
      description: '',
      imageUrl: '',
      category: 'club',
      tags: '',
      start: '',
      end: '',
      locationName: '',
      address: '',
      district: '',
      price: null,
      priceNote: '',
      minAge: null,
      organizerName: '',
      organizerLink: '',
      status: 'published',
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.message.set(null);

    try {
      const raw = this.form.getRawValue();
      const data: Omit<GoEvent, 'id'> = {
        title: raw.title.trim(),
        description: raw.description.trim(),
        imageUrl: raw.imageUrl.trim(),
        category: raw.category,
        tags: raw.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        // datetime-local liefert 'YYYY-MM-DDTHH:mm' ohne Zeitzone → in ISO wandeln
        start: new Date(raw.start).toISOString(),
        ...(raw.end ? { end: new Date(raw.end).toISOString() } : {}),
        locationName: raw.locationName.trim(),
        address: raw.address.trim(),
        district: raw.district.trim(),
        ...(raw.price !== null ? { price: raw.price } : {}),
        ...(raw.priceNote.trim() ? { priceNote: raw.priceNote.trim() } : {}),
        ...(raw.minAge !== null ? { minAge: raw.minAge } : {}),
        organizerName: raw.organizerName.trim(),
        ...(raw.organizerLink.trim() ? { organizerLink: raw.organizerLink.trim() } : {}),
        status: raw.status,
        createdAt: new Date().toISOString(),
      };

      const id = this.editingId();
      if (id) {
        await this.adminService.updateEvent(id, data);
        this.message.set('Event aktualisiert.');
      } else {
        await this.adminService.createEvent(data);
        this.message.set('Event angelegt.');
        this.resetForm();
      }
    } catch (err) {
      console.error(err);
      this.message.set('Fehler beim Speichern.');
    } finally {
      this.saving.set(false);
    }
  }

  edit(event: GoEvent): void {
    this.editingId.set(event.id);
    this.message.set(null);
    this.form.reset({
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl,
      category: event.category,
      tags: event.tags.join(', '),
      start: this.toLocalInput(event.start),
      end: event.end ? this.toLocalInput(event.end) : '',
      locationName: event.locationName,
      address: event.address,
      district: event.district,
      price: event.price ?? null,
      priceNote: event.priceNote ?? '',
      minAge: event.minAge ?? null,
      organizerName: event.organizerName,
      organizerLink: event.organizerLink ?? '',
      status: event.status,
    });
  }

  async delete(event: GoEvent): Promise<void> {
    if (!confirm(`Event "${event.title}" wirklich löschen?`)) return;
    try {
      await this.adminService.deleteEvent(event.id);
      if (this.editingId() === event.id) this.resetForm();
      this.message.set('Event gelöscht.');
    } catch (err) {
      console.error(err);
      this.message.set('Fehler beim Löschen.');
    }
  }

  /** ISO 'YYYY-MM-DDTHH:mm:ss.sssZ' → 'YYYY-MM-DDTHH:mm' für datetime-local */
  private toLocalInput(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
