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
  test("deload: no PR or volume nudges during the week", () => scene({
    sessions: steadyWeeks(3), health: { [today]: { readiness: 85 } }, settings: { ...bigGear, deloads: [{ start: ago(1), end: addDays(today, 5) }] } }, () => {
    const m = coach(today).msgs; ok(m.some(x => x.t.includes("Deload week</b>, day 2 of 7")), "banner"); ok(!m.some(x => /push for a PR|Light this week/.test(x.t)), "nudges");
  }));

  const failed = results.filter(r => !r.ok);
  document.title = failed.length ? `${failed.length} FAILED` : "all passed";
  document.getElementById("view").innerHTML = `<pre>${esc(results.map(r => `${r.ok ? "ok  " : "FAIL"} ${r.name}${r.msg ? `\n     ${r.msg}` : ""}`).join("\n"))}\n\n${results.length - failed.length} of ${results.length} passed</pre>`;
  fetch("/results", { method: "POST", body: JSON.stringify(results) }).catch(() => {});
}
// Let the app finish starting first, so its own render can't land on top of the results
const waitBoot = setInterval(() => { if (S.mode !== "loading") { clearInterval(waitBoot); setTimeout(run, 800); } }, 50);
})();
