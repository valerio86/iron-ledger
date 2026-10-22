# Iron Ledger (standalone)

The Iron Ledger lifting log, moved out of its claude.ai artifact into a plain web app (PWA) with no build step.
The artifact (https://claude.ai/artifact/ASSXwnWp4Mdt7TkzSEKYFL) is unchanged and still the personal version.

Run locally: `python3 -m http.server 8765` in this folder, then open http://127.0.0.1:8765/.

## Layout
- `index.html`: shell, manifest and service-worker registration
- `src/app.js`: the app (catalog, coach, rendering), carried over from the artifact
- `src/setup.js`: first-run setup, equipment-aware starter routines, manual cardio and weigh-ins (`body/<day>`)
- `src/sync.js`: optional account + sync (Firebase Auth + Firestore, loaded from gstatic). Config in `src/firebase-config.js`, rules in `firestore.rules`
- `src/store.js`: on-device store (IndexedDB) with the artifact db's Firestore-like API (`collection().onSnapshot`, `doc().set/delete`), plus `dump`/`restore` for backups
- `sw.js`: offline cache. Bump `VERSION` whenever a shell file changes
- `tools/make_icons.py`: rebuilds the PNG icons

## Roadmap
1. **Done: local-first PWA.** Works offline and installs to the home screen. Backup is a file download, and restore accepts this format or the artifact's old JSON export. Strava/Garmin are shown as "later".
2. **Done: onboarding + de-personalising.** Six-question first-run setup (units, bodyweight, goal, equipment, lifting days + starter template, cardio). Templates pick exercises by slot from what your gear allows. Manual cardio and weigh-ins replace Strava/Garmin. Cardio wording follows your types. New users get 15.5 kcal/lb maintenance (artifact data keeps 17.5). The first 6 lifting sessions run routines as written (no top-ups or cardio add-ons). Restored artifact data skips setup and keeps its old defaults (row/run, bulk).
3. **Accounts + sync (built, waiting for config).** Google or email/password sign-in. The device stays the source of truth; each change is pushed to `users/{uid}/docs`, and other devices' changes are pulled by server timestamp. Newer edit wins per doc. Signing out wipes the device copy. Hosted on GitHub Pages: https://valerio86.github.io/iron-ledger/
4. **Strava.** OAuth via a small token-exchange function (Cloudflare Worker or Firebase Function). The app needs Strava's review before more than one athlete can connect.
5. **Ship.** Domain, privacy policy, "not medical advice" note, real tests (port the headless harness).
Later: Capacitor wrapper for Apple Health / Health Connect, which is the legitimate route to Garmin-type data.
