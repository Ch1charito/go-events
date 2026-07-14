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