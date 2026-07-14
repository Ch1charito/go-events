# Go – Event Discovery (MVP)

Swipe-basierte Event-Entdeckung für München. Angular 19, Standalone Components, Signals.

## Status

Fundament mit Dummy-Daten – lauffähig ohne Backend. Firebase-Anbindung folgt (TODO-Marker im Code).

## Starten

```
npm install
npm start
```

## Struktur

```
src/app/
  core/
    models/      Event, User, Swipe Interfaces
    services/    EventService (Signals, Feed/Merkliste/Matching)
  features/
    feed/        Swipe-Stack (Pointer Events)
    saved/       Merkliste
    event-detail/
    not-found/   404 (Wildcard-Route)
  shared/
    components/event-card/
```

## Nächste Schritte

1. Firebase-Projekt anlegen (Auth, Firestore, Storage) + @angular/fire installieren
2. EventService auf Firestore umstellen (TODO-Marker)
3. Auth (E-Mail + Google) und Gast-Modus
4. Filter (Zeitraum, Kategorie, Viertel)
5. Deployment All-Inkl (.htaccess für Angular-Routing)
