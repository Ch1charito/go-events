# Go Events – Projekt-Journal

## Session 1
- Projektidee festgelegt: Swipe-basierte Event-Discovery (München, Nightlife zuerst)
- MVP-Scope definiert, Datenmodell entworfen (Events, Users, Swipes, Tags)
- Design: Dark Theme, Akzent Violett, Tokens festgelegt
- Angular-19-Scaffold: Feed mit Swipe-Logik (Pointer Events), Merkliste,
  Detailseite, 404, Bottom-Nav – lauffähig mit Dummy-Daten

## Session 2
- GitHub-Repo go-events angelegt (public), Branch-Workflow aufgesetzt
- Firebase-Projekt erstellt: Auth (E-Mail + Google), Firestore (europe-west3, Testmodus)
- @angular/fire@19 integriert, environment-Config (nicht im Repo)
- EventService auf Firestore umgestellt (collectionData + toSignal), Composite Index angelegt
- Dummy-Events nach Firestore geseedet, feature/firebase in main gemerged

## Session 3
- feature/auth abgeschlossen und nach main gemerged
- AuthService gebaut: Registrierung, Login, Google-Login, Logout
  (E-Mail + Google), User-Signal via toSignal, User-Dokument in Firestore
- Login/Registrieren-Seite mit Reactive Forms, Umschalter, Fehler-Mapping,
  Gast-Modus
- Injection-Context-Problem gelöst: run()-Helper wrappt jeden Firebase-Aufruf
  in runInInjectionContext (nötig, weil await den Kontext zerstört)
- Navbar reagiert auf Login-Zustand (Login <-> Profil + Logout), Hover-States

## Session 4
- feature/swipes-sync: Swipes pro User in Firestore-Subcollection users/{uid}/swipes
- Reaktives Muster mit toObservable(user) + switchMap für User-Wechsel
- Injection-Context-Regel vertieft: alles aus @angular/fire (auch collection()/query())
  muss in run()-Wrap; Sonderfall Promise.all mit map (Wrap innen an jedem Call)
- Share-Frage geklärt: Detailseite reicht, Card bleibt swipe-only

## Session 5
- fix/guest-swipes: Bug behoben — als Gast blieb Karte nach Swipe hängen
  weil Firestore-Aufruf ohne User früh returnt
- Lokales guestSwipes-Signal + effectiveSwipes computed als saubere Trennung
  Gast (lokal, flüchtig) vs. User (Firestore, persistent)

## Session 6
- feature/security-rules: echte Firestore Rules deployed
- Events lesen offen, schreiben nur Admin (isAdmin-Feld am User)
- User-Doc-Rules verhindern Selbstermächtigung (create ohne isAdmin, update
  darf isAdmin nicht ändern)
- isAdmin nur über Firebase Console setzbar
- Rules zusätzlich als firestore.rules im Repo (versioniert, Portfolio-relevant)
- Rules Playground genutzt zur Verifikation

## Session 7
- feature/admin: kompletter Admin-Bereich
- AdminGuard: prüft Login-Status via authState() + isAdmin aus Firestore
  (authState statt user-Signal, damit Reload/Direktaufruf funktionieren)
- AdminService mit CRUD (create/update/delete) für Events
- Route /admin mit Guard, versteckt (kein Navbar-Link — später über Profil)
- Split-Layout: Liste links (sortierbar nach Datum/Titel/Kategorie), Formular rechts
- Reactive Form mit allen Event-Feldern, Validierung
- Klick auf Event → Formular vorbefüllt (edit-Modus), "Neues Event" leert
- allEvents-Signal im EventService (ungefiltert für Admin, auch Drafts/vergangene)
- datetime-local + eigener ISO↔Local-Konverter für Formular-Datum
- Löschen mit deutlichem UX-Signal (roter Papierkorb + confirm mit Titel)
- Responsive Fixes: Navbar bis 280px, Admin-Grid ohne Overflow-Zone,
  sticky Header im Admin