# Iron Ledger

A lifting log with a built-in coach. **https://valerio86.github.io/iron-ledger/**

Iron Ledger is a lifting log with a coach that plans each day for you: lift, cardio or rest. It tracks weekly sets per muscle, recovery, joint stress and your weight trend, and adjusts routines to the equipment you own. Strava activities and Garmin recovery data feed in, so runs, rides and rows count toward fatigue and the plan reacts to how recovered you are. Works offline, installs to your phone's home screen, and syncs across devices if you sign in.

- **No food logging.** Calorie and protein targets come from your goal and your weigh-in trend, and adjust every couple of weeks.
- **Equipment-aware.** Tell it what you own; exercises you can't do are swapped, and when you hit the heaviest load you have, progress moves to reps and tempo.
- **Notes that matter.** Write "left knee creaky" or "slept badly" and the day's suggestions adjust.
- **Your data stays yours.** Without an account, everything stays on your device. With one, only you can read it. No ads, no analytics. See the [privacy policy](https://valerio86.github.io/iron-ledger/privacy.html).

Not medical advice: stop if something hurts, and check with a doctor if you have an injury or condition.

## Data from other services

**Strava (coming soon).** Iron Ledger reads your activity list (type, date, duration, distance and relative effort) to estimate muscle fatigue and cardio volume. It only reads; it never posts or changes anything on Strava. Activity data stays in your own account and is deleted when you disconnect or delete your account.

**Garmin.** Garmin has no public API for individual apps, so Garmin data comes in through a script you run on your own computer (`connectors/garmin`, written with a connector key from Library → Connections). It is not available to most users.

## Development

No build step. Serve the folder and open it: `python3 -m http.server 8765`, then http://127.0.0.1:8765/.

- `index.html`: shell, manifest and service-worker registration
- `privacy.html`: privacy policy
- `src/app.js`: catalog, coach and rendering
- `src/setup.js`: first-run setup, equipment-aware starter routines, manual cardio and weigh-ins (`body/<day>`), script connectors (`connectors/<name>`), account UI
- `src/store.js`: on-device store (IndexedDB) with a Firestore-like API, per-doc sync bookkeeping, `dump`/`restore` for backups
- `src/sync.js`: optional account + sync (Firebase Auth + Firestore, loaded from gstatic). Config in `src/firebase-config.js` (public by design), rules in `firestore.rules`
- `sw.js`: offline cache (network first). Bump `VERSION` when the SHELL list changes
- `tools/make_icons.py`: rebuilds the PNG icons

**Sync model.** The device is the source of truth. Each change is pushed to `users/{uid}/docs/{path}` as `{p, d (JSON string), at, del, sat}`; other devices pull docs with a newer server timestamp. The newer edit wins per doc. Signing out wipes the device copy.

## Roadmap
- Strava: OAuth through a small token-exchange worker (the client secret can't live in a public app).
- Privacy-friendly error reporting, real tests.
- Later: a native wrapper for Apple Health / Health Connect, the legitimate route to wearable data for everyone.
