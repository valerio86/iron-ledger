/* Runs in a real browser against the real app code. Open this page directly, or run tools/run_tests.py. */
(() => {
const results = [];
const test = (name, fn) => { try { fn(); results.push({ name, ok: true }); } catch (e) { results.push({ name, ok: false, msg: e.message }); } };
const eq = (got, want, what = "") => { if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what} got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
const near = (got, want) => { if (Math.abs(got - want) > .05) throw new Error(`got ${got}, want ${want}`); };
const ok = (v, what) => { if (!v) throw new Error(what || "expected true"); };

const today = dayKey(new Date()), ago = n => addDays(today, -n);
const sets = (w, r, n = 3) => Array.from({ length: n }, () => ({ w, r, done: true, t: 1 }));
const entry = (ex, w, r, effort = "solid", n = 3) => ({ ex, effort, sets: sets(w, r, n) });
const session = (day, ...entries) => ({ [day]: { date: day, entries } });
// Run fn with this data in place of the app's state, then put everything back
function scene(state, fn) {
  const keys = ["sessions", "cardio", "health", "routines", "custom", "settings"], saved = Object.fromEntries(keys.map(k => [k, S[k]]));
  Object.assign(S, { sessions: {}, cardio: [], health: {}, routines: {}, custom: {}, settings: { unit: "lb" } }, state);
  try { return fn(); } finally { Object.assign(S, saved); }
}

function run() {
  test("estimate: Epley from weight and reps", () => { near(e1rm(50, 5), 58.33); near(e1rm(100, 1), 100); eq(e1rm(0, 5), 0); eq(e1rm(50, 0), 0); });
  test("estimate: reps past 12 add nothing", () => { eq(e1rm(50, 16), e1rm(50, 12)); ok(e1rm(50, 12) > e1rm(50, 11)); ok(e1rm(60, 8) > e1rm(50, 16)); });
  test("estimate: the effort tag doesn't change it", () => {
    const score = effort => entryScore(entry("deadlift", 50, 5, effort), exById("deadlift"));
    eq(score("easy"), score("hard")); eq(score("solid"), score(undefined));
  });
  test("estimate: only ticked sets count", () => {
    const e = entry("deadlift", 50, 5); e.sets.push({ w: 200, r: 5, done: false });
    near(entryScore(e, exById("deadlift")), 58.33);
  });
  test("new best: identical sets with an easier tag aren't one", () => scene({
    sessions: { ...session(ago(7), entry("deadlift", 50, 5, "solid")), ...session(today, entry("deadlift", 50, 5, "easy")) } },
    () => ok(!coach(today).msgs.some(m => m.t.startsWith("New best")))));
  test("new best: heavier sets are one", () => scene({
    sessions: { ...session(ago(7), entry("deadlift", 50, 5)), ...session(today, entry("deadlift", 60, 5)) } },
    () => ok(coach(today).msgs.some(m => m.t.startsWith("New best")))));
  test("best set: the set behind the estimate, first time reached", () => scene({
    sessions: { ...session(ago(9), entry("bb_row", 50, 16, "easy", 1)), ...session(ago(3), entry("bb_row", 60, 8)), ...session(ago(1), entry("bb_row", 50, 16, "solid", 1)) } },
    () => { const b = bestSet("bb_row"); eq([b.w, b.r, b.day], [60, 8, ago(3)]); }));
  test("best set: a tie goes to the first time reached", () => scene({
    sessions: { ...session(ago(9), entry("bb_row", 50, 16, "easy", 1)), ...session(ago(3), entry("bb_row", 50, 13)) } },
    () => { const b = bestSet("bb_row"); eq([b.w, b.r, b.day], [50, 16, ago(9)]); }));
  test("per hand: doubled against bodyweight, barbell lifts aren't", () => {
    eq(bodyweightRatio("db_curl", 20, 160), .25); eq(bodyweightRatio("bb_curl", 40, 160), .25); eq(bodyweightRatio("db_row", 40, 160), .25);
  });

  const bigGear = { unit: "lb", equip: { have: ["barbell", "plates", "ezbar", "dumbbells"], max: { barbell: 150, ezbar: 150, dumbbells: 50 } } };
  test("gear: the default 50 lb cap applies only until you change it", () => {
    scene({}, () => eq(capLb("deadlift"), 50));
    scene({ settings: bigGear }, () => { eq(capLb("deadlift"), 150); eq(capLb("db_curl"), 50); });
    scene({ settings: { unit: "lb", equip: { have: ["barbell"], max: { barbell: 0 } } } }, () => eq(capLb("deadlift"), null));
  });
  test("gear: raising the cap ends rep-only progress", () => {
    const sessions = session(ago(2), { ...entry("deadlift", 50, 5), rLo: 5, rHi: 5 });
    scene({ sessions }, () => { ok(atCap("deadlift")); ok(progression("deadlift").capped); });
    scene({ sessions, settings: bigGear }, () => { ok(!atCap("deadlift")); const p = progression("deadlift"); ok(!p.capped); ok(p.bump > 0, "should add weight"); });
  });
  test("gear: missing gear blocks the exercise", () => scene({ settings: bigGear }, () => { ok(!canDo("squat")); ok(canDo("db_curl")); }));

  const stalled = sessions => scene({ sessions, settings: bigGear }, () => coach(today).msgs.some(m => m.t.includes("hasn't moved")));
  test("stall: moving up in weight isn't one, even if the estimate is flat", () => eq(stalled({ ...session(ago(25), entry("bb_row", 50, 16)), ...session(ago(10), entry("bb_row", 50, 13)), ...session(ago(5), entry("bb_row", 50, 13)), ...session(ago(1), entry("bb_row", 60, 8)) }), false));
  test("stall: more reps at the same weight isn't one", () => eq(stalled({ ...session(ago(25), entry("bb_row", 60, 8)), ...session(ago(22), entry("bb_row", 60, 8)), ...session(ago(5), entry("bb_row", 60, 8)), ...session(ago(1), entry("bb_row", 60, 9)) }), false));
  test("stall: the same weight and reps for weeks is one", () => eq(stalled({ ...session(ago(25), entry("bb_row", 50, 8)), ...session(ago(22), entry("bb_row", 50, 8)), ...session(ago(5), entry("bb_row", 50, 8)), ...session(ago(1), entry("bb_row", 50, 8)) }), true));

  test("in range: inclusive at both ends; no minimum means any real work counts", () => {
    const M = MUSCLES.lats; eq(inRange("lats", M.lo - .5), false); eq(inRange("lats", M.lo), true); eq(inRange("lats", M.hi), true); eq(inRange("lats", M.hi + .5), false);
    const none = Object.keys(MUSCLES).find(m => !MUSCLES[m].lo); eq(inRange(none, 0), false); eq(inRange(none, .25), false); eq(inRange(none, 1), true); eq(inRange(none, MUSCLES[none].hi + 1), false);
  });
  test("in range: only the right names turn green on the page", () => scene({ sessions: session(ago(1), entry("bb_row", 50, 8, "solid", 12)) }, () => {
    const box = document.createElement("div"); box.innerHTML = renderMuscleBars(today);
    const green = [...box.querySelectorAll(".inrange")].map(e => e.textContent);
    ok(green.includes(MUSCLES.lats.n), "lats"); ok(!green.includes(MUSCLES.quads.n), "quads");
  }));

  test("review: counts lifts, cardio and range against targets", () => scene({
    settings: { unit: "lb", week: { lifts: 3, cardio: 3, cardioMin: 100 } },
    sessions: { ...session(ago(1), entry("bb_row", 50, 8, "solid", 12)), ...session(ago(3), entry("deadlift", 50, 5)), ...session(ago(8), entry("deadlift", 40, 5)) },
    cardio: [{ id: "a", name: "Row", sport: "Rowing", day: ago(2), t: 1, mins: 30, re: 20, muscles: {} }] }, () => {
    const R = weekReview(today);
    eq([R.lifts, R.liftsT, R.mins, R.minsT], [2, 3, 30, 100]);
    ok(!R.below.includes("lats")); ok(R.below.includes("chest"));
    eq(R.inRange + R.below.length + R.over.filter(m => MUSCLES[m].lo > 0).length, R.muscles, "every muscle is in one group");
  }));
  test("review: new bests only from this week, against earlier history", () => scene({
    sessions: { ...session(ago(10), entry("deadlift", 40, 5)), ...session(ago(8), entry("rdl", 40, 8)), ...session(ago(2), entry("deadlift", 60, 5), entry("rdl", 30, 8)), ...session(ago(1), entry("lunge", 20, 8)) } }, () => {
    eq(Object.keys(weekReview(today).bests), ["deadlift"]);
  }));
  test("review: the focus picks the most urgent thing", () => {
    scene({ sessions: session(ago(1), entry("bb_row", 50, 8, "solid", 40)) }, () => ok(weekReview(today).focus.startsWith("Ease off")));
    scene({}, () => ok(weekReview(today).focus.includes("more lift")));
    scene({ settings: { unit: "lb", week: { lifts: 0, cardio: 0, cardioMin: 100 } } }, () => ok(weekReview(today).focus.startsWith("Add cardio")));
    scene({ settings: { unit: "lb", week: { lifts: 0, cardio: 0, cardioMin: 0 } } }, () => ok(weekReview(today).focus.startsWith("Add sets")));
  });

  const weighIns = rows => Object.fromEntries(rows.map(([n, w]) => [ago(n), { weightLb: w }]));
  const steady = (from, perWk) => Array.from({ length: Math.floor(from / 2) + 1 }, (_, i) => [from - i * 2, 155 + (i * 2) * perWk / 7]);
  const nutrition = (...daysAgo) => ({ unit: "lb", nutrition: { goal: "bulk", kcal: 3200, changes: daysAgo.map(n => ({ day: ago(n), delta: 200, perWk: .2, kcal: 3200 })) } });
  test("trend: a calorie change doesn't restart it", () => scene({ health: weighIns(steady(40, .3)), settings: nutrition(9) }, () => near(+fuel(today).tr.perWk.toFixed(2), .3)));
  test("trend: a few high days after a change barely move it", () => {
    const rows = [...steady(40, .2).filter(r => r[0] > 4), [3, 158], [2, 158], [1, 158], [0, 158]];
    scene({ health: weighIns(rows), settings: nutrition(9) }, () => ok(fuel(today).tr.perWk < 1, `read ${fuel(today).tr.perWk}`));
  });
  test("trend: too soon after a change, no nudge", () => scene({ health: weighIns(steady(40, -.5)), settings: nutrition(9) }, () => { const F = fuel(today); eq(F.status, "settling"); eq(F.nudge, null); }));
  test("trend: after 14 days a nudge comes, and stays modest", () => {
    scene({ health: weighIns(steady(40, -2)), settings: nutrition(14) }, () => { const F = fuel(today); eq(F.status, "low"); eq(F.nudge.delta, 250); });
    scene({ health: weighIns(steady(40, 2)), settings: nutrition(14) }, () => { const F = fuel(today); eq(F.status, "high"); eq(F.nudge.delta, -250); });
  });
  test("trend: on target asks for nothing", () => scene({ health: weighIns(steady(40, .35)), settings: nutrition() }, () => { const F = fuel(today); eq(F.status, "ok"); eq(F.nudge, null); }));
  test("trend: under 2 weeks of weigh-ins isn't enough", () => scene({ health: weighIns(steady(12, 3)), settings: nutrition() }, () => { const F = fuel(today); eq(F.status, "unknown"); eq(F.nudge, null); }));
  test("trend: a long gap in weigh-ins is reported", () => {
    scene({ health: weighIns(steady(40, .3).filter(r => r[0] > 25 || r[0] < 15)), settings: nutrition() }, () => { const g = fuel(today).tr.gap; ok(g && g.days > 7, "gap"); eq(g.from, ago(25)); eq(g.to, ago(15)); });
    scene({ health: weighIns(steady(40, .3)), settings: nutrition() }, () => eq(fuel(today).tr.gap, null));
  });
  test("trend: the card shows the state in words", () => scene({ health: weighIns(steady(40, .3)), settings: nutrition(9) }, () => { const h = renderFuel(today); ok(h.includes("Too soon to judge")); ok(h.includes("last 6 weeks")); }));

  test("look-ahead: leaves your data untouched", () => scene({
    sessions: session(ago(2), entry("deadlift", 50, 5)),
    routines: { r: { id: "r", name: "R", items: [{ ex: "deadlift", sets: 3, r: 5, w: 50 }] } } }, () => {
    const before = JSON.stringify([S.sessions, S.cardio]);
    const days = forecast(today, 4);
    eq(days.length, 4); eq(JSON.stringify([S.sessions, S.cardio]), before);
  }));
  test("look-ahead: never lifts two days running", () => scene({
    routines: { r: { id: "r", name: "R", items: [{ ex: "deadlift", sets: 3, r: 5, w: 50 }] } } }, () => {
    const days = forecast(today, 6);
    days.forEach((d, i) => { if (i) ok(!(d.p.kind === "lift" && days[i - 1].p.kind === "lift"), `${d.day} follows a lift`); });
  }));
  test("progress page renders with best set and per-hand labels", () => scene({
    sessions: session(ago(1), entry("db_curl", 20, 10)), settings: { unit: "lb" },
    health: { [ago(1)]: { weightLb: 160 } } }, () => {
    const saved = [S.progEx, S.progView]; S.progEx = "db_curl"; S.progView = "lifts";
    try { const html = renderProgress(); ok(html.includes("from 20 × 10"), "best set"); ok(html.includes("lb each"), "per hand"); ok(html.includes("both hands"), "bodyweight"); }
    finally { [S.progEx, S.progView] = saved; }
  }));

  test("week strip: seven days around today, logged and planned marks", () => scene({
    sessions: session(ago(1), entry("deadlift", 50, 5)), cardio: [{ id: "c", name: "Run", sport: "Run", day: today, t: 1, mins: 30, re: 40, muscles: {} }],
    routines: { r: { id: "r", name: "R", items: [{ ex: "deadlift", sets: 3, r: 5, w: 50 }] } } }, () => {
    const days = weekDays(today, today), plans = weekPlans(days, today);
    eq(days.length, 7); eq(days[3], today);
    eq(dayMarks(ago(1), today, plans)[0], { k: "lift", done: true });
    ok(dayMarks(today, today, plans).some(m => m.k === "cardio" && m.done && m.mins === 30), "today's cardio");
    ok(dayMarks(addDays(today, 1), today, plans).every(m => !m.done), "future days are only planned");
    eq(weekDays(ago(20), today)[3], ago(20), "far from today, it centres on the chosen day");
  }));
  test("week strip: a future tile and that day's view show the same plan", () => scene({
    routines: { r: { id: "r", name: "R", items: [{ ex: "deadlift", sets: 3, r: 5, w: 50 }] } } }, () => {
    const saved = S.day, k = addDays(today, 2); S.day = k;
    try { const p = weekPlans(weekDays(k, today), today)[k]; ok(renderToday().includes(esc(p.title)), p.title); } finally { S.day = saved; }
  }));
  test("body map: every muscle and joint has a place", () => {
    const drawn = new Set([...BM_FRONT, ...BM_BACK].map(r => r[0]));
    eq(Object.keys(MUSCLES).filter(m => !drawn.has(m)), []); eq(JOINT_ORDER.filter(j => !BM_JOINT[j]), []);
  });
  test("body map: fatigued muscles are hatched and joints flagged, with words for screen readers", () => scene({
    sessions: Object.assign({}, ...[0, 1, 2].map(i => { const e = entry("lunge", 50, 20, "hard", 10); e.sets.forEach(x => x.t = Date.now() - i * 864e5); return session(ago(i), e); })) }, () => {
    const html = renderBodyMap(coach(today), today);
    ok(html.includes("url(#bm-hatch)"), "hatch"); ok(/aria-label="Body map\. Fatigued: /.test(html), "summary"); ok(html.includes("bmj"), "joint marker");
  }));
  test("today: a finished run is reported once", () => scene({
    cardio: [{ id: "c", name: "Lunch Run", sport: "Run", day: today, t: 1, mins: 51, re: 55, muscles: {} }],
    settings: { unit: "lb", week: { lifts: 0, cardio: 3 } } }, () => {
    const saved = S.day; S.day = today;
    try { const h = renderToday(); if (h.includes("Lunch Run")) { eq((h.match(/51′/g) || []).length <= 2, true, "minutes repeated"); ok(!h.includes("Cardio done:"), "old title"); } } finally { S.day = saved; }
  }));

  const walk = (day, z2, id = "w" + day) => ({ id, name: "Morning Walk", sport: "Walk", day, t: 1, mins: 52, re: 23, z2, muscles: {} });
  const cardioWeek = { unit: "lb", week: { lifts: 0, cardio: 3, cardioMin: 90 } };
  test("walks: 15+ Zone 2 minutes make a session, counted by those minutes", () => scene({ cardio: [walk(ago(1), 31), walk(ago(2), 10), walk(ago(3), 0)] }, () => {
    eq(cardioOn(ago(6), today).length, 1); eq(cardioMinutes(ago(6), today), 41);
  }));
  test("walks: the long build uses Zone 2 minutes, not the whole walk", () => scene({ settings: cardioWeek, cardio: [walk(ago(10), 31)] }, () => {
    eq(planDay(today).mins, 40);
  }));
  test("today: a walk that covers the planned minutes marks cardio done", () => scene({ settings: cardioWeek, cardio: [walk(today, 31)] }, () => {
    const p = planDay(today); eq(p.kind, "done"); eq(p.cardio.id, "w" + today);
    const saved = S.day; S.day = today; try { ok(renderToday().includes("counts as a Zone 2 session")); } finally { S.day = saved; }
  }));
  test("today: fewer minutes than planned is partly done", () => scene({ settings: cardioWeek, cardio: [walk(today, 18)] }, () => {
    const p = planDay(today); eq(p.kind, "cardio"); eq(p.partial, { done: 18, want: 25 }); ok(p.title.startsWith("Partly done: 18 of 25"), p.title);
  }));
  test("today: the after-lifting cardio is ticked off by today's cardio", () => {
    const old = Object.assign({}, ...[8, 10, 12, 14, 16, 18].map(i => session(ago(i), entry("deadlift", 50, 5))));
    const st = extra => ({ settings: { unit: "lb", week: { lifts: 3, cardio: 3, cardioMin: 90 } }, sessions: { ...old, ...session(today, entry("deadlift", 50, 5)) }, ...extra });
    scene(st({}), () => { const a = planDay(today).addon; ok(a && !a.done, "still to do after lifting"); });
    scene(st({ cardio: [walk(today, 25)] }), () => { const a = planDay(today).addon; ok(a && a.done, "covered by the walk"); });
  });

  test("readiness: the ring shows with a score, pills without one", () => {
    const h = readinessRing({ readiness: 86, sleepScore: 78, sleepHours: 9.4, hrv: 47, bodyBatteryWake: 97 }, false, { weightLb: 156.5, bodyFatPct: 15.1 });
    ok(h.includes("Battery"), "battery"); ok(h.includes("15.1% fat"), "weight"); ok(!h.includes("<details"), "nothing folded");
    ok(h.includes('aria-label="Readiness 86 of 100, good"'), "label"); ok(h.includes('stroke-dasharray="86 100"'), "arc"); ok(h.includes("HRV"), "hrv");
    ok(readinessRing({ readiness: 20 }, false, null).includes(", poor"), "poor");
    scene({ health: { [today]: { sleepScore: 70 } } }, () => { const saved = S.day; S.day = today; try { const r = renderToday(); ok(!r.includes("rring"), "no ring"); ok(r.includes("Sleep 70"), "pill"); } finally { S.day = saved; } });
  });
  test("fuel: the cardio extra moves into the fold", () => scene({ cardio: [{ id: "c", name: "Run", sport: "Run", day: today, t: 1, mins: 50, re: 40, muscles: {} }] }, () => {
    const h = fuelLine(today, { kind: "done" }); ok(h.includes("Includes ~"), "in fold"); ok(!h.includes("(incl."), "old text");
  }));
  test("workout: the last-time line only shows when the steppers differ", () => scene({
    sessions: { ...session(ago(3), entry("deadlift", 50, 5)), ...session(today, { ex: "deadlift", id: "e", effort: null, sets: [0, 1, 2].map(() => ({ w: 50, r: 5, done: false })) }) } }, () => {
    const c = adviceCtx(today), e = S.sessions[today].entries[0];
    ok(!renderEntry(e, 0, today, {}, c).includes("Same again"), "same");
    e.sets[0].w = 60; ok(renderEntry(e, 0, today, {}, c).includes("Same again"), "different");
  }));
  test("workout: a suggested weight is a chip that goes once applied", () => scene({ sessions: session(ago(3), { ...entry("deadlift", 20, 5), effort: "easy" }) }, () => {
    const prog = progression("deadlift", today), e = { id: "e", sets: [{ w: 20, r: 5 }] };
    ok(prog.bump > 0, "bump"); ok(renderProgHint(prog, false, e, 0, today).includes("upchip"), "chip");
    e.sets[0].w = 20 + prog.bump; eq(renderProgHint(prog, false, e, 0, today), "");
  }));
  test("workout: column labels go after three workouts", () => {
    scene({ sessions: { ...session(ago(1), entry("deadlift", 50, 5)), ...session(ago(2), entry("deadlift", 50, 5)) } }, () => ok(!knowsColumns()));
    scene({ sessions: { ...session(ago(1), entry("deadlift", 50, 5)), ...session(ago(2), entry("deadlift", 50, 5)), ...session(ago(3), entry("deadlift", 50, 5)) } }, () => ok(knowsColumns()));
  });
  test("progress: leads with the latest number and its change", () => scene({ sessions: { ...session(ago(35), entry("deadlift", 50, 5)), ...session(ago(1), entry("deadlift", 60, 5)) } }, () => {
    const saved = [S.progEx, S.progView]; S.progEx = "deadlift"; S.progView = "lifts";
    try { const h = renderProgress(); ok(h.includes("↑ 20%"), "trend"); ok(h.includes("in 4 wk"), "window"); ok(h.indexOf("hero") < h.indexOf("chart1"), "order"); } finally { [S.progEx, S.progView] = saved; }
  }));

  // Deload. Six weeks of the same three lifts a week, ending yesterday (the gear lets the weight go up)
  const steadyWeeks = (weeks, w = 50) => { let out = {}; for (let i = weeks * 7; i >= 1; i -= 2) out = { ...out, ...session(ago(i), entry("deadlift", w, 5)) }; return out; };
  const R1 = { r: { id: "r", name: "R", items: [{ ex: "deadlift", sets: 4, r: 5, rHi: 8, w: 50 }, { ex: "db_curl", sets: 3, r: 8, rHi: 12, w: 20 }] } };
  test("deload: due after 5 straight full weeks, not before", () => {
    scene({ sessions: steadyWeeks(6), settings: bigGear }, () => { ok(hardWeeks(today) >= 5, "weeks"); ok(deloadDue(today), "due"); ok(coach(today).msgs.some(m => m.t.includes("deload-start")), "button"); });
    scene({ sessions: steadyWeeks(3), settings: bigGear }, () => eq(deloadDue(today), null));
  });
  test("deload: a recent deload or a snooze resets the reminder", () => {
    scene({ sessions: steadyWeeks(6), settings: { ...bigGear, deloads: [{ start: ago(10), end: ago(4) }] } }, () => { ok(hardWeeks(today) < 2); eq(deloadDue(today), null); });
    scene({ sessions: steadyWeeks(6), settings: { ...bigGear, deloadSnooze: addDays(today, 2) } }, () => eq(deloadDue(today), null));
  });
  test("deload: half the sets, no top-ups, and Start lightens the weight", () => scene({ sessions: steadyWeeks(3), routines: R1, settings: { ...bigGear, deloads: [{ start: today, end: addDays(today, 6) }] } }, () => {
    const a = adaptRoutine(S.routines.r, today);
    ok(a.deload); eq(a.items.map(x => x.sets), [2, 2]);
    eq(deloadWeight(50, 5), 45); eq(deloadWeight(20, 5), 20, "too coarse a step holds the weight"); eq(deloadWeight(100, 5), 90);
    const p = planDay(today); ok(p.kind !== "lift" || (p.deload && /Deload/.test(p.note) && !p.addon), "plan says so");
  }));
  test("deload: progression and stalls skip deload sessions", () => scene({
    sessions: { ...session(ago(9), { ...entry("deadlift", 60, 8), rLo: 5, rHi: 8 }), [ago(2)]: { date: ago(2), deload: true, entries: [entry("deadlift", 55, 5, "easy", 2)] } }, settings: bigGear }, () => {
    const p = progression("deadlift", today); eq(p.last.day, ago(9)); ok(p.bump > 0, "carries on from the full session");
  }));
  const dlWeek = { ...bigGear, deloads: [{ start: today, end: addDays(today, 6) }] };
  test("deload: each card shows last full session → today's lighter version", () => scene({
    sessions: { ...session(ago(3), { ...entry("deadlift", 100, 8), rLo: 5, rHi: 8 }, entry("pushup", 0, 15)) }, settings: dlWeek }, () => {
    const d = deloadPlan("deadlift", today); eq([d.n, d.w, d.r], [2, 90, 5]);
    const b = deloadPlan("pushup", today); eq([b.n, b.w, b.r], [2, 0, 10], "bodyweight: same load, ⅔ reps");
    const e = newEntry("deadlift", today); eq(e.sets.map(s => [s.w, s.r]), [[90, 5], [90, 5]], "added mid-deload starts light");
    S.sessions[today] = { date: today, deload: true, entries: [e] };
    const c = adviceCtx(today), h = () => renderEntry(e, 0, today, {}, c);
    ok(h().includes("Last full:") && h().includes("90 lb × 5, 2 sets"), "line"); ok(!h().includes("Same again"), "no undo button");
    ok(!/Add |Try |Hold the weight/.test(h()), "no progression text"); ok(!h().includes("dlapply"), "matches");
    e.sets[0].w = 100; ok(h().includes("dlapply"), "Use deload after an edit");
  }));
  test("deload: Start fills the deload sets from the last full session", () => scene({
    sessions: session(ago(3), { ...entry("deadlift", 100, 8, "solid", 4), rLo: 5, rHi: 8 }), routines: R1, settings: dlWeek }, () => {
    const it = adaptRoutine(S.routines.r, today).items[0], d = deloadPlan(it.ex, today, it.sets, it.r);
    eq([d.n, d.w, d.r], [2, 90, 5]);
  }));
  test("deload: no PR or volume nudges during the week", () => scene({
    sessions: steadyWeeks(3), health: { [today]: { readiness: 85 } }, settings: { ...bigGear, deloads: [{ start: ago(1), end: addDays(today, 5) }] } }, () => {
    const m = coach(today).msgs; ok(m.some(x => x.t.includes("Deload week</b>, day 2 of 7")), "banner"); ok(!m.some(x => /push for a PR|Light this week/.test(x.t)), "nudges");
  }));
  test("coach: a hard walk names its muscles, not an empty list", () => scene({ cardio: [{ day: today, name: "Morning Walk", sport: "Walk", mins: 70, re: 35, muscles: { calves: .3, quads: .2 } }, { day: today, name: "Run", sport: "Run", mins: 30, re: 40, muscles: { quads: .7, calves: .6, hamstrings: .5, glutes: .3 } }] }, () => {
    const t = coach(today).msgs.map(m => m.t).join(" | ");
    ok(t.includes("also lightly loaded your calves and quads."), t); ok(t.includes("loaded your quads, calves and hamstrings."), t); ok(!/your \./.test(t), "empty list");
  }));
  // A steady block with a deload 8–14 days ago: deload sessions are 2 sets at 45
  const withDl = () => { const s = steadyWeeks(6); for (let i = 8; i <= 14; i++) if (s[ago(i)]) s[ago(i)] = { date: ago(i), deload: true, entries: [entry("deadlift", 45, 5, "easy", 2)] }; return s; };
  const dlPast = { ...bigGear, deloads: [{ start: ago(14), end: ago(8) }] };
  test("deload charts: target scales with the deload days in the window", () => scene({ settings: dlWeek }, () => {
    eq(deloadScale(today, addDays(today, 6)), .5); near(deloadScale(ago(3), addDays(today, 3)), 1 - 4 / 7 * .5); eq(deloadScale(ago(14), ago(8)), 1);
  }));
  test("deload charts: usual week leaves deload weeks out, so the week after isn't a spike", () => {
    const [plain, dl] = [steadyWeeks(6), withDl()].map(ss => scene({ sessions: ss, settings: dlPast }, () => ({ u: usualAvg(today, totalSets), j: jointRatios(today).lowerBack.usual })));
    near(dl.u, plain.u); near(dl.j, plain.j);
    eq(usualWeeks(today).length, 4, "no deload → all four weeks");
  });
  test("deload charts: joint and muscle targets only in a deload", () => {
    scene({ sessions: steadyWeeks(6), settings: bigGear }, () => { eq(jointRatios(today).lowerBack.target, null); ok(!renderJointBars(today).includes("dlt")); });
    scene({ sessions: steadyWeeks(6), settings: dlWeek }, () => {
      const r = jointRatios(today).lowerBack; ok(r.target > 0 && r.target < r.base, "target under usual");
      ok(renderJointBars(today).includes("Deload target"), "joint legend"); ok(renderMuscleBars(today).includes("band dl"), "muscle band");
      const R = weekReview(today); eq(R.below, [], "under range is the point"); ok(/Deload week/.test(R.focus), R.focus);
    });
  });
  test("deload charts: weekly grid marks deload columns", () => scene({ sessions: withDl(), settings: dlPast }, () => ok(renderMuscleWeeks(today).includes("c ok dl") || renderMuscleWeeks(today).includes(" dl\""), "dl cells")));
  test("deload charts: strength line skips deload sessions, shows them as ghosts with a pre-deload ref", () => scene({ sessions: withDl(), settings: dlPast }, () => {
    const saved = [S.progEx, S.progView]; S.progEx = "deadlift"; S.progView = "lifts";
    try {
      const html = renderProgress();
      ok(S._chart.ghosts.length > 0 && S._chart.pts.every(p => !S.sessions[p.day].deload), "ghosts off the line");
      eq(S._chart.refs.length, 1, "one pre-deload ref"); ok(S._vchart.ghosts.every(g => g.cap > 0), "volume ceilings");
      ok(!html.includes("↓"), "no fake drop"); ok(html.includes("Pre-deload best"), "legend");
      const el = document.createElement("div"); lineChart(el, S._chart); ok(el.querySelector("circle.ghost") && el.querySelector("line.ref") && el.querySelector(".dlband"), "drawn");
    } finally { [S.progEx, S.progView] = saved; }
  }));
  test("deload charts: rebound after a deload", () => {
    scene({ sessions: withDl(), settings: dlPast }, () => eq(rebound(today)?.back, ["deadlift"]));
    scene({ sessions: { ...withDl(), ...session(ago(2), entry("deadlift", 40, 5)), ...session(ago(4), entry("deadlift", 40, 5)), ...session(ago(6), entry("deadlift", 40, 5)) }, settings: dlPast },
      () => eq(rebound(today)?.notYet, ["deadlift"]));
  });

  // Strength levels
  const bwAt = (lb, n = 1) => ({ [ago(n)]: { weightLb: lb } });
  test("levels: score is 1 at beginner, 5 at elite, straight-line between", () => {
    const th = [10, 20, 30, 40, 50];
    eq(levelScore(5, th), .5); eq(levelScore(10, th), 1); eq(levelScore(25, th), 2.5); eq(levelScore(60, th), 5);
    eq(levelName(.5), "Below beginner"); eq(levelName(2.5), "Novice"); eq(levelName(5), "Elite");
  });
  test("levels: thresholds scale with bodyweight^2/3; variants are a share of the anchor", () => {
    const at165 = stdThresholds("bench", 165, "m").th; near(at165[2], 165);
    const at200 = stdThresholds("bench", 200, "m").th; ok(at200[2] > 165 && at200[2] / 200 < 1, "heavier: more load, less per pound");
    near(stdThresholds("db_bench", 165, "m").th[2], 165 * .42);
    ok(stdThresholds("bench", 135, "f").th[2] < stdThresholds("bench", 135, "m").th[2]);
    eq(stdThresholds("crunch", 160, "m"), null);
  });
  test("levels: off until standards are chosen, then from the best recent set", () => {
    const sessions = session(ago(3), entry("db_bench", 40, 10));
    scene({ sessions, health: bwAt(155) }, () => eq(liftLevel("db_bench", today), null));
    scene({ sessions, health: bwAt(155), settings: { unit: "lb", stdSex: "m" } }, () => { const l = liftLevel("db_bench", today); eq(l.level, "Novice"); ok(l.next > l.v, "next step is above"); });
    scene({ sessions: session(ago(70), entry("db_bench", 40, 10)), health: bwAt(155), settings: { unit: "lb", stdSex: "m" } }, () => eq(liftLevel("db_bench", today), null, "older than 8 weeks"));
  });
  test("levels: added weight on a pull-up counts as extra reps", () => scene({
    sessions: session(ago(2), entry("pullup", 20, 5)), health: bwAt(160), settings: { unit: "lb", stdSex: "m" } }, () => {
    const l = liftLevel("pullup", today); ok(l.v > 5 && l.v < 12, `got ${l.v}`); eq(l.kind, "reps");
  }));
  const lagScene = { sessions: { ...session(ago(9), entry("db_bench", 60, 8), entry("db_row", 90, 8), entry("db_curl", 35, 8)), ...session(ago(4), entry("goblet", 25, 8)) },
    health: bwAt(155, 9), settings: { ...bigGear, unit: "lb", stdSex: "m", equip: { have: ["dumbbells"], max: { dumbbells: 138 } } } };
  test("levels: a movement a full level behind is flagged, and goes first at Start", () => scene(lagScene, () => {
    const { groups } = strengthLevels(today);
    eq(groups.filter(g => g.lag).map(g => g.k), ["squat"]);
    S.routines = { r: { id: "r", name: "R", items: [{ ex: "db_bench", sets: 3, r: 8, w: 0 }, { ex: "goblet", sets: 3, r: 8, w: 0 }] } };
    const a = adaptRoutine(S.routines.r, today); eq(a.items[0].ex, "goblet"); ok(a.changes.some(c => c.includes("first")));
    S.lvView = "movement"; try { ok(renderLevels(today).includes("lvrow lag"), "card marks it"); } finally { S.lvView = null; }
  }));
  test("levels by muscle: best main-mover lift per muscle, uncovered muscles listed", () => scene(lagScene, () => {
    const { rows } = muscleLevels(today), by = Object.fromEntries(rows.map(r => [r.k, r]));
    eq(by.chest.best.exId, "db_bench"); eq(by.biceps.best.exId, "db_curl"); ok(by.quads.lag, "quads behind");
    ok(!by.calves.covered && !by.calves.best, "no calf standard");
    const h = renderLevels(today); ok(h.includes("By muscle") && h.includes("No standards for") && h.includes("lvrow lag"), "card");
  }));
  test("age: no change 23–39; masters and juniors get lower standards", () => {
    eq(ageCoef(null), 1); eq(ageCoef(30), 1); eq(ageCoef(39), 1); eq(ageCoef(40), 1); eq(ageCoef(50), 1.13); eq(ageCoef(60), 1.34); eq(ageCoef(95), 2.549); eq(ageCoef(16), 1.13); eq(ageCoef(10), 1.23);
    const y = new Date().getFullYear(), sessions = session(ago(3), entry("db_bench", 40, 10)), base = { health: bwAt(155) };
    const at = by => scene({ sessions, ...base, settings: { unit: "lb", stdSex: "m", ...(by ? { birthYear: by } : {}) } }, () => liftLevel("db_bench", today).score);
    eq(at(y - 30), at(null), "30 unchanged"); ok(at(y - 60) > at(y - 30) + .3, "60 scores higher");
  });
  test("age: recovery slows past 40, and deloads come a week sooner from 50", () => {
    const y = new Date().getFullYear();
    scene({ settings: { unit: "lb", birthYear: y - 30 } }, () => eq(recoveryScale(), 1));
    scene({ settings: { unit: "lb", birthYear: y - 60 } }, () => near(recoveryScale(), 1.1));
    const four = { ...bigGear, deloads: [{ start: ago(34), end: ago(28) }] };   // exactly 4 full weeks since the last deload
    scene({ sessions: steadyWeeks(4), settings: { ...four, birthYear: y - 30 } }, () => { eq(hardWeeks(today), 4); eq(deloadDue(today), null); });
    scene({ sessions: steadyWeeks(4), settings: { ...four, birthYear: y - 55 } }, () => ok(deloadDue(today), "due at 4 weeks"));
  });
  test("sources: every source opens with links", () => { for (const k of Object.keys(SOURCES)) { openSource(k); ok($("#help .srcs a"), k); } closeHelp(); });

  // Balanced sessions
  const dbGear = { unit: "lb", week: { lifts: 3, cardio: 0, cardioMin: 0, mode: "auto" }, equip: { have: ["dumbbells", "pullupBar", "bench"], max: { dumbbells: 100 } } };
  test("balanced: one lower, push and pull movement, from gear you have", () => scene({ settings: dbGear }, () => {
    const b = buildSession(today), ids = b.items.map(x => x.ex);
    ok(b.auto); ok(ids.length >= 3, ids.join());
    ok(["squat", "hinge"].includes(exById(ids[0]).pattern), "lower first"); eq(exById(ids[1]).pattern, "push"); eq(exById(ids[2]).pattern, "pull");
    ok(ids.every(canDo), "gear"); ok(!ids.includes("bench") && !ids.includes("squat"), "no rack lifts");
  }));
  test("balanced: alternates movements from one session to the next", () => {
    const first = scene({ settings: dbGear }, () => buildSession(today).items.slice(0, 3).map(x => x.ex));
    const sessions = session(ago(2), ...first.map(id => entry(id, 30, 8)));
    const next = scene({ sessions, settings: dbGear }, () => buildSession(today).items.slice(0, 3).map(x => x.ex));
    first.forEach((id, i) => ok(id !== next[i], `slot ${i}: ${id} twice`));
  });
  test("balanced: an accessory doesn't count as that movement's turn", () => {
    const sessions = { [ago(2)]: { date: ago(2), routine: "auto", slots: ["squat", "hpress", "hpull"], entries: [entry("goblet", 30, 8), entry("db_bench", 30, 8), entry("db_row", 30, 8), entry("sl_rdl", 0, 10)] } };
    scene({ sessions, settings: dbGear }, () => eq(exById(buildSession(today).items[0].ex).pattern, "hinge"));
  });
  test("balanced: no curls when rows and pull-ups already cover biceps", () => {
    const sessions = { ...session(ago(2), entry("db_row", 40, 8, "solid", 4), entry("chinup", 0, 8, "solid", 4)), ...session(ago(4), entry("db_row", 40, 8, "solid", 4)) };
    scene({ sessions, settings: dbGear }, () => ok(!buildSession(today).items.some(x => ["db_curl", "hammer", "bb_curl"].includes(x.ex)), "curls added"));
  });
  test("balanced: accessories don't repeat a main slot's movement", () => scene({ settings: dbGear }, () => {
    const b = buildSession(today), mainSubs = b.items.slice(0, 3).map(x => Object.keys(SLOT_SUBS).find(k => SLOT_SUBS[k][1].includes(x.ex)));
    for (const x of b.items.slice(3)) ok(!mainSubs.some(k => SLOT_SUBS[k][1].includes(x.ex)), `${x.ex} repeats a main movement`);
  }));
  test("balanced: the planner uses it, and Start's adapt adds no routine top-ups", () => scene({ settings: dbGear }, () => {
    const p = planDay(today); eq(p.kind, "lift"); ok(p.routine.auto, "built"); ok(p.title.startsWith("Full body"), p.title);
    const a = adaptRoutine(p.routine, today); ok(!a.changes.some(c => c.startsWith("+ ")), "no top-ups");
    ok(forecast(today, 4).length === 4);
  }));

  // Exercise preferences: your order, three levels of skipping, block and stall offers
  const withPrefs = (prefs, extra = {}) => ({ ...dbGear, week: { lifts: 3, cardio: 3, mode: "auto" }, prefs, ...extra });
  const pressOf = b => b.items.find(x => ["hpress", "vpress"].includes(subOf(x.ex)));
  test("prefs: your order wins over how often you've done it", () => scene({
    sessions: session(ago(3), entry("db_ohp", 30, 8)), settings: withPrefs({ order: { vpress: ["pike_pushup", "db_ohp"] } }) }, () => {
    eq(ranked("vpress")[0], "pike_pushup"); eq(ranked("vpress")[1], "db_ohp");
  }));
  test("prefs: without an order, the most used comes first", () => scene({ sessions: session(ago(3), entry("db_ohp", 30, 8)), settings: withPrefs({}) }, () => eq(ranked("vpress")[0], "db_ohp")));
  test("prefs: reorder saves the whole list and moves one place", () => scene({ settings: withPrefs({}) }, () => {
    const p = { order: {} }; reorder(p, "vpress", "pike_pushup"); eq(p.order.vpress[0], "pike_pushup");
    reorder(p, "vpress", "pike_pushup", 1); eq(p.order.vpress[1], "pike_pushup"); eq(p.order.vpress.length, SLOT_SUBS.vpress[1].length);
  }));
  test("prefs: a skipped exercise isn't picked; the next in your order is", () => scene({
    sessions: session(ago(10), entry("db_bench", 30, 8)), settings: withPrefs({ skip: { db_bench: { k: "cycle", since: ago(1) } } }) }, () => {
    const b = buildSession(today), pr = pressOf(b); ok(pr, "a press"); ok(pr.ex !== "db_bench", "skipped one picked");
  }));
  test("prefs: skipping a whole movement leaves the slot to its partner, and says so", () => scene({ settings: withPrefs({ skip: { "move:vpress": { k: "never", since: ago(30) } } }) }, () => {
    for (let i = 0; i < 3; i++) { const b = buildSession(today); eq(subOf(pressOf(b).ex), "hpress"); ok(b.why.some(w => w.includes("overhead pressing")), "why line"); }
    ok(!buildSession(today).items.some(x => SLOT_SUBS.vpress[1].includes(x.ex)), "no overhead as accessory");
  }));
  test("prefs: never-list exercises aren't offered as swaps or suggestions", () => scene({ settings: withPrefs({ skip: { db_row: { k: "never", since: ago(5) } } }) }, () => {
    ok(!similarEx("inv_row", today).some(e => e.id === "db_row")); ok(!coach(today).exSuggest.some(e => e.id === "db_row"));
  }));
  test("prefs: a routine's skipped item becomes your next choice in that movement", () => scene({
    routines: { r: { id: "r", name: "R", items: [{ ex: "db_ohp", sets: 3, r: 8, rHi: 12, w: 30 }] } },
    settings: withPrefs({ order: { vpress: ["db_ohp", "pike_pushup"] }, skip: { db_ohp: { k: "never", since: ago(5) } } }, { week: { lifts: 3 } }) }, () => {
    const a = adaptRoutine(S.routines.r, today); eq(a.items[0].ex, "pike_pushup"); ok(a.changes[0].includes("never list"), a.changes[0]); eq(a.items[0].w, 0);
  }));
  test("prefs: a this-cycle skip comes up for review after the next deload, not before", () => scene({ settings: withPrefs({}) }, () => {
    const sk = { k: "cycle", since: ago(20) };
    eq(cycleDue(sk, today), false);
    S.settings.deloads = [{ start: ago(25), end: ago(19) }]; eq(cycleDue(sk, today), false, "deload before the skip");
    S.settings.deloads.push({ start: ago(9), end: ago(3) }); eq(cycleDue(sk, today), true);
    eq(cycleDue({ k: "never", since: ago(400) }, today), false, "never stays");
    eq(cycleDue({ k: "cycle", since: ago(CYCLE_FALLBACK) }, today), true, "fallback");
  }));
  test("prefs: the coach asks about a due skip, with three answers", () => scene({
    settings: withPrefs({ skip: { db_ohp: { k: "cycle", since: ago(20) } } }, { deloads: [{ start: ago(9), end: ago(3) }] }) }, () => {
    const m = coach(today).msgs.find(x => x.t.includes("aside")); ok(m, "message"); ok(m.t.includes('data-act="unskip"') && m.t.includes('data-k="never"') && m.t.includes('data-k="cycle"'));
  }));
  test("prefs: new block offers other lifts for movements you've trained, once", () => {
    const sessions = { ...session(ago(12), entry("db_ohp", 30, 8)), ...session(ago(20), entry("db_row", 40, 8)) };
    const st = (block) => ({ sessions, settings: withPrefs({ block }, { deloads: [{ start: ago(9), end: ago(3) }] }) });
    scene(st(null), () => { const rows = blockOffers(today); ok(rows.some(r => r.sub === "vpress" && r.cur === "db_ohp" && r.alts.length), JSON.stringify(rows)); ok(!rows.some(r => r.sub === "squat"), "untrained");
      ok(coach(today).msgs.some(m => m.t.includes("New block"))); });
    scene(st(ago(3)), () => ok(!coach(today).msgs.some(m => m.t.includes("New block")), "answered"));
  });
  test("prefs: a stalled lift offers your next choice", () => scene({
    sessions: { ...session(ago(25), entry("pullup", 0, 8)), ...session(ago(22), entry("pullup", 0, 8)), ...session(ago(5), entry("pullup", 0, 8)), ...session(ago(1), entry("pullup", 0, 8)) },
    settings: withPrefs({ order: { vpull: ["pullup", "chinup"] } }) }, () => {
    const m = coach(today).msgs.find(x => x.t.includes("hasn't moved")); ok(m && m.t.includes('data-to="chinup"'), m?.t);
  }));
  test("prefs: a swap into another movement moves the session's turn with it", () => scene({
    sessions: { [S.day]: { date: S.day, slots: ["squat", "vpress", "hpull"], entries: [{ id: "a", ex: "db_ohp", sets: [{ w: 30, r: 8, done: false }] }] } }, settings: withPrefs({}) }, () => {
    const [r0, s0] = [render, saveDay]; render = saveDay = () => {};
    try { swapEntry(0, "db_bench"); } finally { render = r0; saveDay = s0; }
    eq(S.sessions[S.day].slots, ["squat", "hpress", "hpull"]); eq(S.sessions[S.day].entries[0].ex, "db_bench");
  }));

  test("plan swaps: the plan card lists the exercises, each with a swap", () => scene({ settings: withPrefs({}, { tipsSeen: ["plan", "swap"] }) }, () => {
    S.day = today; const box = document.createElement("div"); box.innerHTML = renderToday();
    const rows = box.querySelectorAll(".pxrow [data-act=swapsheet][data-pre]"); ok(rows.length >= 3, "rows " + rows.length);
  }));
  test("plan swaps: a one-off swap changes the plan and Start, and moves the movement's turn", () => scene({ settings: withPrefs({}) }, () => {
    const p = buildSession(today), oh = p.items.find(x => subOf(x.ex) === "vpress") || p.items.find(x => subOf(x.ex) === "hpress");
    const other = oh && subOf(oh.ex) === "vpress" ? "db_bench" : "db_ohp";
    S.sessions[today] = { date: today, entries: [], pre: { [oh.ex]: other } };
    const it = applyPre(p.items, today); eq(it.find(x => x.from === oh.ex).ex, other); eq(it.find(x => x.from === oh.ex).w, 0);
    const sl = slotsAfter(p.slots, it); ok(sl.includes(subOf(other)) && !sl.includes(subOf(oh.ex)), JSON.stringify(sl));
    eq(applyPre(p.items, ago(1)).some(x => x.from), false, "only that day");
  }));
  test("plan swaps: the swap sheet works on a planned exercise", () => scene({ settings: withPrefs({}) }, () => {
    S.day = today; openSwap({ pre: "db_ohp", orig: "db_ohp", rid: "auto" });
    const sh = document.getElementById("sheet"); ok(sh.querySelector('[data-act=swap][data-pre="db_ohp"]'), "today button"); ok(sh.querySelector('[data-act=skipex][data-k=never][data-pre]'), "never button");
    sh.innerHTML = "";
  }));
  test("sources: the variety note has its references", () => { ok(SOURCES.variety.refs.length >= 2); ok(TIPS.swap); });

  const failed = results.filter(r => !r.ok);
  document.title = failed.length ? `${failed.length} FAILED` : "all passed";
  document.getElementById("view").innerHTML = `<pre>${esc(results.map(r => `${r.ok ? "ok  " : "FAIL"} ${r.name}${r.msg ? `\n     ${r.msg}` : ""}`).join("\n"))}\n\n${results.length - failed.length} of ${results.length} passed</pre>`;
  fetch("/results", { method: "POST", body: JSON.stringify(results) }).catch(() => {});
}
// Let the app finish starting first, so its own render can't land on top of the results
const waitBoot = setInterval(() => { if (S.mode !== "loading") { clearInterval(waitBoot); setTimeout(run, 800); } }, 50);
})();
