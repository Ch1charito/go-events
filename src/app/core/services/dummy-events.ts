import { GoEvent } from '../models/event.model';

/** Platzhalter-Bilder über picsum (später Firebase Storage URLs) */
const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/1000`;

const nextFriday = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  return d;
};

const at = (base: Date, offsetDays: number, hour: number): string => {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const fr = nextFriday();

export const DUMMY_EVENTS: GoEvent[] = [
  {
    id: 'ev-001',
    title: 'Techno Nacht',
    description:
      'Zwei Floors, lokale DJs und ein Lineup bis in die Morgenstunden. Einlass ab 23 Uhr, danach wird es voll.',
    imageUrl: img('techno'),
    category: 'club',
    tags: ['Techno', 'Underground'],
    start: at(fr, 0, 23),
    locationName: 'Kellerclub M',
    address: 'Sonnenstraße 12, 80331 München',
    district: 'Innenstadt',
    price: 15,
    minAge: 18,
    organizerName: 'Kellerclub M',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ev-002',
    title: 'Rooftop Opening',
    description:
      'Saisoneröffnung der Dachterrasse mit DJ-Set, Aperitivo und Blick über die Stadt. Bei Regen fällt es aus.',
    imageUrl: img('rooftop'),
    category: 'bar',
    tags: ['Open Air', 'House', 'Aperitivo'],
    start: at(fr, 1, 19),
    locationName: 'Skybar 21',
    address: 'Müllerstraße 21, 80469 München',
    district: 'Glockenbach',
    price: 0,
    priceNote: 'Eintritt frei, Tischreservierung empfohlen',
    organizerName: 'Skybar 21',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ev-003',
    title: 'Hip-Hop Friday',
    description: '90s & 2000s Hip-Hop, R&B Specials an der Bar, Dresscode locker.',
    imageUrl: img('hiphop'),
    category: 'club',
    tags: ['Hip-Hop', 'R&B'],
    start: at(fr, 0, 22),
    locationName: 'Club Neon',
    address: 'Maximiliansplatz 5, 80333 München',
    district: 'Maxvorstadt',
    price: 10,
    priceNote: 'Frauen frei bis 23 Uhr',
    minAge: 18,
    organizerName: 'Club Neon',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ev-004',
    title: 'Indie-Konzert: Fallhöhe',
    description:
      'Lokale Indie-Band mit Support-Act. Kleines Venue, Tickets an der Abendkasse solange Vorrat.',
    imageUrl: img('konzert'),
    category: 'konzert',
    tags: ['Indie', 'Live'],
    start: at(fr, 1, 20),
    locationName: 'Backstage Halle',
    address: 'Reitknechtstraße 6, 80639 München',
    district: 'Neuhausen',
    price: 18,
    organizerName: 'Backstage',
    organizerLink: 'https://backstage.eu',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ev-005',
    title: 'Flohmarkt am Ostbahnhof',
    description:
      'Vintage, Platten und Streetfood. Ganztags, Hunde erlaubt, Eintritt frei.',
    imageUrl: img('flohmarkt'),
    category: 'markt',
    tags: ['Vintage', 'Streetfood', 'Familie'],
    start: at(fr, 2, 9),
    end: at(fr, 2, 16),
    locationName: 'Kultfabrik Gelände',
    address: 'Grafinger Straße 6, 81671 München',
    district: 'Berg am Laim',
    price: 0,
    organizerName: 'Flohmarkt München e.V.',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ev-006',
    title: 'Salsa Open Air',
    description:
      'Tanzabend am Flussufer mit Schnupperkurs um 19 Uhr. Kostenlos, gute Laune mitbringen.',
    imageUrl: img('salsa'),
    category: 'open-air',
    tags: ['Salsa', 'Tanzen', 'kostenlos'],
    start: at(fr, 2, 18),
    locationName: 'Isarufer / Reichenbachbrücke',
    address: 'Erhardtstraße, 80469 München',
    district: 'Isarvorstadt',
    price: 0,
    organizerName: 'Salsa Community München',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
];
