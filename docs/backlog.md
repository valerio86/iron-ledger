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
- **The "To consider" items in `simplify-backlog.md`.** One shared exercise list with search, exercise names as the sheet button, swap inside the exercise sheet, and one "Why?" sheet.
