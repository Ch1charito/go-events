export type EventCategory =
  | 'club'
  | 'bar'
  | 'konzert'
  | 'festival'
  | 'open-air'
  | 'kultur'
  | 'markt'
  | 'sport'
  | 'sonstiges';

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  'club': 'Club / Party',
  'bar': 'Bar-Event',
  'konzert': 'Konzert',
  'festival': 'Festival',
  'open-air': 'Open Air',
  'kultur': 'Kultur',
  'markt': 'Markt / Flohmarkt',
  'sport': 'Sport',
  'sonstiges': 'Sonstiges',
};

export interface GoEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: EventCategory;
  tags: string[];
  /** Startzeitpunkt als ISO-String, in Firestore später Timestamp */
  start: string;
  /** Optionales Ende (Flohmarkt, Festival) */
  end?: string;
  locationName: string;
  address: string;
  district: string;
  geo?: { lat: number; lng: number };
  /** 0 = frei, undefined = unbekannt */
  price?: number;
  /** Freitext, z.B. "Frauen freier Eintritt bis 23 Uhr" */
  priceNote?: string;
  minAge?: number;
  organizerName: string;
  organizerLink?: string;
  status: 'draft' | 'published';
  createdAt: string;
}
