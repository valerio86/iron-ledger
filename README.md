# Iron Ledger (standalone)

The Iron Ledger lifting log, moved out of its claude.ai artifact into a plain web app (PWA) with no build step.
The artifact (https://claude.ai/artifact/ASSXwnWp4Mdt7TkzSEKYFL) is unchanged and still the personal version.

Run locally: `python3 -m http.server 8765` in this folder, then open http://127.0.0.1:8765/.

## Layout
- `index.html`: shell, manifest and service-worker registration
- `src/app.js`: the app (catalog, coach, rendering), carried over from the artifact
- `src/store.js`: on-device store (IndexedDB) with the artifact db's Firestore-like API (`collection().onSnapshot`, `doc().set/delete`), plus `dump`/`restore` for backups
- `sw.js`: offline cache. Bump `VERSION` whenever a shell file changes
- `tools/make_icons.py`: rebuilds the PNG icons

## Roadmap
1. **Done: local-first PWA.** Works offline and installs to the home screen. Backup is a file download, and restore accepts this format or the artifact's old JSON export. Strava/Garmin are shown as "later".
2. **Onboarding + de-personalising.** First-run setup for units, bodyweight, goal (cut/maintain/bulk), equipment, cardio types, starter routine (or blank). Remove assumptions that came from the original user (erg cardio, bulk default, 50 lb cap, plan-specific copy).
3. **Accounts + sync.** Firebase Auth + Firestore is the shortest path: its API is what store.js already imitates, and its offline cache keeps the app local-first.
4. **Strava.** OAuth via a small token-exchange function (Cloudflare Worker or Firebase Function). The app needs Strava's review before more than one athlete can connect.
5. **Ship.** Domain, privacy policy, "not medical advice" note, real tests (port the headless harness).
Later: Capacitor wrapper for Apple Health / Health Connect, which is the legitimate route to Garmin-type data.
