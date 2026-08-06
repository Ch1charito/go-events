import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  updateDoc,
} from '@angular/fire/firestore';
import { GoEvent } from '../models/event.model';

/**
 * CRUD für Events. Zugriff nur für Admins (Route ist per Guard geschützt,
 * Schreibrechte durch Firestore-Rules zusätzlich serverseitig abgesichert).
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly injector = inject(Injector);
  private readonly firestore = inject(Firestore);

  /** Neues Event anlegen. Firestore vergibt die ID automatisch. */
  async createEvent(data: Omit<GoEvent, 'id'>): Promise<string> {
    const ref = await this.run(() =>
      addDoc(collection(this.firestore, 'events'), data),
    );
    return ref.id;
  }

  /** Bestehendes Event ändern. Partial = nur die geänderten Felder mitgeben. */
  async updateEvent(id: string, changes: Partial<Omit<GoEvent, 'id'>>): Promise<void> {
    await this.run(() =>
      updateDoc(doc(this.firestore, `events/${id}`), changes),
    );
  }

  /** Event löschen. */
  async deleteEvent(id: string): Promise<void> {
    await this.run(() =>
      deleteDoc(doc(this.firestore, `events/${id}`)),
    );
  }

  /**
   * Importiert mehrere Events – aber nur, wenn ALLE gültig sind.
   * Findet Validierungsfehler → wirft Error mit Liste, schreibt nichts.
   * Alle gültig → schreibt alle in Firestore.
   */
  async importEvents(events: Omit<GoEvent, 'id'>[]): Promise<number> {
    const errors: { index: number; title: string; message: string }[] = [];

    events.forEach((event, i) => {
      const error = this.validateEvent(event);
      if (error) {
        errors.push({
          index: i + 1,
          title: event.title ?? '(ohne Titel)',
          message: error,
        });
      }
    });

    if (errors.length > 0) {
      const details = errors
        .map((e) => `Event ${e.index} ("${e.title}"): ${e.message}`)
        .join('\n');
      throw new Error(`Import abgebrochen. Fehler:\n${details}`);
    }

    for (const event of events) {
      await this.createEvent(event);
    }

    return events.length;
  }

  /** Prüft ein einzelnes Event auf Pflichtfelder. Gibt Fehlermeldung oder null zurück. */
  private validateEvent(event: Partial<GoEvent>): string | null {
    if (!event.title?.trim()) return 'title fehlt oder leer';
    if (!event.description?.trim()) return 'description fehlt oder leer';
    if (!event.imageUrl?.trim()) return 'imageUrl fehlt oder leer';
    if (!event.category) return 'category fehlt';
    if (!event.start) return 'start fehlt';
    if (isNaN(new Date(event.start).getTime())) return 'start ist kein gültiges Datum';
    if (event.end && isNaN(new Date(event.end).getTime())) return 'end ist kein gültiges Datum';
    if (!event.locationName?.trim()) return 'locationName fehlt';
    if (!event.address?.trim()) return 'address fehlt';
    if (!event.district?.trim()) return 'district fehlt';
    if (!event.organizerName?.trim()) return 'organizerName fehlt';
    if (event.status !== 'draft' && event.status !== 'published') return 'status muss draft oder published sein';
    return null;
  }

  private run<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }
}