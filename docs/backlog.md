# Feature backlog

Agreed on 2026-11-17, not built yet. Screen simplification lives separately in `simplify-backlog.md`.

Deliberately not planned: food or calorie logging, a rest timer, phone reminders (unreliable for web apps on iOS), per-set RIR (the per-exercise effort tag covers it).

## Features

- **"What would it unlock?" for gear you don't own.** In Setup → Equipment, list what each missing item opens up (a rack: back squat, bench, inverted rows), with lagging movements first. It builds on `NEEDS`, `SLOT_SUBS` and the strength levels.
- **Post sessions to Strava.** Send a finished lifting session out as a Weight Training activity, with the exercises in the description. It needs the `activity:write` scope (users reconnect once) and a new worker endpoint.

## Loose ends

- **Revoke a connector key.** The Garmin script's key (Setup → Connect a script) is a long-lived refresh token with no off switch.
- **Check the layout recut on a phone with real data.** So far it has only been checked in desktop Chrome with demo data.
- **Privacy-friendly error reporting.** So a broken build shows up before a gym session (also on the README roadmap).
- **Strava's rate limit before other people use the app.** Strava's limits are per app across all users, and new apps get a low quota. Devices already share the last refresh and the Zone 2 minutes through `connectors/strava`, so one person's phone and laptop don't double up. What grows is users × the 30-minute poll. Before launch: Strava's app review (also needed for more than one athlete) with a quota increase, and their webhook subscription so the worker fetches only when an activity changes, instead of polling.
- **Sessions still merge as whole days.** Settings merge field by field (`_f` in `settings/main`, store.js), but a session edited on two devices while one is offline keeps only the later save. This is rare: you log a workout on one device.
- **The "To consider" items in `simplify-backlog.md`.** One shared exercise list with search, exercise names as the sheet button, swap inside the exercise sheet, and one "Why?" sheet.
