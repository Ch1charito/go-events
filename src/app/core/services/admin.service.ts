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

  private run<T>(fn: () => T): T {
    return runInInjectionContext(this.injector, fn);
  }
}