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

  const failed = results.filter(r => !r.ok);
  document.title = failed.length ? `${failed.length} FAILED` : "all passed";
  document.getElementById("view").innerHTML = `<pre>${esc(results.map(r => `${r.ok ? "ok  " : "FAIL"} ${r.name}${r.msg ? `\n     ${r.msg}` : ""}`).join("\n"))}\n\n${results.length - failed.length} of ${results.length} passed</pre>`;
  fetch("/results", { method: "POST", body: JSON.stringify(results) }).catch(() => {});
}
// Let the app finish starting first, so its own render can't land on top of the results
const waitBoot = setInterval(() => { if (S.mode !== "loading") { clearInterval(waitBoot); setTimeout(run, 800); } }, 50);
})();
