"use strict";
/* ============================== Catalog ============================== */
const MUSCLES = {
  chest:      { n: "Chest",       g: "Push", lo: 10, hi: 20, tau: 26 },
  frontDelt:  { n: "Front delts", g: "Push", lo: 0,  hi: 16, tau: 24 },
  sideDelt:   { n: "Side delts",  g: "Push", lo: 8,  hi: 20, tau: 20 },
  triceps:    { n: "Triceps",     g: "Push", lo: 6,  hi: 18, tau: 22 },
  lats:       { n: "Lats",        g: "Pull", lo: 10, hi: 20, tau: 26 },
  upperBack:  { n: "Upper back",  g: "Pull", lo: 8,  hi: 20, tau: 26 },
  rearDelt:   { n: "Rear delts",  g: "Pull", lo: 6,  hi: 18, tau: 20 },
  traps:      { n: "Traps",       g: "Pull", lo: 0,  hi: 16, tau: 24 },
  biceps:     { n: "Biceps",      g: "Pull", lo: 6,  hi: 18, tau: 22 },
  forearms:   { n: "Forearms",    g: "Pull", lo: 0,  hi: 16, tau: 20 },
  quads:      { n: "Quads",       g: "Legs", lo: 10, hi: 20, tau: 32 },
  glutes:     { n: "Glutes",      g: "Legs", lo: 8,  hi: 20, tau: 32 },
  hamstrings: { n: "Hamstrings",  g: "Legs", lo: 8,  hi: 18, tau: 34 },
  adductors:  { n: "Adductors",   g: "Legs", lo: 0,  hi: 14, tau: 28 },
  calves:     { n: "Calves",      g: "Legs", lo: 6,  hi: 16, tau: 20 },
  lowerBack:  { n: "Lower back",  g: "Core", lo: 0,  hi: 12, tau: 36 },
  abs:        { n: "Abs",         g: "Core", lo: 6,  hi: 20, tau: 20 },
  obliques:   { n: "Obliques",    g: "Core", lo: 0,  hi: 14, tau: 20 },
};
// kind: weight = load × reps · bodyweight = reps (optional added load) · time = seconds
// pattern: push | pull | squat | hinge | core | arms. inc = suggested lb jump.
const BUILTIN = [
  ["bench", "Barbell bench press", "push", "weight", { chest: 1, frontDelt: .5, triceps: .5 }, 5],
  ["db_bench", "Dumbbell bench press", "push", "weight", { chest: 1, frontDelt: .5, triceps: .5 }, 5],
  ["incline_db", "Incline dumbbell press", "push", "weight", { chest: 1, frontDelt: .75, triceps: .5 }, 5],
  ["db_fly", "Dumbbell fly", "push", "weight", { chest: 1, frontDelt: .25 }, 5],
  ["pushup", "Push-up", "push", "bodyweight", { chest: 1, frontDelt: .5, triceps: .5, abs: .25 }, 0],
  ["dip", "Dip", "push", "bodyweight", { triceps: 1, chest: .75, frontDelt: .5 }, 0],
  ["ohp", "Overhead press", "push", "weight", { frontDelt: 1, sideDelt: .5, triceps: .5 }, 5],
  ["db_ohp", "Dumbbell shoulder press", "push", "weight", { frontDelt: 1, sideDelt: .5, triceps: .5 }, 5],
  ["lateral", "Lateral raise", "push", "weight", { sideDelt: 1 }, 2.5],
  ["tri_oh", "Overhead triceps extension", "arms", "weight", { triceps: 1 }, 5],
  ["skull", "Skull crusher", "arms", "weight", { triceps: 1 }, 5],
  ["pushdown", "Triceps pushdown", "arms", "weight", { triceps: 1 }, 5],
  ["bb_row", "Barbell row", "pull", "weight", { upperBack: 1, lats: 1, rearDelt: .5, biceps: .5, lowerBack: .25 }, 5],
  ["db_row", "One-arm dumbbell row", "pull", "weight", { lats: 1, upperBack: 1, rearDelt: .5, biceps: .5 }, 5],
  ["pullup", "Pull-up", "pull", "bodyweight", { lats: 1, upperBack: .5, biceps: .5, forearms: .25 }, 0],
  ["chinup", "Chin-up", "pull", "bodyweight", { lats: 1, biceps: .75, upperBack: .5, forearms: .25 }, 0],
  ["pulldown", "Lat pulldown", "pull", "weight", { lats: 1, upperBack: .5, biceps: .5 }, 5],
  ["inv_row", "Inverted row", "pull", "bodyweight", { upperBack: 1, lats: .75, rearDelt: .5, biceps: .5 }, 0],
  ["face_pull", "Face pull", "pull", "weight", { rearDelt: 1, upperBack: .5, traps: .25 }, 5],
  ["rev_fly", "Reverse fly", "pull", "weight", { rearDelt: 1, upperBack: .5 }, 2.5],
  ["shrug", "Shrug", "pull", "weight", { traps: 1, forearms: .25 }, 10],
  ["bb_curl", "Barbell curl", "arms", "weight", { biceps: 1, forearms: .25 }, 5],
  ["db_curl", "Dumbbell curl", "arms", "weight", { biceps: 1, forearms: .25 }, 5],
  ["hammer", "Hammer curl", "arms", "weight", { biceps: .75, forearms: .75 }, 5],
  ["squat", "Back squat", "squat", "weight", { quads: 1, glutes: 1, adductors: .5, lowerBack: .25 }, 10],
  ["front_squat", "Front squat", "squat", "weight", { quads: 1, glutes: .75, adductors: .5, upperBack: .25 }, 5],
  ["goblet", "Goblet squat", "squat", "weight", { quads: 1, glutes: .75, adductors: .5 }, 5],
  ["split_squat", "Bulgarian split squat", "squat", "weight", { quads: 1, glutes: 1, adductors: .25 }, 5],
  ["lunge", "Lunge", "squat", "weight", { quads: 1, glutes: 1, adductors: .25 }, 5],
  ["deadlift", "Deadlift", "hinge", "weight", { glutes: 1, hamstrings: 1, lowerBack: 1, traps: .5, quads: .25, forearms: .5 }, 10],
  ["rdl", "Romanian deadlift", "hinge", "weight", { hamstrings: 1, glutes: 1, lowerBack: .5, forearms: .25 }, 10],
  ["hip_thrust", "Hip thrust", "hinge", "weight", { glutes: 1, hamstrings: .25 }, 10],
  ["kb_swing", "Kettlebell swing", "hinge", "weight", { glutes: 1, hamstrings: .75, lowerBack: .5 }, 0],
  ["leg_curl", "Leg curl", "hinge", "weight", { hamstrings: 1 }, 5],
  ["back_ext", "Back extension", "hinge", "bodyweight", { lowerBack: 1, glutes: .5, hamstrings: .5 }, 0],
  ["calf", "Calf raise", "squat", "weight", { calves: 1 }, 10],
  ["situp", "Sit-up", "core", "bodyweight", { abs: 1 }, 0],
  ["crunch", "Crunch", "core", "bodyweight", { abs: 1 }, 0],
  ["leg_raise", "Hanging leg raise", "core", "bodyweight", { abs: 1, forearms: .25 }, 0],
  ["twist", "Russian twist", "core", "bodyweight", { obliques: 1, abs: .5 }, 0],
  ["pallof", "Pallof press", "core", "weight", { obliques: 1, abs: .5 }, 5],
  ["ab_wheel", "Ab wheel rollout", "core", "bodyweight", { abs: 1, lats: .25 }, 0],
  ["plank", "Plank", "core", "time", { abs: 1, obliques: .5 }, 0],
  ["side_plank", "Side plank", "core", "time", { obliques: 1, abs: .25 }, 0],
  ["floor_press", "Barbell floor press", "push", "weight", { chest: 1, triceps: .75, frontDelt: .5 }, 5],
  ["pike_pushup", "Pike push-up", "push", "bodyweight", { frontDelt: 1, sideDelt: .5, triceps: .5 }, 0],
  ["glute_bridge", "Glute bridge", "hinge", "bodyweight", { glutes: 1, hamstrings: .25 }, 0],
  ["sl_rdl", "Single-leg Romanian deadlift", "hinge", "bodyweight", { hamstrings: 1, glutes: 1, lowerBack: .25 }, 0],
].map(([id, name, pattern, kind, muscles, inc]) => ({ id, name, pattern, kind, muscles, inc, builtin: true }));
// Cardio from Strava: muscles loaded per sport. Relative Effort / 10 ≈ hard-set equivalents of fatigue (not counted as lifting volume).
const CARDIO = {
  Run: { quads: .8, hamstrings: .5, glutes: .5, calves: 1 }, TrailRun: { quads: .9, hamstrings: .5, glutes: .6, calves: 1 }, VirtualRun: { quads: .8, hamstrings: .5, glutes: .5, calves: 1 },
  Ride: { quads: 1, glutes: .5, calves: .3 }, VirtualRide: { quads: 1, glutes: .5, calves: .3 }, GravelRide: { quads: 1, glutes: .5, calves: .3 }, MountainBikeRide: { quads: 1, glutes: .6, calves: .3, forearms: .3 },
  Rowing: { lats: .8, upperBack: .8, quads: .7, glutes: .5, hamstrings: .4, biceps: .3, lowerBack: .3 }, VirtualRow: { lats: .8, upperBack: .8, quads: .7, glutes: .5, hamstrings: .4, biceps: .3, lowerBack: .3 },
  Hike: { quads: .6, glutes: .5, calves: .5 }, Walk: { calves: .3, quads: .2 }, Swim: { lats: .7, frontDelt: .4, triceps: .3, upperBack: .4 },
  Elliptical: { quads: .6, glutes: .4 }, StairStepper: { quads: .8, glutes: .7, calves: .5 }, NordicSki: { lats: .6, triceps: .4, quads: .6, glutes: .4 },
};
const CARDIO_MIN_EFFORT = 10;   // easy walks don't register
const PATTERN_NAMES = { push: "Push", pull: "Pull", squat: "Legs: squat", hinge: "Legs: hinge", core: "Core", arms: "Arms" };
const EFFORT = { easy: { label: "Easy", f: .6 }, solid: { label: "Solid", f: 1 }, hard: { label: "Grinder", f: 1.2 } };

/* ============================== Equipment ============================== */
const EQUIP = { barbell: "Barbell", plates: "Loose plates", ezbar: "EZ curl bar", dumbbells: "Dumbbells", kettlebell: "Kettlebell", bench: "Bench", rack: "Rack with safeties",
  pullupBar: "Pull-up bar", dipBars: "Dip bars", bands: "Resistance bands", cable: "Cable machine", abWheel: "Ab wheel", legCurl: "Leg curl machine", backExt: "Back extension bench" };
const LOADABLE = ["barbell", "ezbar", "dumbbells", "kettlebell"];   // tools with a max load (dumbbells: per hand)
const EQUIP_DEFAULT = { have: ["barbell", "plates", "ezbar", "pullupBar"], max: { barbell: 50, ezbar: 50 } };
// What each exercise needs: every entry must be met; "a|b" means either one. Unlisted = bodyweight only.
const NEEDS = { bench: ["barbell", "bench", "rack"], db_bench: ["dumbbells", "bench"], incline_db: ["dumbbells", "bench"], db_fly: ["dumbbells", "bench"],
  dip: ["dipBars"], ohp: ["barbell"], db_ohp: ["dumbbells"], lateral: ["dumbbells|plates|bands|cable"], tri_oh: ["dumbbells|ezbar|plates|bands|cable"],
  skull: ["ezbar|barbell|dumbbells"], pushdown: ["bands|cable"], bb_row: ["barbell"], db_row: ["dumbbells"], pullup: ["pullupBar"], chinup: ["pullupBar"],
  pulldown: ["cable"], inv_row: ["rack"], face_pull: ["bands|cable"], rev_fly: ["dumbbells|plates|bands|cable"], shrug: ["barbell|dumbbells"],
  bb_curl: ["ezbar|barbell"], db_curl: ["dumbbells"], hammer: ["dumbbells"], squat: ["barbell", "rack"], front_squat: ["barbell"],
  goblet: ["dumbbells|kettlebell|plates"], deadlift: ["barbell"], rdl: ["barbell"], hip_thrust: ["barbell|dumbbells", "bench"], kb_swing: ["kettlebell"],
  leg_curl: ["legCurl"], back_ext: ["backExt"], leg_raise: ["pullupBar"], pallof: ["bands|cable"], ab_wheel: ["abWheel"], floor_press: ["barbell"] };
// Harder variation to move to once a capped load gets easy
const VARIANT = { deadlift: "sl_rdl", rdl: "sl_rdl", front_squat: "split_squat", goblet: "split_squat" };
function equip() { const e = S.settings.equip || {}; return { have: e.have || EQUIP_DEFAULT.have, max: { ...EQUIP_DEFAULT.max, ...(e.max || {}) } }; }
function missingFor(exId) {
  const have = new Set(equip().have);
  return (NEEDS[exId] || []).filter(req => !req.split("|").some(t => have.has(t))).map(req => req.split("|").map(t => EQUIP[t].toLowerCase()).join(" or "));
}
function canDo(exId) { return !missingFor(exId).length; }
// Heaviest load (lb) the gear you own allows on this exercise, or null when there's no cap
function capLb(exId) {
  if (exById(exId).kind !== "weight") return null;
  const kit = plateKit(exId); if (kit) return kitMax(kit);
  const { have, max } = equip();
  for (const req of NEEDS[exId] || []) for (const t of req.split("|")) if (LOADABLE.includes(t) && have.includes(t) && max[t]) return max[t];
  return null;
}
function atCap(exId) {
  const cap = capLb(exId), h = historyFor(exId);
  return !!cap && h.length > 0 && Math.max(...h[h.length - 1].e.sets.map(s => s.w || 0)) >= cap - .01;
}

/* ---------- Plates and warm-ups ---------- */
// settings.equip.load = { mode: "max" (just type the heaviest load) | "plates" (work it out from bars and plates),
//   unit: which standard sizes to list ("lb"|"kg"), bar: { barbell, ezbar, dumbbells (one handle) } empty weights in lb,
//   limit: { tool: lb } (a bar's rating or sleeve room), plates: { "45lb": pairs, "20kg": pairs } }
// Each plate keeps its own unit, so lb and kg plates (and odd sizes) can be mixed on one bar.
const PLATE_SIZES = { lb: [45, 35, 25, 15, 10, 5, 2.5], kg: [25, 20, 15, 10, 5, 2.5, 1.25] };
const PLATE_BARS = ["barbell", "ezbar", "dumbbells"];
const plateKey = (w, u) => `${+w}${u}`;
function parsePlate(k) { const m = /^([\d.]+)(lb|kg)$/.exec(k); return m ? { w: +m[1], u: m[2], lb: +m[1] * (m[2] === "kg" ? LB_PER_KG : 1) } : null; }
function plateLoad() {
  const l = S.settings.equip?.load || {};
  let plates = l.plates;
  if (!plates && l.pairs) plates = Object.fromEntries(Object.entries(l.pairs).map(([w, n]) => [plateKey(w, l.unit || "lb"), n]));   // first version: one unit for all
  const bar = l.bar || {};
  return { mode: l.mode || (Object.values(bar).some(v => v > 0) ? "plates" : "max"), unit: l.unit || unit(), bar, limit: l.limit || {}, plates: plates || {} };
}
function savePlates(L) { const { pairs, ...rest } = S.settings.equip?.load || {}; setEquip({ load: { ...rest, mode: L.mode, unit: L.unit, bar: L.bar, limit: L.limit, plates: L.plates } }); }
function setEquip(patch) { S.settings = { ...S.settings, equip: { ...(S.settings.equip || {}), ...equip(), ...patch } }; }
// The bar this exercise is loaded on (the first one you own that it can use), or null
function plateBar(exId) {
  if (exById(exId).kind !== "weight") return null;
  const have = equip().have;
  for (const req of NEEDS[exId] || []) for (const t of req.split("|")) if (have.includes(t)) return PLATE_BARS.includes(t) ? t : null;
  return null;
}
// Bar weight and the plates you can use for this exercise, in "Bars and plates" mode: sizes [{ w, u, lb, pairs }], heaviest first.
// A pair of dumbbells spreads the plates over four sleeves, so two-dumbbell lifts get half your pairs per dumbbell (weights stay per hand).
function plateKit(exId) {
  const tool = plateBar(exId), L = plateLoad();
  if (L.mode !== "plates" || !tool || !(L.bar[tool] > 0)) return null;
  if (!Object.values(L.plates).some(n => n > 0)) return null;   // no plates entered yet: keep the typed max
  const two = tool === "dumbbells" && PER_HAND.has(exId);
  const sizes = Object.entries(L.plates).map(([k, n]) => ({ ...parsePlate(k), pairs: two ? Math.floor(n / 2) : n })).filter(p => p.lb > 0 && p.pairs > 0).sort((a, b) => b.lb - a.lb);
  return { tool, two, bar: L.bar[tool], limit: L.limit[tool] > 0 ? L.limit[tool] : Infinity, sizes };
}
// Heaviest load the bar, the plates and its limit allow
function kitMax(kit) { return Math.min(kit.limit, +(kit.bar + 2 * kit.sizes.reduce((t, p) => t + p.lb * p.pairs, 0)).toFixed(2)); }
// Every per-side load the plates can make (in hundredths of a lb), with the fewest plates for each
function plateTable(kit) {
  const best = new Map([[0, []]]);
  for (const p of kit.sizes) {
    const u = Math.round(p.lb * 100);
    for (const [s, list] of [...best.entries()].sort((a, b) => b[0] - a[0]))
      for (let n = 1; n <= p.pairs; n++) {
        const k = s + u * n, cand = [...list, ...Array(n).fill(p)];
        if (!best.has(k) || best.get(k).length > cand.length) best.set(k, cand);
      }
  }
  return best;
}
// Plates per side for a total in lb: { side (plates, heaviest first), exact, below, above (nearest loadable totals in lb) }.
// Within half the display's rounding step counts as exact, so kg plates still match the lb number shown for them (and vice versa).
function plateTol() { return unit() === "kg" ? .25 * LB_PER_KG : .25; }
function platesFor(lb, kit) {
  const PLATE_TOL = plateTol();
  const tbl = plateTable(kit), tot = k => +(kit.bar + 2 * k / 100).toFixed(2);
  if (lb < kit.bar - PLATE_TOL) return { side: [], exact: false, below: null, above: kit.bar };
  const keys = [...tbl.keys()].filter(k => tot(k) <= kit.limit + PLATE_TOL).sort((a, b) => a - b);
  const hit = keys.find(k => Math.abs(tot(k) - lb) <= PLATE_TOL);
  if (hit != null) return { side: [...tbl.get(hit)].sort((a, b) => b.lb - a.lb), exact: true };
  const lo = keys.filter(k => tot(k) < lb).pop(), hi = keys.find(k => tot(k) > lb);
  return { side: [], exact: false, below: lo != null ? tot(lo) : null, above: hi != null ? tot(hi) : null };
}
// "25 + 10 + 2.5 lb", or each plate's unit when they're mixed: "20 kg + 10 lb"
function plateTxt(side) {
  if (!side.length) return "empty bar";
  const units = new Set(side.map(p => p.u));
  return units.size > 1 ? side.map(p => `${+p.w} ${p.u}`).join(" + ") : `${side.map(p => +p.w).join(" + ")} ${side[0].u}`;
}
// Heaviest loadable weight at or under lb (plates when known, else the exercise's step)
function loadableAtMost(lb, exId, kit) {
  if (kit) { if (lb < kit.bar) return null; const p = platesFor(lb, kit); return p.exact ? lb : p.below; }
  const step = unit() === "kg" ? stepLb() : (exById(exId).inc || 5);
  return Math.floor(lb / step + 1e-6) * step;
}
// Main lifts get a short ramp up to the first working weight: about 40% × 8, 60% × 5 and, from 90 lb up, 80% × 3.
// Warm-up sets aren't logged as sets, so they never count toward volume, bests or progression.
const WARMUP_MIN = 40;
let MAIN_LIFTS = null;   // built on first use: SLOT_SUBS is declared further down
function warmups(exId, workLb) {
  if (S.settings.warmups === false || !(MAIN_LIFTS ||= new Set(Object.values(SLOT_SUBS).flatMap(([, ids]) => ids))).has(exId) || exById(exId).kind !== "weight" || !(workLb >= WARMUP_MIN)) return [];
  const kit = plateKit(exId), steps = [[.4, 8], [.6, 5], ...(workLb >= 90 ? [[.8, 3]] : [])], out = [];
  for (const [f, r] of steps) {
    let w = loadableAtMost(workLb * f, exId, kit);
    if (w == null) w = kit ? kit.bar : 0;   // under the bar's weight: warm up with the empty bar
    if (!(w > 0) || w > workLb - 5 || out.some(x => Math.abs(x.w - w) < .01)) continue;
    out.push({ w, r, bar: !!kit && Math.abs(w - kit.bar) < .01, side: kit ? platesFor(w, kit).side : null });
  }
  return out;
}

/* ============================== Exercise guides ============================== */
// s = setup, r = the rep, c = posture cues, m = common mistakes
const GUIDE = {
  bench: {
    s: ["Lie with eyes under the bar, feet flat and planted.", "Squeeze shoulder blades together and down; keep a slight arch in the upper back.", "Grip just wider than shoulders, wrists stacked over elbows."],
    r: ["Unrack and hold the bar over your shoulders with arms locked.", "Lower under control to the lower chest, elbows about 45–70° from your sides.", "Touch lightly, then press up and slightly back toward your face."],
    c: ["Shoulder blades stay pinned for the whole set.", "Butt stays on the bench; drive through your feet.", "Forearms vertical at the bottom."],
    m: ["Elbows flared straight out to 90°, which strains the shoulders.", "Bouncing the bar off the chest.", "Pressing alone without safety pins or a spotter. Set the pins just below chest height."],
  },
  db_bench: {
    s: ["Sit with dumbbells on your thighs, then lie back and kick them up one at a time.", "Shoulder blades back and down, feet planted."],
    r: ["Start with arms over your shoulders, palms facing your feet or slightly turned in.", "Lower until the dumbbells are at chest level and elbows are slightly below the bench.", "Press up and slightly in, without clanking the dumbbells together."],
    c: ["Elbows tucked about 45° from your sides.", "Wrists straight, knuckles to the ceiling."],
    m: ["Dropping the dumbbells to the floor from the top. Bring them to your chest, then sit up.", "Letting the shoulders roll forward at the top."],
  },
  incline_db: {
    s: ["Set the bench to 30–45°. Steeper turns it into a shoulder press.", "Kick the dumbbells up and pin your shoulder blades back."],
    r: ["Lower to the upper chest, elbows slightly in front of your torso.", "Press up over your collarbones."],
    c: ["Keep your chest up toward the dumbbells.", "Hips stay down on the seat."],
    m: ["Arching off the bench to make it a flat press.", "Too steep an angle."],
  },
  db_fly: {
    s: ["Lie flat with dumbbells pressed up, palms facing each other.", "Soften your elbows into a slight, fixed bend."],
    r: ["Open your arms in a wide arc until you feel a stretch across your chest.", "Hug the dumbbells back up along the same arc."],
    c: ["The elbow angle doesn't change. It's a hug, not a press.", "Shoulder blades stay back."],
    m: ["Going too heavy and turning it into a press.", "Over-stretching past shoulder level."],
  },
  pushup: {
    s: ["Hands slightly wider than shoulders, fingers forward.", "Body in one straight line from head to heels; squeeze glutes and brace your abs."],
    r: ["Lower until your chest is a fist's height from the floor.", "Push the floor away until your arms are straight."],
    c: ["Elbows about 45° from your body, not flared.", "Head neutral. Look slightly ahead of your hands."],
    m: ["Hips sagging or piking up.", "Half reps. If full ones are too hard, elevate your hands on a bench."],
  },
  dip: {
    s: ["Grip the bars, jump up to straight arms, shoulders down away from your ears.", "Lean slightly forward for more chest, stay upright for more triceps."],
    r: ["Bend your elbows and lower until your shoulders are just below your elbows.", "Press back up to straight arms."],
    c: ["Shoulders stay down and back. Don't let them shrug up.", "Control the bottom. No bouncing."],
    m: ["Sinking too deep while your shoulders roll forward. Stop where it stays comfortable.", "Swinging your legs for momentum."],
  },
  ohp: {
    s: ["Bar in the rack at upper-chest height; grip just outside shoulders.", "Unrack with the bar resting on your front delts, elbows slightly in front of the bar.", "Feet hip-width, glutes and abs squeezed hard."],
    r: ["Tuck your chin back and press the bar straight up past your face.", "Once it clears your head, push your head through so the bar ends over your mid-foot.", "Lower the same path back to your collarbones."],
    c: ["Ribs down. Don't lean back into a standing bench press.", "Bar path is vertical; your head moves out of the way."],
    m: ["Overarching the lower back.", "Pressing the bar forward around your face."],
  },
  db_ohp: {
    s: ["Sit on an upright bench or stand; dumbbells at shoulder height, palms forward or slightly in.", "Brace your abs and keep your ribs down."],
    r: ["Press up until your arms are straight, dumbbells over your shoulders.", "Lower under control to ear or chin height."],
    c: ["Forearms vertical throughout.", "Back flat against the pad if seated."],
    m: ["Arching away from the backrest.", "Clanking the dumbbells together at the top."],
  },
  lateral: {
    s: ["Stand tall with light dumbbells at your sides, slight bend in the elbows.", "Lean a few degrees forward."],
    r: ["Raise your arms out to the side until they're about shoulder height.", "Pause, then lower slowly over 2–3 seconds."],
    c: ["Lead with your elbows, as if pushing them to the walls.", "Keep your shoulders down. Don't shrug the weight up."],
    m: ["Swinging the body to get the weight up. Go lighter.", "Lifting well above shoulder height."],
  },
  tri_oh: {
    s: ["Hold one dumbbell with both hands (or a cable) overhead.", "Ribs down, abs braced, elbows pointing forward."],
    r: ["Lower the weight behind your head by bending only at the elbows.", "Extend back to straight arms."],
    c: ["Upper arms stay still beside your head.", "Get a deep stretch at the bottom."],
    m: ["Elbows flaring wide.", "Arching the lower back to get the weight up."],
  },
  skull: {
    s: ["Lie on a bench holding an EZ-bar or dumbbells over your shoulders.", "Tilt your arms slightly back toward your head."],
    r: ["Bend at the elbows to lower the weight to your forehead or just behind your head.", "Extend back to the start."],
    c: ["Upper arms stay still.", "Control the descent. It's your face."],
    m: ["Letting the elbows drift and turning it into a pullover.", "Going too heavy too soon. Elbows don't like it."],
  },
  pushdown: {
    s: ["Face the cable or band anchor, grip the bar or rope, elbows at your sides.", "Slight forward lean, abs braced."],
    r: ["Push down until your arms are fully straight; squeeze.", "Let your forearms come up to about parallel, under control."],
    c: ["Elbows pinned to your ribs.", "Only the forearms move."],
    m: ["Leaning over the bar and using bodyweight.", "Elbows drifting forward at the top."],
  },
  bb_row: {
    s: ["Bar over mid-foot, grip just outside your knees.", "Hinge at the hips with a flat back and torso about 30–45° above the floor; knees soft."],
    r: ["Pull the bar to your lower ribs, driving your elbows back.", "Pause briefly, then lower to straight arms."],
    c: ["Back stays flat; brace like you're about to be punched.", "Torso angle stays the same. Don't stand up into each rep."],
    m: ["Rounding the lower back.", "Jerking the weight with your hips."],
  },
  db_row: {
    s: ["One knee and same-side hand on a bench, other foot on the floor.", "Back flat and parallel to the floor; dumbbell hanging straight down."],
    r: ["Pull the dumbbell toward your hip, elbow close to your body.", "Lower until your arm is straight and you feel a stretch in your lat."],
    c: ["Think 'elbow to back pocket', not 'hand to armpit'.", "Shoulders square to the floor. Don't twist open."],
    m: ["Rotating the torso to heave the weight up.", "Shrugging toward the ear."],
  },
  pullup: {
    s: ["Overhand grip a bit wider than shoulders.", "Hang with straight arms, legs together, slightly in front of you. Use a band under your knees or feet if needed."],
    r: ["Pull your shoulder blades down, then pull your elbows toward your ribs.", "Chin clears the bar; lower all the way to straight arms."],
    c: ["Chest up toward the bar.", "No kipping; keep your body still."],
    m: ["Half reps from a bent-arm hang.", "Craning your neck to get the chin over."],
  },
  chinup: {
    s: ["Underhand grip, shoulder width.", "Hang with straight arms and your abs braced."],
    r: ["Pull your elbows down and back until your chin clears the bar.", "Lower under control to a full hang."],
    c: ["Lead with your chest.", "Squeeze your glutes to stop swinging."],
    m: ["Dropping fast. The lowering half builds strength too.", "Shrugging at the top."],
  },
  pulldown: {
    s: ["Thighs locked under the pad; grip a bit wider than shoulders.", "Lean back slightly, chest up."],
    r: ["Pull the bar to your upper chest, driving your elbows down.", "Let it rise until your arms are straight and your lats stretch."],
    c: ["Shoulders down first, then pull.", "Torso angle stays fixed."],
    m: ["Leaning way back and rowing it.", "Pulling behind the neck."],
  },
  inv_row: {
    s: ["Bar in a rack at about hip height (or rings). Hang underneath with straight arms.", "Body straight from heels to head, glutes tight."],
    r: ["Pull your chest to the bar, elbows about 45° out.", "Lower to straight arms."],
    c: ["Body stays rigid like a plank.", "Squeeze your shoulder blades at the top."],
    m: ["Hips sagging.", "Craning the chin toward the bar."],
  },
  face_pull: {
    s: ["Rope or band anchored at about forehead height.", "Grip with thumbs toward you, step back until your arms are straight."],
    r: ["Pull the rope toward your face, splitting it apart so your hands end beside your ears.", "Finish with your elbows high and your upper arms rotated back; return slowly."],
    c: ["Elbows stay at or above shoulder height.", "Stand tall; don't lean back."],
    m: ["Going heavy and turning it into a row.", "Elbows dropping low."],
  },
  rev_fly: {
    s: ["Hinge forward with a flat back (or lie chest-down on an incline bench), light dumbbells hanging.", "Slight bend in the elbows."],
    r: ["Raise your arms out wide until they're in line with your body.", "Lower slowly."],
    c: ["Lead with the back of your hands and elbows.", "Don't shrug."],
    m: ["Too heavy, so the traps take over.", "Jerking with the torso."],
  },
  shrug: {
    s: ["Stand tall holding a bar or dumbbells at your sides.", "Arms straight and relaxed."],
    r: ["Lift your shoulders straight up toward your ears.", "Hold one second, then lower fully."],
    c: ["Straight up and down. No rolling.", "Chin stays neutral."],
    m: ["Rolling the shoulders in circles.", "Bending the elbows to help."],
  },
  bb_curl: {
    s: ["Stand tall, underhand grip at shoulder width, bar against your thighs.", "Elbows at your sides."],
    r: ["Curl the bar up by bending only at the elbows.", "Squeeze at the top, then lower over 2–3 seconds."],
    c: ["Elbows stay pinned; don't let them drift forward.", "Ribs down, glutes tight."],
    m: ["Swinging with the hips and back.", "Cutting the lowering phase short."],
  },
  db_curl: {
    s: ["Stand or sit tall with dumbbells at your sides, palms forward.", "Elbows at your sides."],
    r: ["Curl up, turning the pinky slightly up at the top.", "Lower slowly to straight arms."],
    c: ["Upper arm stays still.", "Full range: straight arm at the bottom."],
    m: ["Swinging.", "Rushing the reps."],
  },
  hammer: {
    s: ["Dumbbells at your sides, palms facing each other.", "Stand tall, elbows tucked."],
    r: ["Curl up keeping the thumbs on top.", "Lower under control."],
    c: ["Wrists stay neutral and straight.", "Elbows don't drift forward."],
    m: ["Using momentum.", "Letting the wrists bend."],
  },
  squat: {
    s: ["Bar on your upper traps, below the bony bump at the base of your neck; grip just outside shoulders.", "Set the safety pins just below your bottom position.", "Walk out two steps; feet shoulder-width, toes turned out 15–30°."],
    r: ["Big breath into your belly and brace.", "Sit down and back between your heels, knees tracking over your toes.", "Go to at least parallel (hip crease level with the knee), then drive up through mid-foot."],
    c: ["Chest proud, back flat. The bar stays over mid-foot.", "Knees push out in line with your toes.", "Whole foot stays planted."],
    m: ["Knees caving in on the way up.", "Heels lifting, or weight drifting to the toes.", "Lower back rounding at the bottom. Stop just above the depth where it rounds."],
  },
  front_squat: {
    s: ["Bar on your front delts, touching your throat; fingertips under the bar or arms crossed.", "Elbows high, upper arms near parallel to the floor."],
    r: ["Brace and squat straight down; your torso stays more upright than in a back squat.", "Drive up, leading with the elbows."],
    c: ["Elbows up the whole time; if they drop, the bar rolls forward.", "Knees travel forward over the toes. That's fine here."],
    m: ["Elbows sinking.", "Holding the bar with your hands instead of resting it on your shoulders."],
  },
  goblet: {
    s: ["Hold a dumbbell or kettlebell vertically against your chest, elbows down.", "Feet shoulder-width or slightly wider, toes out."],
    r: ["Squat down between your heels until your elbows brush your knees.", "Stand up by driving through mid-foot."],
    c: ["Chest stays tall; the weight stays glued to your chest.", "Knees push out."],
    m: ["Letting the weight pull you forward.", "Heels lifting."],
  },
  split_squat: {
    s: ["Rear foot laces-down on a bench behind you; front foot far enough forward that the front shin stays roughly vertical at the bottom.", "Dumbbells at your sides, or bodyweight to start."],
    r: ["Lower straight down until the back knee nearly touches the floor.", "Drive up through the front heel. Do all reps, then switch legs."],
    c: ["Torso tall with a slight forward lean.", "Front knee tracks over the toes."],
    m: ["Front foot too close, so the heel lifts.", "Pushing off the back leg."],
  },
  lunge: {
    s: ["Stand tall with dumbbells at your sides, or bodyweight.", "For walking lunges, clear a straight path."],
    r: ["Step forward and lower until both knees are about 90° and the back knee nearly touches the floor.", "Drive through the front heel and step through into the next lunge."],
    c: ["Torso upright, abs braced.", "Front knee over the foot, not caving inward."],
    m: ["Steps too short, so the front heel lifts.", "Slamming the back knee into the floor."],
  },
  deadlift: {
    s: ["Bar over mid-foot, about 1 inch from your shins; feet hip-width.", "Hinge down and grip just outside your legs; shins touch the bar.", "Chest up, back flat, shoulders slightly in front of the bar. Pull the slack out until the bar clicks."],
    r: ["Brace hard and push the floor away with your legs.", "Keep the bar dragging up your shins and thighs; stand tall with your hips through.", "Lower by pushing your hips back first, then bending your knees once the bar passes them."],
    c: ["The bar stays in contact with your legs the whole way.", "Back angle stays flat; hips and shoulders rise together.", "Lock out by squeezing your glutes, not by leaning back."],
    m: ["Rounding the lower back. Reset or lower the weight.", "Jerking the bar off the floor.", "Hips shooting up first, which turns it into a stiff-leg pull."],
  },
  rdl: {
    s: ["Stand tall holding the bar at your hips, overhand grip just outside your thighs.", "Knees softly bent, and they stay that way."],
    r: ["Push your hips straight back, sliding the bar down your thighs.", "Stop when you feel a strong hamstring stretch, usually just below the knee.", "Drive your hips forward to stand back up."],
    c: ["Back stays flat, with the chest proud.", "It's a hip hinge: the hips travel back, not down."],
    m: ["Rounding the back to reach lower.", "Bending the knees more and turning it into a squat."],
  },
  hip_thrust: {
    s: ["Upper back against a bench edge (just below the shoulder blades), bar padded across your hip crease.", "Feet flat, about hip-width, shins vertical at the top."],
    r: ["Tuck your chin, then drive through your heels to lift your hips until your torso is flat.", "Squeeze your glutes hard for one second, then lower."],
    c: ["Ribs down with a slight posterior pelvic tilt at the top.", "Eyes forward, not up at the ceiling."],
    m: ["Overarching the lower back at the top.", "Feet too far out, so the hamstrings take over."],
  },
  kb_swing: {
    s: ["Kettlebell a foot in front of you; feet a bit wider than hips.", "Hinge and grip the handle, back flat."],
    r: ["Hike the bell back between your legs like a football snap.", "Snap your hips forward to float it to chest height; arms are just ropes.", "Let it fall back and hinge again."],
    c: ["Hips drive it, not the arms or a squat.", "Stand tall and squeeze your glutes at the top."],
    m: ["Squatting the swing.", "Lifting with the shoulders."],
  },
  leg_curl: {
    s: ["Lie face down (or sit) with the pad just above your heels; knees just off the edge of the bench.", "Hold the handles; hips pressed down."],
    r: ["Curl your heels toward your glutes.", "Lower slowly to almost straight."],
    c: ["Hips stay down on the pad.", "Smooth tempo."],
    m: ["Hips lifting to cheat the weight.", "Dropping it on the way down."],
  },
  back_ext: {
    s: ["Hips on the pad, feet anchored.", "Arms crossed on your chest, or hands behind your head."],
    r: ["Hinge down until you feel your hamstrings stretch.", "Raise up until your body is in a straight line. No higher."],
    c: ["Squeeze your glutes to come up.", "Neutral neck."],
    m: ["Hyperextending at the top.", "Jerking up fast."],
  },
  calf: {
    s: ["Balls of your feet on a step or plate, heels hanging off.", "Hold a dumbbell or rack for balance."],
    r: ["Lower your heels as far as they'll go and pause in the stretch.", "Rise as high as possible onto your toes and pause again."],
    c: ["Knees straight but not locked.", "Pressure on the big toe."],
    m: ["Bouncing through short reps.", "Rolling onto the outside of the foot."],
  },
  situp: {
    s: ["Lie on your back, knees bent, feet flat (anchored if you need to).", "Arms crossed on your chest."],
    r: ["Curl up one vertebra at a time until your chest is near your thighs.", "Lower back down under control."],
    c: ["Exhale on the way up.", "Chin slightly tucked, neck relaxed."],
    m: ["Yanking on your neck with your hands.", "Flopping back down."],
  },
  crunch: {
    s: ["Lie on your back, knees bent, feet flat.", "Hands lightly at your temples or crossed on your chest."],
    r: ["Curl your shoulders off the floor by shortening the space between your ribs and hips.", "Pause, then lower slowly."],
    c: ["Lower back stays in contact with the floor.", "Exhale hard at the top."],
    m: ["Pulling your head forward.", "Using momentum."],
  },
  leg_raise: {
    s: ["Hang from a bar with an overhand grip, shoulders active (pulled down).", "Legs together; bend the knees to make it easier."],
    r: ["Curl your pelvis up and lift your legs (or knees) toward your chest.", "Lower slowly without swinging."],
    c: ["Think 'curl the pelvis', not 'lift the legs'.", "Body stays still between reps."],
    m: ["Swinging.", "Lifting only with the hip flexors and not curling up."],
  },
  twist: {
    s: ["Sit with knees bent, lean back to about 45°, back straight.", "Hold a weight at your chest; feet down (easier) or up (harder)."],
    r: ["Rotate your torso to one side, bringing the weight beside your hip.", "Rotate to the other side. That's one rep per side."],
    c: ["Turn from the ribs, not just the arms.", "Chest stays proud."],
    m: ["Rounding the back.", "Swinging the weight with your arms."],
  },
  pallof: {
    s: ["Cable or band anchored at chest height, standing side-on to it.", "Hold the handle at your chest with both hands; step out until there's tension. Feet shoulder-width."],
    r: ["Press the handle straight out in front of your chest.", "Hold 2 seconds without letting it pull you around, then bring it back. Do all reps, then switch sides."],
    c: ["Hips and shoulders stay square to the front. The point is not rotating.", "Glutes and abs tight."],
    m: ["Letting the torso turn toward the anchor.", "Standing too close, so there's no tension."],
  },
  ab_wheel: {
    s: ["Kneel on a pad holding the wheel under your shoulders.", "Tuck your pelvis and round your upper back slightly."],
    r: ["Roll forward slowly as far as you can without your lower back sagging.", "Pull back with your abs to the start."],
    c: ["Hips and shoulders move together.", "Glutes squeezed the whole time."],
    m: ["Lower back arching at the far end. Shorten the range.", "Leading the return with the hips."],
  },
  plank: {
    s: ["Forearms on the floor, elbows under your shoulders.", "Legs straight, on your toes, body in one line."],
    r: ["Brace your abs and squeeze your glutes; hold for the set time.", "For weighted planks, have a plate placed across your upper back, not your lower back."],
    c: ["Push the floor away with your forearms.", "Neutral neck; look at the floor."],
    m: ["Hips sagging, or piked high.", "Holding your breath. Breathe behind the brace."],
  },
  side_plank: {
    s: ["Lie on your side, elbow under your shoulder, feet stacked (or knees bent to make it easier).", "Lift your hips into a straight line."],
    r: ["Hold, keeping hips high, then switch sides."],
    c: ["Body in one straight plane. Don't roll forward.", "Push down through the elbow."],
    m: ["Hips sagging.", "Shoulder shrugging up toward the ear."],
  },
  floor_press: {
    s: ["Sit on the floor with the bar across your thighs, then lie back and roll it up to your hips.", "Knees bent, feet flat. Pull the bar up over your lower chest; grip just wider than shoulders, shoulder blades squeezed together."],
    r: ["Lower until your upper arms touch the floor and pause there for a moment.", "Press back up to straight arms over your shoulders."],
    c: ["Elbows about 45° from your body.", "Wrists stacked over elbows."],
    m: ["Bouncing the elbows off the floor.", "Flaring the elbows straight out to the sides."],
  },
  pike_pushup: {
    s: ["Start in a push-up position, then walk your feet in and lift your hips high so your body makes an upside-down V.", "Hands shoulder-width, head between your arms."],
    r: ["Bend your elbows and lower the top of your head toward the floor, just in front of your hands.", "Press back up to straight arms."],
    c: ["Hips stay high the whole time.", "Elbows travel back at about 45°, not straight out."],
    m: ["Letting the hips drop so it turns into a regular push-up.", "Dropping fast into the bottom. Lower under control."],
  },
  glute_bridge: {
    s: ["Lie on your back, knees bent, feet flat about hip-width and close to your glutes.", "For load, roll the barbell over your hips with a pad or folded towel under it."],
    r: ["Drive through your heels to lift your hips until your body is straight from knees to shoulders.", "Squeeze your glutes for a second, then lower."],
    c: ["Ribs down; the movement comes from the hips.", "Push through the whole foot, mostly the heels."],
    m: ["Arching the lower back at the top.", "Feet too far away, so the hamstrings cramp."],
  },
  sl_rdl: {
    s: ["Stand on one leg with a soft knee, holding the barbell, a plate or nothing.", "Use a wall for a fingertip of balance at first."],
    r: ["Hinge at the hip, reaching the free leg straight back as your torso tips forward.", "Go until you feel a strong hamstring stretch, then drive the hip forward to stand. Do all reps, then switch legs."],
    c: ["Hips stay square to the floor. Don't let the free hip open up.", "Back flat; the standing knee stays softly bent."],
    m: ["Rounding the back to reach lower.", "Rushing. Balance improves fastest with slow reps."],
  },
};
const GUIDE_ALWAYS = "Stop if you feel sharp or joint pain. Muscle burn is fine; pinching or stabbing isn't. When form slips, the set is over.";

/* ============================== Joints, day notes, exercise advice ============================== */
// How much each exercise loads each joint (0–1). Unlisted = ~0.
const JOINT = {
  knee: { sl_rdl: .2, squat: 1, front_squat: 1, goblet: .8, split_squat: 1, lunge: 1, leg_curl: .4, deadlift: .4, kb_swing: .3, rdl: .2, hip_thrust: .2, calf: .1 },
  lowerBack: { sl_rdl: .4, glute_bridge: .2, deadlift: 1, rdl: .9, bb_row: .8, back_ext: .8, squat: .7, kb_swing: .7, ab_wheel: .6, front_squat: .5, situp: .5, twist: .5, ohp: .4, goblet: .3, leg_raise: .3, hip_thrust: .3, lunge: .3, split_squat: .3, db_row: .3, shrug: .2 },
  shoulder: { pike_pushup: .8, floor_press: .5, ohp: 1, db_ohp: 1, dip: 1, bench: .8, incline_db: .8, db_fly: .8, db_bench: .7, lateral: .6, pullup: .6, tri_oh: .6, chinup: .5, pulldown: .5, pushup: .5, ab_wheel: .5, side_plank: .4, skull: .3, bb_row: .3, db_row: .3, inv_row: .3, rev_fly: .3, squat: .3, front_squat: .3, face_pull: .2, plank: .2 },
  elbow: { floor_press: .4, pike_pushup: .3, skull: 1, tri_oh: .9, bb_curl: .7, dip: .7, pushdown: .6, db_curl: .6, chinup: .6, hammer: .5, pullup: .5, bench: .4, pushup: .4, pulldown: .4, ohp: .3 },
  wrist: { pike_pushup: .6, floor_press: .4, front_squat: .9, pushup: .7, bb_curl: .6, bench: .5, dip: .4, skull: .4, ohp: .4, db_bench: .3, plank: .3, side_plank: .3 },
  hip: { sl_rdl: .5, glute_bridge: .3, lunge: .8, split_squat: .8, squat: .6, kb_swing: .6, front_squat: .5, hip_thrust: .5, deadlift: .5, rdl: .5, leg_raise: .5, situp: .4 },
  ankle: { sl_rdl: .3, calf: .8, lunge: .6, split_squat: .5, squat: .4, goblet: .4, front_squat: .4 },
  neck: { shrug: .6, situp: .6, crunch: .5 },
};
const JOINT_CARDIO = {
  Run: { knee: .8, ankle: .8, hip: .6 }, TrailRun: { knee: .9, ankle: 1, hip: .6 }, VirtualRun: { knee: .8, ankle: .8, hip: .6 },
  Rowing: { lowerBack: .6, knee: .4, wrist: .2 }, VirtualRow: { lowerBack: .6, knee: .4, wrist: .2 },
  Ride: { knee: .5 }, VirtualRide: { knee: .5 }, Hike: { knee: .6, ankle: .6 },
};
const JOINT_NAMES = { knee: "knee", lowerBack: "lower back", shoulder: "shoulder", elbow: "elbow", wrist: "wrist", hip: "hip", ankle: "ankle/foot", neck: "neck" };
const NOTE_AREAS = [
  ["knee", /\bknees?\b|patell|meniscus|\bacl\b/],
  ["lowerBack", /(lower|low)[\s-]*back|lumbar|sciatic|spine|(?<!upper\s)\bback\b(?!\s+(row|ext))/],
  ["shoulder", /\bshoulders?\b|rotator/],
  ["elbow", /\belbows?\b/],
  ["wrist", /\bwrists?\b/],
  ["hip", /\bhips?\b|\bgroin\b/],
  ["ankle", /\bankles?\b|achilles|\bfoot\b|\bfeet\b|plantar|\bshins?\b/],
  ["neck", /\bneck\b/],
];
const NOTE_MUSCLES = [
  ["quads", /\bquads?\b|\bthighs?\b/], ["hamstrings", /\bhamstrings?\b|\bhammies\b/], ["glutes", /\bglutes?\b|\bbutt\b/],
  ["calves", /\bcalf\b|\bcalves\b/], ["chest", /\bchest\b|\bpecs?\b/], ["biceps", /\bbiceps?\b|\bbis\b/], ["triceps", /\btriceps?\b|\btris\b/],
  ["lats", /\blats?\b/], ["upperBack", /upper\s+back/], ["traps", /\btraps?\b/], ["abs", /\babs\b|\bcore\b/], ["forearms", /\bforearms?\b|\bgrip\b/],
];
const SEV_WORDS = [[3, /\bsharp|stabb|swell|swollen|injur|tweak|popped|pulled|sprain|can'?t\s+(bend|walk|lift|straighten)|numb|tingl|shooting/],
  [2, /\bpain|hurt|ache|achy|sore|tender|twinge|strain|throb|aggravat|flar/],
  [1, /creak|click|crack|stiff|tight|niggl|grind|pop(?!ped)|weird|funny|off\b/]];
const SEV_LABEL = ["", "mild", "moderate", "severe"];
function parseNote(text) {
  const out = [], seen = new Set();
  const add = i => { if (!seen.has(i.k)) { seen.add(i.k); out.push(i); } };
  const t = (text || "").toLowerCase();
  if (/\b(sick|ill|flu|fever|covid|a cold|got a cold|stomach bug|nause)/.test(t)) add({ k: "general:sick", sev: 3 });
  if (/\b(exhausted|wiped|drained|no energy|slept (badly|poorly|terribly)|bad sleep|no sleep|tired|hungover|jet ?lag)/.test(t)) add({ k: "general:tired", sev: 1 });
  for (const clause of t.split(/[.;!?\n]|,|\bbut\b|\balso\b|\bwhile\b/)) {
    if (/\b(fine|ok|okay|good|great|better|healed|no (pain|issues?))\b/.test(clause) && !SEV_WORDS.some(([, re]) => re.test(clause))) continue;   // "shoulder is fine"
    let sev = (SEV_WORDS.find(([, re]) => re.test(clause)) || [1])[0];
    if (sev > 1 && /\b(a bit|a little|slight(ly)?|mild(ly)?|kind of|kinda|somewhat)\b/.test(clause)) sev--;
    const side = /\bboth\b/.test(clause) ? "both" : /\bleft\b/.test(clause) ? "left" : /\bright\b/.test(clause) ? "right" : "";
    for (const [k, re] of NOTE_AREAS) if (re.test(clause)) add({ k: "joint:" + k, sev, side });
    if (/sore|doms|tight|stiff|ache|achy|fried|wrecked|tired|heavy|pump/.test(clause))
      for (const [m, re] of NOTE_MUSCLES) if (re.test(clause)) add({ k: "sore:" + m, sev: Math.min(sev, 2) });
  }
  return out;
}
function issueLabel(i) {
  const [type, what] = i.k.split(":");
  if (type === "general") return what === "sick" ? "Feeling sick" : "Tired";
  if (type === "sore") return `Sore ${MUSCLES[what].n.toLowerCase()}`;
  const name = i.side === "both" ? { knee: "knees", shoulder: "shoulders", elbow: "elbows", wrist: "wrists", hip: "hips", ankle: "ankles/feet" }[what] || JOINT_NAMES[what] : JOINT_NAMES[what];
  const txt = `${i.side ? i.side + " " : ""}${name}${i.sev ? ` · ${SEV_LABEL[i.sev]}` : ""}`;
  return txt[0].toUpperCase() + txt.slice(1);
}
// Issues in effect on `day`: joints/general last 3 days, muscle soreness 2 days; a later "better" clears them.
function activeIssues(day) {
  const map = new Map();
  for (let i = 3; i >= 0; i--) {
    const k = addDays(day, -i), s = S.sessions[k];
    if (!s) continue;
    for (const is of s.issues || []) if (!(is.k.startsWith("sore:") && i > 1)) map.set(is.k, { ...is, day: k });
    for (const r of s.resolved || []) map.delete(r);
  }
  return [...map.values()];
}
const HEAVY = new Set(["squat", "front_squat", "deadlift", "bench", "ohp", "bb_row", "rdl"]);
// Should you do this exercise right now? lvl 0 good · 1 caution · 2 not now
function exerciseAdvice(exId, day, ctx) {
  const ex = exById(exId), reasons = [];
  let lvl = 0;
  const bump = (l, r) => { lvl = Math.max(lvl, l); reasons.push({ l, r }); };
  if (!ctx.noEquip) { const miss = missingFor(exId); if (miss.length) bump(2, `needs ${miss.join(" and ")}`); }
  const prim = Object.entries(ex.muscles).filter(([, w]) => w >= .75).map(([m]) => m);
  for (const is of ctx.issues) {
    const [type, what] = is.k.split(":");
    if (type === "joint") {
      const risk = (JOINT[what]?.[exId] || 0) * is.sev;
      if (risk >= 1.5) bump(2, `hard on your ${is.side ? is.side + " " : ""}${JOINT_NAMES[what]} (${SEV_LABEL[is.sev]})`);
      else if (risk >= .6) bump(1, `loads your ${is.side ? is.side + " " : ""}${JOINT_NAMES[what]}. Keep it light and pain-free`);
    } else if (type === "sore" && prim.includes(what)) bump(1, `your ${MUSCLES[what].n.toLowerCase()} feel sore`);
    else if (is.k === "general:sick") bump(2, "you noted feeling sick");
  }
  if (ctx.jr) for (const j of JOINT_ORDER) {
    const r = ctx.jr[j];
    if ((JOINT[j]?.[exId] || 0) >= .6 && r.ratio > 1.5) bump(1, `${JOINT_NAMES[j]} load is already ${r.ratio.toFixed(1)}× ${r.basis === "usual" ? "your usual" : "a normal week of your plan"}`);
  }
  const tired = prim.filter(m => readiness(ctx.fat[m]) === "fat");
  if (tired.length) bump(1, `${tired.map(m => MUSCLES[m].n.toLowerCase()).join(", ")} still fatigued`);
  const over = prim.filter(m => ctx.wk[m] >= MUSCLES[m].hi);
  if (over.length) bump(1, `${over.map(m => MUSCLES[m].n.toLowerCase()).join(", ")} already at ${over.map(m => ctx.wk[m].toFixed(0)).join("/")} sets this week (cap ~${MUSCLES[over[0]].hi})`);
  if (HEAVY.has(exId) && ctx.readiness != null && ctx.readiness < 50) bump(1, `readiness is ${ctx.readiness}: heavy barbell work costs more today`);
  if (HEAVY.has(exId) && ctx.issues.some(i => i.k === "general:tired")) bump(1, "you noted feeling tired: go lighter on heavy barbell work");
  let alts = [];
  if (lvl > 0 && prim.length && !ctx.noAlts) {
    const sub = { ...ctx, noAlts: true };
    alts = allEx().filter(e => e.id !== exId && !skipped(e.id)).map(e => {
      const ov = prim.reduce((a, m) => a + (e.muscles[m] || 0), 0);
      return { e, ov, adv: ov >= .75 ? exerciseAdvice(e.id, day, sub) : { lvl: 9 } };
    }).filter(x => x.adv.lvl < lvl && x.ov >= .75).sort((a, b) => a.adv.lvl - b.adv.lvl || b.ov - a.ov || (b.e.kind === "weight") - (a.e.kind === "weight")).slice(0, 3).map(x => x.e);
  }
  return { lvl, reasons: reasons.sort((a, b) => b.l - a.l).map(x => x.r), alts };
}
/* Joint load: reps × joint stress × (1 + added weight / bodyweight), plus Strava cardio (stress × effort × 3).
   Compared with the usual week (prior 4 weeks), with a starter floor so beginners aren't always "spiking". */
const JOINT_FLOOR = 80;
const JOINT_ORDER = ["knee", "lowerBack", "hip", "ankle", "shoulder", "elbow", "wrist", "neck"];
function bwLb(day) { return latestWeight(day)?.weightLb || 155; }
// Starter baseline: one week of your routines (each done once) at their planned reps and weights
function routineWeekLoad(day) {
  const out = Object.fromEntries(JOINT_ORDER.map(j => [j, 0])), bw = bwLb(day);
  for (const r of Object.values(S.routines)) for (const it of r.items) {
    const ex = exById(it.ex), reps = (ex.kind === "time" ? it.r / 3 : it.r) * it.sets, lf = 1 + (it.w || 0) / bw;
    for (const j of JOINT_ORDER) out[j] += (JOINT[j]?.[it.ex] || 0) * reps * lf;
  }
  return out;
}
function jointLoad(fromDay, toDay) {
  const out = Object.fromEntries(JOINT_ORDER.map(j => [j, 0])), by = Object.fromEntries(JOINT_ORDER.map(j => [j, {}]));
  const cardio = Object.fromEntries(JOINT_ORDER.map(j => [j, 0]));
  for (const x of allDoneSets(x => x.day >= fromDay && x.day <= toDay)) {
    const lf = 1 + (x.st.w || 0) / bwLb(x.day);
    const reps = x.ex.kind === "time" ? x.st.r / 3 : x.st.r;   // a 30 s hold ≈ 10 reps
    for (const j of JOINT_ORDER) { const s = JOINT[j]?.[x.ex.id] || 0; if (s) { const v = s * reps * lf; out[j] += v; by[j][x.ex.name] = (by[j][x.ex.name] || 0) + v; } }
  }
  for (const a of S.cardio) {
    if (a.day < fromDay || a.day > toDay) continue;
    const js = JOINT_CARDIO[a.sport]; if (!js) continue;
    for (const j in js) { const v = js[j] * a.re * 3; out[j] += v; cardio[j] += v; by[j][a.sport] = (by[j][a.sport] || 0) + v; }
  }
  return { out, by, cardio };
}
// target: in a deload, where this week should land (null otherwise): the lifting part scaled by deloadScale, cardio as usual
function jointRatios(day) {
  const from = addDays(day, -6), ac = jointLoad(from, day), rw = routineWeekLoad(day), dl = deloadScale(from, day);
  const uw = usualWeeks(day).map(([f, t]) => jointLoad(f, t)), avg = (j, k) => uw.reduce((a, w) => a + w[k][j], 0) / uw.length;
  return Object.fromEntries(JOINT_ORDER.map(j => {
    const usual = avg(j, "out"), uc = avg(j, "cardio"), starter = Math.max(JOINT_FLOOR, rw[j] + uc);
    const base = Math.max(usual, starter), basis = usual >= starter ? "usual" : "starter";
    const top = Object.entries(ac.by[j]).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([n]) => n);
    const target = dl < 1 ? Math.max(0, base - uc) * dl + uc : null;
    return [j, { acute: ac.out[j], usual, base, basis, ratio: ac.out[j] / base, top, target }];
  }));
}
function adviceCtx(day) {
  const dayStart = parseDay(day).getTime() - 12 * 36e5;
  return { issues: activeIssues(day), fat: fatigueAt(day === dayKey(new Date()) ? Date.now() : dayStart + 8 * 36e5, dayStart),
    wk: setsPerMuscle(addDays(day, -6), addDays(day, -1)), readiness: healthOn(day)?.readiness, jr: jointRatios(day) };
}

/* ============================== State ============================== */
const S = {
  sessions: {}, custom: {}, routines: {}, settings: { unit: "lb" },
  tab: "today", day: dayKey(new Date()), mode: "loading", open: {},
  prevTab: "today", setupPage: null, progPage: null, weekOff: 0,   // where you are: Setup page, Progress page, how many weeks back
  exOpen: {}, setEdit: null, exMenu: null, askI: 0,                  // the workout view: which exercises are open, which set is being edited
  cardio: [], health: {},                       // from Strava / Garmin (via Drive)
  conn: { strava: { st: "off" }, garmin: { st: "off" } },
};
const STRAVA = "Strava", DRIVE = "Google Drive", HEALTH_FILE = "iron-ledger-health.json";
let DB = null;
const LB_PER_KG = 2.20462;

function dayKey(d) { const p = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }
function parseDay(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d, 12); }
function addDays(k, n) { const d = parseDay(k); d.setDate(d.getDate() + n); return dayKey(d); }
function daysBetween(a, b) { return Math.round((parseDay(b) - parseDay(a)) / 864e5); }
function uid() { return Math.random().toString(36).slice(2, 10); }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function exById(id) { return S.custom[id] || BUILTIN.find(e => e.id === id) || { id, name: id, pattern: "core", kind: "weight", muscles: {}, inc: 5 }; }
function allEx() { return [...BUILTIN, ...Object.values(S.custom)]; }
function unit() { return S.settings.unit === "kg" ? "kg" : "lb"; }
function toDisp(lb) { if (lb == null || lb === "") return ""; const v = unit() === "kg" ? lb / LB_PER_KG : lb; return +(Math.round(v * 2) / 2).toFixed(1); }
function fromDisp(v) { const n = parseFloat(v); if (!isFinite(n)) return 0; return unit() === "kg" ? +(n * LB_PER_KG).toFixed(2) : n; }
function stepLb() { return unit() === "kg" ? 2.5 * LB_PER_KG : 5; }
function fmtW(lb) { return `${toDisp(lb)} ${unit()}`; }
function fmtDay(k, opts = { weekday: "short", month: "short", day: "numeric" }) { return parseDay(k).toLocaleDateString(undefined, opts); }

/* ============================== Persistence ============================== */
const dirty = new Map();   // day -> timer
const writing = new Set();
function sessionDoc(day) { return S.sessions[day] || (S.sessions[day] = { date: day, entries: [], finished: false }); }
function saveDay(day) {
  if (!DB) return;
  clearTimeout(dirty.get(day));
  dirty.set(day, setTimeout(() => flushDay(day), 600));
}
async function flushDay(day) {
  if (writing.has(day)) { dirty.set(day, setTimeout(() => flushDay(day), 400)); return; }
  dirty.delete(day); writing.add(day);
  try {
    const s = S.sessions[day];
    if (!s || (!s.entries.length && !s.finished && !s.note && !s.resolved?.length)) await DB.doc("sessions/" + day).delete();
    else await DB.doc("sessions/" + day).set(JSON.parse(JSON.stringify(s)));
  } catch (e) { toast(saveErr(e)); }
  finally { writing.delete(day); }
}
function saveErr(e) { return e?.code === "quota_exceeded" ? "Storage is full. Delete old custom exercises or routines." : "Couldn't save. Check your connection; changes stay on this screen."; }
async function saveDoc(path, data) {
  if (!DB) return;
  try { data ? await DB.doc(path).set(data) : await DB.doc(path).delete(); } catch (e) { toast(saveErr(e)); }
}

async function boot() {
  render();
  let db = null;
  try { db = await LocalStore.open(); } catch { db = null; }
  startConnectors();
  if (!db) { S.mode = "demo"; loadDemo(); render(); return; }
  DB = db; S.mode = "live";
  let pending = 6;
  const ready = () => { if (pending > 0 && --pending === 0) render(); else if (pending <= 0) render(); };
  db.collection("sessions").onSnapshot(snap => {
    for (const ch of snap.docChanges()) {
      const id = ch.doc.id;
      if (dirty.has(id) || writing.has(id)) continue;
      if (ch.type === "removed") delete S.sessions[id];
      else S.sessions[id] = structuredClone(ch.doc.data());
    }
    ready();
  }, onDbErr);
  db.collection("exercises").onSnapshot(snap => { S.custom = {}; snap.docs.forEach(d => S.custom[d.id] = { ...structuredClone(d.data()), id: d.id }); ready(); }, onDbErr);
  db.collection("routines").onSnapshot(snap => { S.routines = {}; snap.docs.forEach(d => S.routines[d.id] = { ...structuredClone(d.data()), id: d.id }); ready(); }, onDbErr);
  db.collection("connectors").onSnapshot(snap => { S.connectors = {}; snap.docs.forEach(d => S.connectors[d.id] = d.data()); applyConnectors(); ready(); }, onDbErr);
  db.collection("body").onSnapshot(snap => { S.body = {}; snap.docs.forEach(d => S.body[d.id] = structuredClone(d.data())); rebuildDerived(); ready(); }, onDbErr);
  db.doc("settings/main").onSnapshot(d => { if (d.exists) S.settings = { unit: "lb", ...d.data() }; ready(); }, onDbErr);
}
/* ============================== Connectors (Strava, Garmin via Drive) ============================== */
let MCP = null;
const CONN_FIX = {
  needs_reauth: s => `Reconnect ${s} in claude.ai Settings → Connectors.`,
  server_not_connected: s => `Add the ${s} connector in claude.ai Settings → Connectors.`,
  selection_required: s => `Pick which ${s} connector to use when claude.ai asks.`,
  not_in_manifest: s => `${s} is turned off for this page. Turn it on from the page's Permissions menu.`,
  blocked_by_policy: s => `Your organization blocks ${s} here.`,
};
function connError(key, server, e) {
  const fix = CONN_FIX[e?.code];
  const transient = !fix && (e?.retryable || e?.code === "server_unavailable");
  S.conn[key] = { ...S.conn[key], st: fix ? "blocked" : "error", msg: fix ? fix(server) : transient ? `${server} didn't answer. It will try again shortly.` : `${server}: ${e?.message || "request failed"}` };
  if (fix) { if (key === "strava") S.extCardio = []; else S.extHealth = {}; rebuildDerived(); }
  render();
}
async function startConnectors() {
  MCP = null;   // Strava comes back via its own OAuth; Garmin has no public API for individual apps
  if (!MCP) { S.conn.strava = { st: "soon", msg: "Coming soon." }; applyConnectors(); return; }
  // Strava: last 6 weeks of activities, refreshed every 30 min
  S.conn.strava = { st: "loading" };
  const since = new Date(Date.now() - 42 * 864e5);
  MCP.watchTool(STRAVA, "list_activities", { first: 100, range_start: dayKey(since) + "T00:00:00" }, ev => {
    if (ev.type === "error") return connError("strava", STRAVA, ev.error);
    const acts = ev.result.payload?.activities || [];
    S.extCardio = acts.map(a => {
      const d = new Date(a.start_local), re = a.summary?.relative_effort || 0;
      return { id: a.id, name: a.name, sport: a.sport_type, day: dayKey(d), t: d.getTime() + (a.summary?.elapsed_time || 0) * 1000,
        mins: Math.round((a.summary?.moving_time || 0) / 60), km: (a.summary?.distance || 0) / 1000, re, muscles: CARDIO[a.sport_type] || {} };
    });
    S.conn.strava = { st: "ok", at: ev.result.cache?.storedAt || Date.now(), n: S.extCardio.length };
    rebuildDerived();
    render();
  }, { refetchInterval: 30 * 60e3, cache: { staleTime: 5 * 60e3 } });
  loadHealth();
}
function findFileId(p) {  // search_files payload: first object carrying an id whose title/name is our file
  let hit = null;
  (function walk(o) { if (!o || hit) return; if (Array.isArray(o)) return o.forEach(walk);
    if (typeof o === "object") { const nm = o.title || o.name; if (o.id && (!nm || String(nm).includes("iron-ledger-health"))) { hit = o.id; return; } Object.values(o).forEach(walk); } })(p);
  return hit;
}
function findJson(p) {  // download payload: some string field holds the file, base64 or plain
  let out = null;
  (function walk(o) { if (out || o == null) return;
    if (typeof o === "string") { for (const s of [o, (() => { try { return new TextDecoder().decode(Uint8Array.from(atob(o.replace(/\s/g, "")), c => c.charCodeAt(0))); } catch { return ""; } })()]) {
        if (s.trim().startsWith("{")) { try { const j = JSON.parse(s); if (j.days) { out = j; return; } } catch {} } } return; }
    if (typeof o === "object") { if (o.days && o.source === "garmin") { out = o; return; } Object.values(o).forEach(walk); } })(p);
  return out;
}
let healthUnsub = null;
async function loadHealth() {
  S.conn.garmin = { st: "loading" };
  let id = null;
  try { id = localStorage.getItem("il-health-file"); } catch {}
  if (!id) {
    try {
      const r = await MCP.callTool(DRIVE, "search_files", { query: `title = '${HEALTH_FILE}'`, pageSize: 5, excludeContentSnippets: true }, { cache: { staleTime: 60e3 } });
      id = findFileId(r.payload);
    } catch (e) { return connError("garmin", DRIVE, e); }
    if (!id) { S.conn.garmin = { st: "missing", msg: `No ${HEALTH_FILE} in your Google Drive yet. The Garmin sync on your Mac creates it.` }; render(); return; }
    try { localStorage.setItem("il-health-file", id); } catch {}
  }
  healthUnsub?.();
  healthUnsub = MCP.watchTool(DRIVE, "download_file_content", { fileId: id }, ev => {
    if (ev.type === "error") {
      if (ev.error?.code === "tool_error") { try { localStorage.removeItem("il-health-file"); } catch {} }
      return connError("garmin", DRIVE, ev.error);
    }
    const j = findJson(ev.result.payload);
    if (!j) { S.conn.garmin = { st: "error", msg: "Found the Garmin file but couldn't read it." }; render(); return; }
    S.extHealth = j.days || {}; rebuildDerived();
    S.conn.garmin = { st: "ok", at: Date.parse(j.updated) || ev.result.cache?.storedAt || Date.now(), n: Object.keys(S.extHealth).length };
    render();
  }, { refetchInterval: 60 * 60e3, cache: { staleTime: 10 * 60e3 } });
}
const CARDIO_SPORTS_EXCL = new Set(["Walk"]);   // walks are daily life, not training cardio: only their Zone 2 minutes (a.z2) count
// Training minutes of one activity: a walk's time in Zone 2, anything else in full. A walk with 15+ of them is a Zone 2 session
function cardioMins(a) { return CARDIO_SPORTS_EXCL.has(a.sport) ? a.z2 || 0 : a.mins; }
const isZ2Walk = a => CARDIO_SPORTS_EXCL.has(a.sport) && cardioMins(a) >= 15;
// Close enough to the plan to call it done (40 → 36, 15 → 14)
const metMins = (done, want) => done >= Math.ceil(want * .9);
function cardioMinutes(fromDay, toDay) {
  return S.cardio.filter(a => a.day >= fromDay && a.day <= toDay).reduce((n, a) => n + cardioMins(a), 0);
}
function healthOn(day) { return S.health[day] || null; }
function latestWeight(day) {  // most recent weigh-in on or before `day`
  const ks = Object.keys(S.health).filter(k => k <= day && S.health[k].weightLb).sort();
  return ks.length ? { day: ks[ks.length - 1], ...S.health[ks[ks.length - 1]] } : null;
}

function onDbErr(e) { S.mode = e?.code === "revoked" ? "readonly" : S.mode; toast("Lost the connection to your log. Reload the page to reconnect."); }

/* ============================== Analytics ============================== */
function doneSets(entry) { return entry.sets.filter(s => s.done); }
function setTime(day, s) { return s.t || parseDay(day).getTime(); }
// Hard-set equivalents: each done set × muscle weight × (easy sets count half)
function setWeight(entry) { return entry.effort === "easy" ? .5 : 1; }

function allDoneSets(filterFn) {
  const out = [];
  for (const [day, s] of Object.entries(S.sessions)) {
    for (const e of s.entries || []) {
      const ex = exById(e.ex);
      for (const st of e.sets) if (st.done) out.push({ day, t: setTime(day, st), e, ex, st });
    }
  }
  return filterFn ? out.filter(filterFn) : out;
}

// Residual fatigue per muscle at time `at`, from sets done strictly before `before`.
/* Age (settings.birthYear, optional). Strength standards are for ages 23–39; outside that range they're divided by the
   powerlifting age coefficients (McCulloch for masters 40+, Foster for juniors), so a 60-year-old's 100 lb counts like 134.
   Past 40, muscles also take a little longer to recover: fatigue fades 0.5% slower per year, up to 25%. */
const AGE_MASTERS = [1.000, 1.010, 1.020, 1.031, 1.043, 1.055, 1.068, 1.082, 1.097, 1.113, 1.130, 1.147, 1.165, 1.184, 1.204, 1.225, 1.246, 1.268, 1.291, 1.315,
  1.340, 1.366, 1.393, 1.421, 1.450, 1.480, 1.511, 1.543, 1.576, 1.610, 1.645, 1.681, 1.718, 1.756, 1.795, 1.835, 1.876, 1.918, 1.961, 2.005,
  2.050, 2.096, 2.143, 2.190, 2.238, 2.287, 2.337, 2.388, 2.440, 2.494, 2.549];   // ages 40–90
const AGE_JUNIOR = { 14: 1.23, 15: 1.18, 16: 1.13, 17: 1.08, 18: 1.06, 19: 1.04, 20: 1.03, 21: 1.02, 22: 1.01 };
function ageOn(day) { const y = S.settings.birthYear; return y ? parseDay(day).getFullYear() - y : null; }
function ageCoef(age) {
  if (age == null || (age >= 23 && age < 40)) return 1;
  if (age < 23) return AGE_JUNIOR[Math.max(14, age)];
  return AGE_MASTERS[Math.min(90, age) - 40];
}
function recoveryScale() { const a = ageOn(dayKey(new Date())); return a > 40 ? Math.min(1.25, 1 + .005 * (a - 40)) : 1; }

function fatigueAt(at, before = at) {
  const f = Object.fromEntries(Object.keys(MUSCLES).map(m => [m, 0])), rs = recoveryScale();
  for (const x of allDoneSets(x => x.t < before && x.t > at - 6 * 864e5)) {
    const ef = EFFORT[x.e.effort]?.f ?? 1;
    const dt = (at - x.t) / 36e5;
    for (const [m, w] of Object.entries(x.ex.muscles)) if (f[m] != null) f[m] += w * ef * Math.exp(-dt / (MUSCLES[m].tau * rs));
  }
  for (const a of S.cardio) {
    if (a.t >= before || a.t <= at - 6 * 864e5 || a.re < CARDIO_MIN_EFFORT) continue;
    const eq = Math.min(6, a.re / 10), dt = (at - a.t) / 36e5;
    for (const [m, w] of Object.entries(a.muscles)) if (f[m] != null) f[m] += w * eq * Math.exp(-dt / (MUSCLES[m].tau * rs));
  }
  return f;
}
function readiness(v) { return v >= 4 ? "fat" : v >= 1.5 ? "rec" : "fresh"; }
const READY_LABEL = { fat: "Fatigued", rec: "Recovering", fresh: "Fresh" };

function setsPerMuscle(fromDay, toDay) {  // inclusive day range
  const out = Object.fromEntries(Object.keys(MUSCLES).map(m => [m, 0]));
  for (const x of allDoneSets(x => x.day >= fromDay && x.day <= toDay))
    for (const [m, w] of Object.entries(x.ex.muscles)) if (out[m] != null) out[m] += w * setWeight(x.e);
  return out;
}
function totalSets(fromDay, toDay) { return allDoneSets(x => x.day >= fromDay && x.day <= toDay).reduce((a, x) => a + setWeight(x.e), 0); }

function e1rm(lb, reps) {
  if (!lb || !reps) return 0;
  const r = Math.min(reps, 12);   // past 12 reps a set tests endurance more than your max
  return r <= 1 ? lb : lb * (1 + r / 30);   // Epley, from what you actually lifted: the effort tag doesn't change it
}
function entryScore(e, ex) {  // best single-set performance for charts/PRs
  let best = 0;
  for (const s of doneSets(e)) {
    const v = ex.kind === "weight" ? e1rm(s.w, s.r) : s.r;
    if (v > best) best = v;
  }
  return best;
}
function doneSetsOf(rows) { return rows.flatMap(r => doneSets(r.e)); }
// The set behind the best estimate (the first time it was reached)
function bestSet(exId) {
  let best = null;
  for (const { day, e } of historyFor(exId)) for (const x of doneSets(e)) {
    const score = e1rm(x.w, x.r);
    if (score > (best?.score || 0)) best = { w: x.w, r: x.r, day, score };
  }
  return best;
}
// Lifts logged per dumbbell with one in each hand: the load is shown per hand, and is double that against bodyweight
const PER_HAND = new Set(["db_bench", "incline_db", "db_fly", "db_ohp", "db_curl", "hammer", "lateral", "rev_fly", "split_squat", "lunge"]);
function bodyweightRatio(exId, lb, bw) { return (PER_HAND.has(exId) ? lb * 2 : lb) / bw; }
/* Strength levels: where a lift sits against rough population standards, for your bodyweight and the standards you chose (settings.stdSex m|f).
   Anchor lifts carry 1RM ÷ bodyweight bands (beginner … elite) for a 165 lb man / 135 lb woman, scaled to your bodyweight by bw^⅔:
   strength follows muscle cross-section, so lighter lifters lift more per pound. Variants are a fixed fraction of their anchor's load.
   Synthesised from widely published bodyweight-ratio standards, not from one dataset (docs/training-research.md §6): treat a level as ± half a step. */
const LEVELS = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
const STD_REF = { m: 165, f: 135 };
const STD_ANCHOR = {
  bench:    { m: [.5, .75, 1, 1.5, 2],         f: [.25, .5, .75, 1, 1.5] },
  ohp:      { m: [.35, .55, .75, 1, 1.25],     f: [.2, .35, .5, .75, 1] },
  squat:    { m: [.75, 1.25, 1.5, 2.25, 2.75], f: [.5, .75, 1.25, 1.5, 2] },
  deadlift: { m: [1, 1.5, 2, 2.5, 3],          f: [.5, 1, 1.25, 1.75, 2.5] },
  bb_row:   { m: [.5, .75, 1, 1.5, 1.75],      f: [.25, .4, .65, .9, 1.2] },
  bb_curl:  { m: [.2, .4, .6, .85, 1.15],      f: [.1, .2, .4, .6, .85] },
  skull:    { m: [.15, .3, .5, .75, 1],        f: [.1, .2, .35, .55, .75] },
  lateral:  { m: [.05, .1, .17, .25, .35],     f: [.03, .06, .1, .16, .23] },   // per dumbbell
};
// Variant → [anchor, share of the anchor's load]. Per-hand lifts are per dumbbell, as they're logged.
const STD_VARIANT = {
  db_bench: ["bench", .42], incline_db: ["bench", .36], floor_press: ["bench", .9], db_ohp: ["ohp", .4],
  front_squat: ["squat", .82], goblet: ["squat", .45], split_squat: ["squat", .3], lunge: ["squat", .28],
  rdl: ["deadlift", .75], hip_thrust: ["deadlift", 1], db_row: ["bb_row", .5], pulldown: ["bb_row", 1.05],
  db_curl: ["bb_curl", .45], hammer: ["bb_curl", .5], tri_oh: ["skull", 1], pushdown: ["skull", 1.1],
};
// Bodyweight lifts: strict reps in one set. Added weight counts as extra reps (Epley on bodyweight + load).
const STD_REPS = {
  pullup: { m: [1, 5, 12, 20, 28], f: [0, 1, 5, 10, 16] }, chinup: { m: [1, 6, 13, 21, 29], f: [0, 1, 6, 11, 17] },
  pushup: { m: [5, 18, 35, 55, 75], f: [1, 8, 20, 35, 50] }, dip: { m: [2, 10, 20, 32, 42], f: [0, 3, 10, 18, 26] },
};
// Thresholds for the five levels: lb of 1RM (per hand where logged that way) or reps. null when there's no standard.
function stdThresholds(exId, bw, sex, age) {
  const k = ageCoef(age);
  if (STD_REPS[exId]) return { kind: "reps", th: STD_REPS[exId][sex].map(r => r / k) };
  const [a, share] = STD_ANCHOR[exId] ? [exId, 1] : STD_VARIANT[exId] || [];
  if (!a) return null;
  const ref = STD_REF[sex], scale = ref * Math.pow(bw / ref, 2 / 3) * share;
  return { kind: "lb", th: STD_ANCHOR[a][sex].map(r => r * scale / k) };
}
// 0–1 below beginner, 1 = beginner … 5 = elite, straight-line in between
function levelScore(v, th) {
  if (v >= th[4]) return 5;
  if (v < th[0]) return th[0] > 0 ? v / th[0] : 1;
  const i = th.findIndex((t, k) => v >= t && v < th[k + 1]);
  return i + 1 + (v - th[i]) / (th[i + 1] - th[i]);
}
function levelName(score) { return score < 1 ? "Below beginner" : LEVELS[Math.min(4, Math.floor(score) - 1)]; }
// A lift's level from its best set in the last 8 weeks (deload sessions left out)
function liftLevel(exId, day) {
  const sex = S.settings.stdSex, bw = latestWeight(day)?.weightLb;
  if (!sex || !bw) return null;
  const std = stdThresholds(exId, bw, sex, ageOn(day));
  if (!std) return null;
  const sets = doneSetsOf(historyFor(exId, addDays(day, 1), true).filter(r => r.day > addDays(day, -56)));
  if (!sets.length) return null;
  const v = Math.max(...sets.map(x => std.kind === "reps"
    ? (x.w ? 30 * ((bw + x.w) / bw * (1 + x.r / 30) - 1) : x.r)
    : e1rm(x.w, x.r)));
  if (!(v > 0)) return null;
  const score = levelScore(v, std.th);
  return { exId, v, score, level: levelName(score), next: score < 5 ? std.th[Math.max(0, Math.floor(score))] : null, kind: std.kind, capped: std.kind === "lb" && atCap(exId) };
}
// Movement groups for balance: each takes its best-scoring lift
const STD_GROUPS = [
  ["press", "Press", ["bench", "db_bench", "incline_db", "floor_press", "pushup", "dip"]],
  ["overhead", "Overhead", ["ohp", "db_ohp", "lateral"]],
  ["pull", "Pull", ["bb_row", "db_row", "pulldown", "pullup", "chinup"]],
  ["squat", "Squat", ["squat", "front_squat", "goblet", "split_squat", "lunge"]],
  ["hinge", "Hinge", ["deadlift", "rdl", "hip_thrust"]],
  ["arms", "Arms", ["bb_curl", "db_curl", "hammer", "skull", "tri_oh", "pushdown"]],
];
function strengthLevels(day) {
  const groups = STD_GROUPS.map(([k, n, ids]) => {
    const best = ids.map(id => liftLevel(id, day)).filter(Boolean).sort((a, b) => b.score - a.score)[0] || null;
    return { k, n, best };
  });
  const scored = groups.filter(g => g.best).map(g => g.best.score).sort((a, b) => a - b);
  const median = scored.length ? scored[Math.floor((scored.length - 1) / 2)] : null;   // the lower middle, so one strong group doesn't flag the rest
  // A full level behind the others is worth prioritising; a lift at your gear's limit may be stronger than it looks
  for (const g of groups) g.lag = scored.length >= 3 && g.best && !g.best.capped && g.best.score <= median - 1;
  return { groups, median };
}

// The same per muscle: each muscle takes the best level among lifts that work it as a main mover (weight ≥ .75).
// Muscles no standard covers (calves, abs, …) come back with best: null and covered: false.
function muscleLevels(day) {
  const lv = {}, covered = {};
  for (const ex of allEx()) {
    const has = !!(STD_REPS[ex.id] || STD_ANCHOR[ex.id] || STD_VARIANT[ex.id]);
    for (const [m, w] of Object.entries(ex.muscles)) if (w >= .75 && has) covered[m] = true;
    if (!has) continue;
    const l = liftLevel(ex.id, day); if (!l) continue;
    for (const [m, w] of Object.entries(ex.muscles)) if (w >= .75 && (!lv[m] || l.score > lv[m].score)) lv[m] = l;
  }
  const rows = Object.keys(MUSCLES).map(m => ({ k: m, n: MUSCLES[m].n, best: lv[m] || null, covered: !!covered[m] }));
  const scored = rows.filter(r => r.best).map(r => r.best.score).sort((a, b) => a - b);
  const median = scored.length ? scored[Math.floor((scored.length - 1) / 2)] : null;
  for (const r of rows) r.lag = scored.length >= 4 && r.best && !r.best.capped && r.best.score <= median - 1;
  return { rows, median };
}

// noDeload: leave out deload sessions, which are light on purpose (for progression and stalls)
function historyFor(exId, beforeDay, noDeload) {
  const rows = [];
  for (const [day, s] of Object.entries(S.sessions)) {
    if (beforeDay && day >= beforeDay) continue;
    if (noDeload && s.deload) continue;
    for (const e of s.entries || []) if (e.ex === exId && doneSets(e).length) rows.push({ day, e, score: entryScore(e, exById(exId)) });
  }
  return rows.sort((a, b) => a.day < b.day ? -1 : 1);
}
// In the 3 weeks after a deload: has each lift trained in it come back to its pre-deload best (best of the 3 weeks before)?
function rebound(day) {
  const r = deloadRanges().filter(r => r.to < day && r.to >= addDays(day, -21)).pop(); if (!r) return null;
  const ids = new Set(), back = [], notYet = [];
  for (let d = r.from; d <= r.to; d = addDays(d, 1)) for (const e of S.sessions[d]?.entries || []) if (doneSets(e).length) ids.add(e.ex);
  for (const id of ids) {
    const h = historyFor(id, addDays(day, 1), true);
    const pre = preDeloadBest(h, r), post = h.filter(x => x.day > r.to);
    if (!pre || !post.length) continue;
    (Math.max(...post.map(x => x.score)) >= pre * .995 ? back : notYet).push(id);
  }
  return back.length || notYet.length ? { back, notYet, r } : null;
}
// Best score in the 3 weeks before a deload, from full sessions (h from historyFor(…, true))
function preDeloadBest(h, r) { const pre = h.filter(x => x.day < r.from && x.day >= addDays(r.from, -21)); return pre.length ? Math.max(...pre.map(x => x.score)) : null; }
function firstDay() { const ks = Object.keys(S.sessions).filter(k => S.sessions[k].entries?.some(e => doneSets(e).length)).sort(); return ks[0]; }

/* Progression: what to load next time */
function progression(exId, beforeDay) {
  let h = historyFor(exId, beforeDay, true);   // after a deload, pick up from the last full session
  if (!h.length) h = historyFor(exId, beforeDay);
  if (!h.length) return null;
  const last = h[h.length - 1];
  const ex = exById(exId);
  const allDone = last.e.sets.every(s => s.done);
  const top = Math.max(...last.e.sets.map(s => s.w || 0));
  if (ex.kind !== "weight") {
    const reps = Math.max(...doneSets(last.e).map(s => s.r));
    if (allDone && last.e.effort !== "hard") return { text: `Last: ${last.e.sets.length}×${reps}${ex.kind === "time" ? "s" : ""}. Add ${ex.kind === "time" ? "5s" : "1–2 reps"} per set.`, last };
    return { text: `Last: ${last.e.sets.length}×${reps}${ex.kind === "time" ? "s" : ""}. Repeat it and own it.`, last };
  }
  const inc = ex.inc || 5;
  // Two sessions running with missed reps → hold or drop (plan rule)
  const prev = h[h.length - 2];
  if (!allDone && prev && !prev.e.sets.every(s => s.done)) {
    const drop = Math.max(inc, Math.round(top * .1 / inc) * inc);
    return { text: `Missed reps two sessions running at ${fmtW(top)}. Drop to ${fmtW(top - drop)} and build back up.`, last, bump: -drop };
  }
  // Double progression: with a rep range, add weight only once every set hits the top of it
  const rHi = last.e.rHi;
  // At the heaviest load your gear allows: progress reps (up to the range top + 5), then tempo or a harder variation
  const cap = capLb(exId), capped = !!cap && top >= cap - .01;
  const capText = () => {
    const hi = (rHi || 10) + 5, repsNow = Math.min(...doneSets(last.e).map(s => s.r));
    if (repsNow < hi) return { text: `${fmtW(top)} is as heavy as your gear goes for now. Keep it and add a rep per set, up to ${hi}.`, last, bump: 0, capped: true, nextR: Math.min(hi, repsNow + 1) };
    return { text: `${fmtW(top)} × ${hi} is done: you've outgrown this load. Lower over 3 seconds with a pause at the bottom${VARIANT[exId] && canDo(VARIANT[exId]) ? `, or move to ${exById(VARIANT[exId]).name.toLowerCase()}` : ""}.`, last, bump: 0, capped: true, nextR: hi };
  };
  if (rHi && allDone) {
    const atTop = last.e.sets.every(s => s.r >= rHi);
    if (!atTop) return { text: `Last time ${fmtW(top)} for ${last.e.sets.map(s => s.r).join("/")}. Stay at this weight and add a rep per set until all hit ${rHi}.`, last, bump: 0 };
    if (last.e.effort === "hard") return { text: `You hit ${rHi}s at ${fmtW(top)}, but it was a grinder. Repeat once with clean form, then add weight.`, last, bump: 0 };
    if (capped) return capText();
    return { text: `All sets hit ${rHi} at ${fmtW(top)}. Add ${fmtW(inc)} and go back to the bottom of the range.`, last, bump: inc, resetReps: true };
  }
  if (allDone && capped && last.e.effort !== "hard") return capText();
  if (allDone && last.e.effort && last.e.effort !== "hard") return { text: `Last time ${fmtW(top)} went ${EFFORT[last.e.effort].label.toLowerCase()}. Try ${fmtW(top + inc)}.`, last, bump: inc };
  if (allDone && last.e.effort === "hard") return { text: `Last time ${fmtW(top)} was a grinder. Repeat it before adding weight.`, last, bump: 0 };
  if (!allDone) return { text: `Last time you missed sets at ${fmtW(top)}. Repeat it, or drop ${fmtW(inc)} if form slips.`, last, bump: 0 };
  return { text: `Last time: ${fmtW(top)}. Tag how it felt so I can suggest the next jump.`, last, bump: 0 };
}

/* Flexible week: pick today's session from the rolling last 7 days + recovery, instead of fixed weekdays */
const WEEK_DEFAULT = { lifts: 3, cardio: 3, cardioMin: 110 };   // used only when settings.week is missing (setup always writes it)
function z2Text() { const z = S.settings.hrZ2; return z ? `, heart rate ${z.lo}–${z.hi} bpm` : ""; }
// Low readiness or a "tired" note → routines start one set lighter per exercise, at held weights
function trimReason(day) {
  const h = healthOn(day);
  if (h?.readiness != null && h.readiness < 50) return `readiness is ${h.readiness}`;
  if (activeIssues(day).some(i => i.k === "general:tired")) return "you noted feeling tired";
  return null;
}
// First ~2 weeks: run the starter routines as written, without top-up exercises or cardio add-ons
function isNewcomer(day) { return Object.keys(S.sessions).filter(k => k < day && liftedOn(k)).length < 6; }

/* Deload: a planned lighter week. About half the sets at ~90% of the weight, stopping 3–4 reps short, then back to normal.
   Due after 5 straight full weeks, or after 3 when two warning signs pile up (stalled lifts, recovery trending down, joints running hot).
   settings.deloads = [{start, end}], settings.deloadSnooze = day the reminder comes back */
const DELOAD_DAYS = 7, DELOAD_W = .9;
function deloadOn(day) { return (S.settings.deloads || []).find(d => d.start <= day && day <= d.end) || null; }
// A deload week aims for about half a normal week's sets (adaptRoutine halves them), so its load targets are half too
const DELOAD_VOL = .5;
// Share of the days from..to (inclusive) that are deload days
function deloadShare(from, to) { let n = 0, t = 0; for (let d = from; d <= to; d = addDays(d, 1)) { t++; if (deloadDay(d)) n++; } return t ? n / t : 0; }
// What a window's load should be against a normal week: 1 normally, ~0.5 for a whole deload week, in between when it straddles one.
// A window only counts as a deload while its last day is in one, or (a week already over) when most of it was. Once a deload
// ends you're back to normal and judged that way, even though the last 7 days still hold a few deload days.
function deloadScale(from, to) {
  const sh = deloadShare(from, to);
  if (!sh || !(deloadDay(to) || (sh >= .5 && to < dayKey(new Date())))) return 1;
  return 1 - sh * (1 - DELOAD_VOL);
}
// The 7-day weeks behind "usual": weeks first…first+3 back from day ([from, to]), leaving out any that touch a deload,
// which is light on purpose and would make the week after it look like a spike. All four when every one does.
function usualWeeks(day, first = 1) {
  const all = [0, 1, 2, 3].map(i => { const k = first + i; return [addDays(day, -7 * k - 6), addDays(day, -7 * k)]; });
  const full = all.filter(([f, t]) => !deloadShare(f, t));
  return full.length ? full : all;
}
// Average of f(from, to) over those weeks; f returns a number or an object of numbers
function usualAvg(day, f, first = 1) {
  const ws = usualWeeks(day, first).map(([a, b]) => f(a, b));
  if (typeof ws[0] === "number") return ws.reduce((a, b) => a + b, 0) / ws.length;
  return Object.fromEntries(Object.keys(ws[0]).map(k => [k, ws.reduce((a, w) => a + w[k], 0) / ws.length]));
}
// Deload periods as [{from, to}]: the planned weeks plus any session marked deload outside them
function deloadRanges() {
  const out = (S.settings.deloads || []).map(d => ({ from: d.start, to: d.end }));
  for (const [day, s] of Object.entries(S.sessions)) if (s.deload && !out.some(r => r.from <= day && day <= r.to)) out.push({ from: day, to: day });
  return out.sort((a, b) => a.from < b.from ? -1 : 1);
}
// Straight weeks of full training, counting back from this day. A week well under the usual volume, or a deload, ends the run.
function hardWeeks(day) {
  let n = 0;
  for (let i = 0; i < 10; i++) {
    const end = addDays(day, -7 * i), from = addDays(end, -6), v = totalSets(from, end);
    const base = usualAvg(end, totalSets);
    if ((base > 0 && v < base * .6) || (S.settings.deloads || []).some(d => d.start <= end && d.end >= from)) break;
    if (v > 0) n++;
  }
  return n;
}
// Lifts with no progress in 3 weeks (best estimate, heaviest weight and reps at it all flat). Deload sessions don't count.
// It has to be a lift you're still training: 2+ sessions in those 3 weeks, the last within DROP_AFTER days. One you've
// stopped doing hasn't stalled, it's been dropped (droppedLifts).
function stalledLifts(day) {
  const out = [];
  for (const ex of allEx()) {
    const h = historyFor(ex.id, undefined, true).filter(r => r.day > addDays(day, -42) && r.day <= day);
    if (h.length < 4 || atCap(ex.id)) continue;   // capped lifts progress by reps; not a stall
    const recDays = [...new Set(h.filter(r => r.day > addDays(day, -21)).map(r => r.day))].sort();
    if (recDays.length < 2 || daysBetween(recDays[recDays.length - 1], day) >= DROP_AFTER) continue;
    const recent = Math.max(0, ...h.filter(r => r.day > addDays(day, -21)).map(r => r.score));
    const prior = Math.max(0, ...h.filter(r => r.day <= addDays(day, -21)).map(r => r.score));
    // A heavier weight, or more reps at your heaviest, is progress even when the estimate says otherwise
    const heaviest = rows => doneSetsOf(rows).reduce((a, s) => (s.w || 0) > a.w || ((s.w || 0) === a.w && s.r > a.r) ? { w: s.w || 0, r: s.r } : a, { w: 0, r: 0 });
    const hr = heaviest(h.filter(r => r.day > addDays(day, -21))), hp = heaviest(h.filter(r => r.day <= addDays(day, -21)));
    if (hr.w > hp.w || (hr.w === hp.w && hr.r > hp.r)) continue;
    if (prior && recent && recent <= prior * 1.005) out.push(ex);
  }
  return out;
}
/* Regular accessories that have gone quiet: done on 3+ days in the last 8 weeks (or a favourite done at least once), but not
   in the last DROP_AFTER days. Longest gap first. Main movements aren't here (a balanced session rotates those by your
   order), nor is anything your routines already schedule, or that you've set aside. */
const DROP_AFTER = 10, REGULAR_DAYS = 3, REGULAR_SPAN = 56;
function droppedLifts(day) {
  const seen = {};
  for (const x of allDoneSets(x => x.day < day && x.day >= addDays(day, -REGULAR_SPAN))) (seen[x.ex.id] ||= new Set()).add(x.day);
  const scheduled = autoMode() ? new Set() : new Set(Object.values(S.routines).flatMap(r => r.items.map(i => i.ex)));
  return Object.entries(seen).map(([id, days]) => ({ id, n: days.size, gap: daysBetween([...days].sort().pop(), day) }))
    .filter(x => x.gap >= DROP_AFTER && (x.n >= REGULAR_DAYS || isFav(x.id)) && !subOf(x.id) && !scheduled.has(x.id) && !skipped(x.id) && canDo(x.id))
    .sort((a, b) => b.gap - a.gap);
}
function deloadDue(day) {
  const first = firstDay();
  if (deloadOn(day) || !first || daysBetween(first, day) < 28) return null;
  if (S.settings.deloadSnooze && day < S.settings.deloadSnooze) return null;
  const weeks = hardWeeks(day), due = ageOn(day) >= 50 ? 4 : 5;   // recovery slows with age: a week sooner from 50
  if (weeks >= due) return { weeks, signs: [] };
  if (weeks < 3) return null;
  const tr = recoveryTrend(day), jr = jointRatios(day), st = stalledLifts(day);
  const hot = JOINT_ORDER.filter(j => jr[j].ratio > 1.3 && jr[j].acute > JOINT_FLOOR);
  const signs = [st.length >= 2 && `${st.length} lifts stalled`, (tr.hrvDown || tr.rhrUp) && "recovery trending down", hot.length && `${hot.map(j => JOINT_NAMES[j]).join(", ")} load running high`].filter(Boolean);
  return signs.length >= 2 ? { weeks, signs, early: true } : null;
}
// Deload weight: ~90%, rounded to the lift's step. When the step is too coarse for that, hold the weight (fewer sets and reps in reserve still make it light)
function deloadWeight(w, inc) { const x = Math.round(w * DELOAD_W / (inc || 5)) * (inc || 5); return x > 0 && x < w ? x : w; }
function deloadDay(day) { return !!(S.sessions[day]?.deload || deloadOn(day)); }
// The deload version of a lift, from the last full session: about half the sets (or n), weighted lifts at ~90% from the range bottom
// (rBase), bodyweight and timed work at the same load for about ⅔ of the reps or seconds
function deloadPlan(exId, day, n, rBase) {
  const L = progression(exId, day)?.last; if (!L) return null;
  const ex = exById(exId), src = doneSets(L.e);
  const top = Math.max(...src.map(s => s.w || 0)), maxR = Math.max(...src.map(s => s.r || 0));
  const w = ex.kind === "weight" ? deloadWeight(top, ex.inc) : top;
  const r = ex.kind === "weight" ? (rBase || L.e.rLo || maxR) : Math.max(1, Math.round(maxR * 2 / 3));
  return { n: n || Math.ceil(src.length / 2), w, r, top, last: L };
}
function liftedOn(day) { return !!S.sessions[day]?.entries?.some(e => doneSets(e).length); }
function cardioOn(fromDay, toDay) { return S.cardio.filter(a => a.day >= fromDay && a.day <= toDay && cardioMins(a) >= 15).sort((a, b) => a.t - b.t); }
function routineOf(day) {
  const s = S.sessions[day]; if (!s) return null;
  if (s.routine && S.routines[s.routine]) return S.routines[s.routine];
  if (s.routine === "auto") return AUTO;
  const exs = new Set((s.entries || []).filter(e => doneSets(e).length).map(e => e.ex));
  let best = null, bestN = 0;
  for (const r of Object.values(S.routines)) { const n = r.items.filter(it => exs.has(it.ex)).length; if (n > bestN && n >= Math.ceil(r.items.length / 2)) { best = r; bestN = n; } }
  return best;
}
function recoveryTrend(day) {
  const hk = Object.keys(S.health).filter(k => k <= day).sort();
  if (hk.length < 14) return {};
  const mean = (ks, f) => { const v = ks.map(k => S.health[k][f]).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const last7 = hk.slice(-7), prior = hk.slice(-35, -7);
  const t = { rhr7: mean(last7, "restingHr"), rhrB: mean(prior, "restingHr"), hrv7: mean(last7, "hrv"), hrvB: mean(prior, "hrv"), ready7: mean(last7, "readiness") };
  t.rhrUp = !!(t.rhr7 && t.rhrB && t.rhr7 - t.rhrB >= 4);
  t.hrvDown = !!(t.hrv7 && t.hrvB && t.hrv7 < t.hrvB * .9);
  return t;
}
/* Fuel: no food logging. The weight trend says whether you're eating enough for the goal, and the coach moves the
   daily target a few hundred kcal at a time, at most every 2 weeks (that's how long the scale takes to show it). */
const GOALS = {
  bulk: { n: "Lean bulk", lo: .25, hi: .5, r: "+0.25 to +0.5", add: 300, prot: .8 },
  maintain: { n: "Maintain", lo: -.2, hi: .2, r: "±0.2", add: 0, prot: .9 },
  cut: { n: "Cut", lo: -1, hi: -.5, r: "−0.5 to −1", add: -400, prot: 1 },
};
const KCAL_PER_LB = 17.5;   // maintenance guess: active, with a fast metabolism (the textbook figure is ~15–16 per lb)
const MORE_FOOD = ["a glass of whole milk and a banana", "2 tbsp peanut butter on toast", "a big handful of nuts or trail mix", "an extra cup of rice or pasta at dinner", "a shake made with milk, oats and a banana", "Greek yogurt with granola"];
const LESS_FOOD = ["one fewer snack or dessert", "half the cooking oil or butter", "water instead of juice or soda", "a smaller second helping at dinner"];
// Rotating protein ideas for the Fuel line: a reminder, nothing to tick. Lift days lead with a post-workout one.
const PROTEIN_IDEAS = ["3 eggs and a glass of milk at breakfast (~30 g)", "Greek yogurt with granola as a snack (~20 g)", "a can of tuna on toast or in pasta (~30 g)",
  "chicken at dinner, a palm and a half (~40 g)", "cottage cheese with fruit (~25 g)", "a big bowl of lentils or beans with rice (~20 g)",
  "a turkey and cheese sandwich (~30 g)", "salmon or other fish at dinner (~35 g)", "overnight oats made with milk and yogurt (~25 g)", "a glass of milk with each meal (~8 g each)"];
const POST_LIFT = ["a shake made with milk after lifting (~35 g)", "chocolate milk and a sandwich after lifting (~30 g)", "eggs on toast after lifting (~25 g)"];
function nutri() { const n = S.settings.nutrition || {}; return { goal: GOALS[n.goal] ? n.goal : "bulk", kcal: n.kcal || null, changes: n.changes || [] }; }
// Signed weekly rate in the display unit, 2 decimals (fmtW rounds to half units, too coarse here)
function fmtRate(lbWk) { const v = unit() === "kg" ? lbWk / LB_PER_KG : lbWk; return `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(2)} ${unit()}/week`; }
const TREND_DAYS = 42;
function round50(v) { return Math.round(v / 50) * 50; }
// Least-squares weight trend over weigh-ins in (from, to]: lb/week, and the fitted weight on `to`
function weightTrend(from, to) {
  const pts = Object.keys(S.health).filter(k => k > from && k <= to && S.health[k].weightLb).sort().map(k => [daysBetween(from, k), S.health[k].weightLb]);
  const n = pts.length;
  if (n < 2) return { n, span: 0 };
  const mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
  const sxx = pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0), sxy = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0);
  const slope = sxx ? sxy / sxx : 0;
  // Longest stretch without a weigh-in, when it's long enough to make the trend less certain
  let gap = null;
  for (let i = 1; i < n; i++) if (pts[i][0] - pts[i - 1][0] > Math.max(7, gap?.days || 0)) gap = { days: pts[i][0] - pts[i - 1][0], from: addDays(from, pts[i - 1][0] + 1), to: addDays(from, pts[i][0] - 1) };
  return { n, span: pts[n - 1][0] - pts[0][0], perWk: slope * 7, now: my + slope * (daysBetween(from, to) - mx), from, gap };
}
/* Tape measurements (body/<day>.tape, inches). On a lean bulk with no food log, the scale can't tell muscle from fat and its
   body-fat % mostly follows hydration; a flat waist while weight and arms go up says the gain is mostly muscle. */
const TAPE_NAMES = { waist: "Waist", neck: "Neck", arm: "Upper arm", chest: "Chest", thigh: "Thigh", hips: "Hips" };
const TAPE_HOW = { waist: "Level with your navel, relaxed, after breathing out", neck: "Just below the Adam's apple", arm: "Widest point, flexed",
  chest: "Nipple line, under the armpits, relaxed", thigh: "Widest point, standing on both feet", hips: "Widest point of the buttocks, feet together" };
const TAPE_RANGE = { waist: [18, 70], neck: [9, 30], arm: [6, 30], chest: [20, 70], thigh: [10, 45], hips: [20, 80] };
const GROW = ["arm", "chest", "thigh"];        // where muscle shows up
const WAIST_MAX_MO = .25;                      // in/month: faster than this on a lean bulk is mostly fat
const TAPE_EVERY = 14;
// Hips only count toward the women's estimate, so they're only asked for with women's standards (or once logged)
function tapeFields() { const f = S.settings.stdSex === "f" || Object.values(S.tape || {}).some(t => t.hips) ? Object.keys(TAPE_NAMES) : Object.keys(TAPE_NAMES).filter(k => k !== "hips");
  return f.map(k => [k, TAPE_NAMES[k], TAPE_HOW[k]]); }
function tapeUnit() { return unit() === "kg" ? "cm" : "in"; }
function toTape(inches) { if (inches == null) return ""; const v = unit() === "kg" ? inches * 2.54 : inches; return +v.toFixed(1); }
function fromTape(v) { const n = parseFloat(String(v).replace(",", ".")); if (!isFinite(n)) return NaN; return +(unit() === "kg" ? n / 2.54 : n).toFixed(2); }
function fmtTapeDelta(inches) { const v = toTape(Math.abs(inches)); return `${inches >= 0 ? "+" : "−"}${v} ${tapeUnit()}`; }
function lastTape(day) { const ks = Object.keys(S.tape || {}).filter(k => k <= day).sort(); return ks.length ? { day: ks[ks.length - 1], ...S.tape[ks[ks.length - 1]] } : null; }
function tapeSeries(k, to = "9999-12-31", from = "") { return Object.keys(S.tape || {}).sort().filter(d => d >= from && d <= to && S.tape[d][k]).map(d => ({ day: d, v: S.tape[d][k] })); }
// US Navy circumference method (Hodgdon & Beckett 1984), inches. About ±3–4 points against DEXA for one person; steadier as a trend
function navyFat(t, heightIn, sex) {
  if (!t || !heightIn || !t.waist || !t.neck || !sex) return null;
  const v = sex === "f" ? (t.hips && t.waist + t.hips - t.neck > 0 ? 163.205 * Math.log10(t.waist + t.hips - t.neck) - 97.684 * Math.log10(heightIn) - 78.387 : null)
    : t.waist - t.neck > 0 ? 86.010 * Math.log10(t.waist - t.neck) - 70.041 * Math.log10(heightIn) + 36.76 : null;
  return v == null || !isFinite(v) ? null : Math.max(2, Math.min(60, +v.toFixed(1)));
}
function navySeries(to) { return Object.keys(S.tape || {}).sort().filter(d => !to || d <= to).map(d => ({ day: d, v: navyFat(S.tape[d], S.settings.heightIn, S.settings.stdSex) })).filter(p => p.v != null); }
// Least-squares change per month over the last 8 weeks; needs 3 measurements over 3+ weeks
function tapeTrend(k, day, days = 56) {
  const pts = tapeSeries(k, day, addDays(day, -days)).map(p => [daysBetween(day, p.day), p.v]), n = pts.length;
  if (n < 3) return { n, span: 0 };
  const span = pts[n - 1][0] - pts[0][0]; if (span < 21) return { n, span };
  const mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
  const slope = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
  return { n, span, perMo: slope * 30.4 };
}
// Latest against the measurement closest to 4 weeks earlier (at least 3 weeks back)
function tapeChange(k, day) {
  const s = tapeSeries(k, day); if (s.length < 2) return null;
  const last = s[s.length - 1], back = s.filter(p => daysBetween(p.day, last.day) >= 21);
  if (!back.length) return null;
  const ref = back.reduce((a, p) => Math.abs(daysBetween(p.day, last.day) - 28) < Math.abs(daysBetween(a.day, last.day) - 28) ? p : a);
  return { d: last.v - ref.v, from: ref.day, to: last.day, now: last.v };
}
// What the tape says about the gain, in one line
function tapeRead(day) {
  const w = tapeChange("waist", day); if (!w) return null;
  const wt = tapeTrend("waist", day), rate = wt.perMo ?? w.d / daysBetween(w.from, w.to) * 30.4;
  const grew = GROW.map(k => [k, tapeChange(k, day)]).filter(([, c]) => c && c.d >= .25);
  const grewTxt = grew.map(([k, c]) => `${TAPE_NAMES[k].toLowerCase()} ${fmtTapeDelta(c.d)}`).join(", ");
  const since = fmtDay(w.from, { month: "short", day: "numeric" });
  if (rate > WAIST_MAX_MO) return { lvl: "warn", pill: "Waist rising", t: `Waist ${fmtTapeDelta(w.d)} since ${since}${grewTxt ? ` (${grewTxt})` : ""}. Faster than about ${fmtTapeDelta(WAIST_MAX_MO)} a month means more of the gain is fat than a lean bulk wants.` };
  if (rate < -WAIST_MAX_MO) return { lvl: "good", pill: "Leaning out", t: `Waist ${fmtTapeDelta(w.d)} since ${since}${grewTxt ? ` while ${grewTxt}` : ""}: you're leaning out.` };
  if (grew.length) return { lvl: "good", pill: "Mostly muscle", t: `Waist about flat since ${since} (${fmtTapeDelta(w.d)}) while ${grewTxt}: the gain looks like mostly muscle.` };
  return { lvl: "neutral", pill: "Waist steady", t: `Waist about flat since ${since} (${fmtTapeDelta(w.d)}). Arms and chest are slow to show on a tape; give them a couple more months.` };
}
function fuel(day) {
  const N = nutri(), G = GOALS[N.goal], bw = bwLb(day);
  const kcal = N.kcal || round50(bw * (S.settings.nutrition?.perLb || KCAL_PER_LB) + G.add);
  const prot = Math.round(bw * G.prot / 5) * 5;
  const last = N.changes.filter(c => c.day <= day).pop();
  // Six weeks, straight through any calorie change: shorter stretches mostly show water and food in the gut
  const tr = weightTrend(addDays(day, -TREND_DAYS), day);
  const recent = Object.keys(S.health).filter(k => k > addDays(day, -14) && k <= day && S.health[k].weightLb).length;
  const nextCheck = last ? addDays(last.day, 14) : null, due = !nextCheck || day >= nextCheck;
  const enough = tr.n >= 6 && tr.span >= 14;
  let status = !enough ? "unknown" : !due ? "settling" : tr.perWk < G.lo ? "low" : tr.perWk > G.hi + (N.goal === "bulk" ? .25 : 0) ? "high" : "ok";
  // The waist backs up the scale: on a lean bulk with weight on target, a waist climbing fast still means trim a little,
  // and with weight gain too slow, a climbing waist says not to add food
  const waist = N.goal === "bulk" ? tapeTrend("waist", day) : { n: 0 }, waistUp = waist.perMo > WAIST_MAX_MO;
  let nudge = null;
  if (due && status === "ok" && waistUp) { status = "waist"; nudge = { delta: -100 }; }
  else if (due && (status === "low" && !waistUp || status === "high")) {
    // 0.1 lb/week ≈ 70 kcal/day in practice (the textbook 50, plus what the body burns off when fed more)
    const raw = ((G.lo + G.hi) / 2 - tr.perWk) * 700;
    nudge = { delta: Math.sign(raw) * Math.min(250, Math.max(100, round50(Math.abs(raw)))) };
  }
  return { N, G, bw, kcal, prot, tr, recent, status, nudge, last, nextCheck, waist, waistHold: due && status === "low" && waistUp };
}
function fuelPick(list, day, n = 2) { const i = daysBetween("2026-01-01", day) % list.length; return [...list, ...list].slice(i, i + n); }
function agoText(k, day) { const n = daysBetween(k, day); return n === 1 ? "yesterday" : `${n} days ago`; }
/* Lifting two days running. Recovery is per muscle, not per calendar day: training a muscle again within ~24 h is what
   costs (more so after sets to failure), while working different muscles the next day is a normal split. So a lift the day
   after a lift is allowed as catch-up when you're 2+ lifts short of the week, it isn't a third day in a row, recovery looks
   normal, and the session leaves yesterday's hard-worked muscles alone. */
const B2B_HIT = 3;   // sets a muscle got yesterday (helpers count partly, easy sets half) that rule it out as a main mover today
function workedYesterday(day) { const y = addDays(day, -1), s = setsPerMuscle(y, y); return new Set(Object.keys(s).filter(m => s[m] >= B2B_HIT)); }
// The main muscles of an exercise that were worked hard yesterday
function hitsWorked(exId, worked) { return worked ? Object.entries(exById(exId).muscles).filter(([m, w]) => w >= 1 && worked.has(m)).map(([m]) => m) : []; }
const muscleList = ms => ms.map(m => MUSCLES[m].n.toLowerCase()).join(", ");

function planDay(day) {
  const wk = { ...WEEK_DEFAULT, ...(S.settings.week || {}) };
  const rotation = (wk.rotation || Object.keys(S.routines).sort()).filter(id => S.routines[id]);
  const yest = addDays(day, -1), why = [];
  const liftDays = []; for (let i = 1; i <= 6; i++) if (liftedOn(addDays(day, -i))) liftDays.push(addDays(day, -i));
  let lastLift = null; for (let i = 1; i <= 28 && !lastLift; i++) if (liftedOn(addDays(day, -i))) lastLift = addDays(day, -i);
  const cardio = cardioOn(addDays(day, -6), yest), todayCardio = cardioOn(day, day);
  const h = healthOn(day) || {}, tr = recoveryTrend(day);
  const dayStart = parseDay(day).getTime() - 12 * 36e5;
  const fat = fatigueAt(day === dayKey(new Date()) ? Date.now() : dayStart + 8 * 36e5, dayStart);
  let streak = 0; for (let i = 1; i <= 7; i++) { const k = addDays(day, -i); if (liftedOn(k) || cardioOn(k, k).length) streak++; else break; }

  // Cardio target is minutes as well as sessions; each remaining session gets its share of the missing minutes
  const minsT = wk.cardioMin, minsDone = cardioMinutes(addDays(day, -6), yest);
  // The long session builds a week at a time: your longest in the 3 weeks before this one, +10 min, up to the usual 45.
  // While it's building, no other session is planned longer than it
  const longest = Math.max(0, ...cardioOn(addDays(day, -28), addDays(day, -7)).map(cardioMins));
  const longMin = Math.min(45, Math.max(25, Math.round((longest + 10) / 5) * 5)), building = longMin < 45;
  const perSess = Math.min(building ? longMin : 60, Math.max(20, Math.round((minsT - minsDone) / Math.max(1, wk.cardio - cardio.length) / 5) * 5));
  const cardioShort = cardio.length < wk.cardio || minsDone < minsT * .8;
  why.push(`${liftDays.length} of ${wk.lifts} lifts and ${cardio.length} of ${wk.cardio} cardio sessions (${minsDone} of ${minsT} min) in the past 6 days`);
  if (lastLift) why.push(`last lift: ${esc(routineOf(lastLift)?.name || "custom session")}, ${agoText(lastLift, day)}`);
  if (h.readiness != null) why.push(`Garmin readiness ${h.readiness}${h.sleepScore ? `, sleep ${h.sleepScore}` : ""}${h.hrv ? `, HRV ${h.hrv} ms` : ""}`);
  if (tr.hrvDown || tr.rhrUp) why.push(`recovery trending down (${[tr.hrvDown && `HRV ${tr.hrv7.toFixed(0)} vs usual ${tr.hrvB.toFixed(0)}`, tr.rhrUp && `resting HR ${tr.rhr7.toFixed(0)} vs ${tr.rhrB.toFixed(0)}`].filter(Boolean).join(", ")})`);

  const poor = h.readiness != null ? h.readiness < 25 : /POOR/i.test(h.hrvStatus || "");
  const low = h.readiness != null && h.readiness < 50;
  const dl = deloadOn(day);
  if (dl) why.push(`deload week, day ${daysBetween(dl.start, day) + 1} of ${daysBetween(dl.start, dl.end) + 1}`);
  const cardioPick = () => {
    if (dl) return { kind: "cardio", mins: Math.min(30, perSess), title: `Easy Zone 2: ${cardioWords()}`, note: `${Math.min(30, perSess)} min${z2Text()}. Deload week: keep it easy, and no long session.` };
    if (tr.hrvDown || tr.rhrUp) return { kind: "cardio", mins: 25, title: "Short easy cardio, or rest", note: `20–30 min, conversational${z2Text()}. Recovery is dipping, and cardio is the first thing to cut, before lifting.` };
    if (!cardio.some(a => cardioMins(a) >= longMin)) {
      if (building) return { kind: "cardio", mins: longMin, title: `Long Zone 2: ${cardioWords()}`, note: `${longMin} min${longest ? `, about 10 more than your longest in recent weeks (${longest})` : ""}. Easy enough to hold a conversation${z2Text()}. Stop early if you need to; it builds up to 45–60 week by week.` };
      const m = Math.max(45, perSess); return { kind: "cardio", mins: m, title: `Long Zone 2: ${cardioWords()}`, note: `${m}–${m + 15} min, easy enough to hold a conversation${z2Text()}.` };
    }
    if (cardioTypes().includes("Run") && cardioTypes().length > 1 && !/Run/.test(cardio[cardio.length - 1]?.sport || "")) { const m = Math.min(35, perSess); return { kind: "cardio", mins: m, title: "Slow recovery run", note: `${m} min, conversational pace${z2Text()}.` }; }
    return { kind: "cardio", mins: perSess, title: `Easy Zone 2: ${cardioWords()}`, note: `${perSess} min${z2Text()}.` };
  };
  const tiredIn = r => [...new Set(r.items.flatMap(it => Object.entries(exById(it.ex).muscles).filter(([m, w]) => w >= 1 && readiness(fat[m]) === "fat").map(([m]) => m)))];
  // Noted aches: count exercises in a routine that are "not now" because of a joint
  const issues = activeIssues(day), jointIssues = issues.filter(i => i.k.startsWith("joint:"));
  const actx = { issues: jointIssues, fat: {}, wk: {}, noAlts: true, noEquip: true };   // missing gear is swapped at Start, not a reason to skip the day
  const blockedIn = r => r.items.filter(it => exerciseAdvice(it.ex, day, actx).lvl >= 2).map(it => exById(it.ex).name);
  const sick = issues.some(i => i.k === "general:sick"), tiredNote = issues.some(i => i.k === "general:tired");
  if (issues.length) why.push(`your notes: ${issues.map(i => issueLabel(i).toLowerCase()).join(", ")}`);
  const legsHurt = jointIssues.some(i => ["knee", "ankle", "hip"].includes(i.k.slice(6)) && i.sev >= 2);
  const backHurts = jointIssues.some(i => i.k === "joint:lowerBack" && i.sev >= 2);
  const cardioPick0 = cardioPick;
  const cardioPickSafe = () => {
    const c = cardioPick0();
    if (legsHurt && /run/i.test(c.title)) return { kind: "cardio", mins: c.mins, title: `Easy Zone 2: ${lowImpactWords()}`, note: c.mins + " min. Swapped from a run to spare your " + jointIssues.filter(i => ["knee", "ankle", "hip"].includes(i.k.slice(6))).map(i => JOINT_NAMES[i.k.slice(6)]).join("/") + "." };
    if (backHurts && /\brow\b/i.test(c.title)) return { kind: "cardio", mins: c.mins, title: "Easy walk or bike", note: c.mins + " min. Rowing loads the lower back; skip it until it settles." };
    return c;
  };
  const lastR = lastLift && routineOf(lastLift);
  const start = lastR && rotation.includes(lastR.id) ? (rotation.indexOf(lastR.id) + 1) % rotation.length : 0;
  const order = rotation.map((_, i) => S.routines[rotation[(start + i) % rotation.length]]);

  // Well behind on cardio minutes and recovering fine → stack a short easy session after lifting. Ticked off once today's cardio covers it
  const todayMins = cardioMinutes(day, day);
  const addonFor = () => {
    if (!(minsDone < minsT * .6 && !dl && !isNewcomer(day) && !tr.hrvDown && !tr.rhrUp && !low && !tiredNote)) return null;
    const m = Math.min(25, Math.max(15, Math.round((minsT - minsDone) / 3 / 5) * 5));
    return metMins(todayMins, m) ? { mins: m, done: true, text: `${todayMins} min of cardio today covers it.` }
      : { mins: m, text: `${m} min easy ${lowImpactWords()} after lifting${z2Text()}. You're at ${minsDone + todayMins} of ${minsT} cardio minutes this week.` };
  };

  // Lifted yesterday: can today still be a lift? (b2bNo = why not)
  const worked = lastLift === yest ? workedYesterday(day) : null, short = wk.lifts - liftDays.length;
  const b2bNo = !worked ? null
    : liftedOn(addDays(day, -2)) ? "you've lifted two days running, so a third waits"
    : short < 2 ? "you lifted yesterday and the week is on pace, so lifting days stay apart"
    : isNewcomer(day) ? "you lifted yesterday, and while lifts are new to you they leave you sore for longer, so lifting days stay apart"
    : low || tiredNote || tr.hrvDown || tr.rhrUp ? "you lifted yesterday and recovery is down, so not two days running"
    : null;
  let p;
  if (liftedOn(day)) {
    p = { kind: "done", title: `Lifted today: ${routineOf(day)?.name || "custom session"}`, note: "Easy cardio later is fine. No second lift." };
    const add = addonFor(); if (add) { p.addon = add; p.note = "No second lift."; }
  }
  else if (sick) p = { kind: "rest", title: "Rest", note: "You noted feeling sick. Training while ill slows recovery from both. Come back when you've had a day without symptoms." };
  else if (poor) p = { kind: "rest", title: "Rest or light mobility", note: "10–20 min. Readiness is poor; a hard session today costs more than it builds." };
  else if (streak >= 6) p = { kind: "rest", title: "Rest day", note: `You've trained ${streak} days in a row. Take one fully off.` };
  else if (b2bNo) {
    p = cardioShort ? cardioPickSafe() : { kind: "rest", title: "Rest or light mobility", note: "Cardio is already on target this week." };
    why.push(b2bNo);
  } else if (liftDays.length < wk.lifts && (order.length || autoMode())) {
    const ok = r => !blockedIn(r).length;
    const built = autoMode() ? buildSession(day) : null;
    // The day after a lift, only sessions that rest yesterday's muscles: routines with no main lift on them, or a built session with 2+ main lifts left
    const cands = worked ? order.filter(r => !r.items.some(it => hitsWorked(it.ex, worked).length)) : order;
    const noSplit = worked && (built ? built.slots.length < 2 : !cands.length);
    const mostlyBlocked = built ? built.items.length < 2 : cands.every(r => blockedIn(r).length * 2 >= r.items.length);
    if (noSplit) {
      p = cardioShort ? cardioPickSafe() : { kind: "rest", title: "Rest or light mobility", note: "" };
      why.push(`you lifted yesterday, and ${built ? "a session" : "every routine"} today would work ${muscleList([...worked])} again before they've recovered`);
    } else if (mostlyBlocked) {
      p = cardioShort ? cardioPickSafe() : { kind: "rest", title: "Rest or light mobility", note: "" };
      why.push(`every routine leans on what you noted (${jointIssues.map(i => JOINT_NAMES[i.k.slice(6)]).join(", ")}), so lifting can wait a day`);
    } else {
      const pick = built || cands.find(r => ok(r) && !tiredIn(r).length) || cands.find(ok) || cands.find(r => !tiredIn(r).length) || cands[0];
      if (worked) why.push(`you lifted yesterday, but you're ${short} lifts short of your week, so today works other muscles and leaves ${muscleList([...worked])} to recover`);
      if (built) why.push(...built.why);
      p = { kind: "lift", routine: pick, title: pick.name, deload: dl, note: dl ? "Deload week: half the sets at about 90% of your weight. Stop every set with 3–4 reps left."
        : low ? "Readiness is low: Start drops a set from each exercise and holds your weights. Skip grinders."
        : tiredNote ? "You noted feeling tired: Start drops a set from each exercise. Keep it moderate, no grinders."
        : tr.hrvDown || tr.rhrUp ? "Lift as planned, but hold your weights. No PR attempts while HRV is below your usual."
        : worked ? "Second lifting day running: stop each set 2–3 reps short of failure, so you recover in time for the next one."
        : h.readiness >= 75 ? "You're well recovered. Good day to push the top of your rep ranges." : "" };
      if (worked) p.b2b = true;
      p.trim = dl ? null : trimReason(day);
      const add = addonFor(); if (add) p.addon = add;
      if (built) {}
      else if (pick !== cands[0]) {
        const r0 = cands[0], b0 = blockedIn(r0), t0 = tiredIn(r0);
        why.push(`${esc(r0.name)} is next in rotation, but ${b0.length ? `${b0.map(esc).join(", ")} ${b0.length > 1 ? "aren't" : "isn't"} a good idea with your ${jointIssues.map(i => JOINT_NAMES[i.k.slice(6)]).join("/")}` : `${t0.map(m => MUSCLES[m].n.toLowerCase()).join(", ")} still need recovery`}`);
      } else if (tiredIn(pick).length) why.push(`every routine hits something still tired (${tiredIn(pick).map(m => MUSCLES[m].n.toLowerCase()).join(", ")}). Go lighter there`);
      const bp = built ? [] : blockedIn(pick);
      if (bp.length) why.push(`swap ${bp.map(esc).join(", ")}: each one's card suggests an alternative`);
    }
  } else if (cardioShort) p = cardioPickSafe();
  else p = { kind: "rest", title: "Rest or light mobility", note: "Lifting and cardio are both on target for the week." };
  // Cardio day: done once today's minutes reach the plan; less than that is partly done, with the rest optional
  if (p.kind === "cardio" && todayMins) {
    const want = p.mins || 30, last = todayCardio[todayCardio.length - 1];
    if (last && metMins(todayMins, want)) p = { kind: "done", title: `Cardio done: ${last.name}`, note: `${todayMins} min.`, cardio: last };
    else p = { ...p, partial: { done: todayMins, want }, title: `Partly done: ${todayMins} of ${want}′`, note: `${p.title}. ${want - todayMins} more min if you feel like it${z2Text()}.${last ? " It already counts as a session." : ""}` };
  }
  p.alts = (p.b2b ? order.filter(r => !r.items.some(it => hitsWorked(it.ex, worked).length)) : order).filter(r => r !== p.routine);
  p.why = why;
  return p;
}

/* Adaptive start: tailor a routine to today's gear, fatigue, joint load and weekly gaps. Returns the items plus what changed. */
function adaptRoutine(r, day) {
  const ctx = adviceCtx(day), changes = [], items = [], wk = { ...ctx.wk };
  const count = (exId, n) => { for (const [m, w] of Object.entries(exById(exId).muscles)) if (wk[m] != null) wk[m] += w * n; };
  for (const it of r.items) {
    let ex = it.ex, sets = it.sets;
    // 1. Swap what you can't (or shouldn't) do today for the closest alternative
    const sk = skipOf(ex);
    if (sk) {
      const taken = id => items.some(x => x.ex === id) || r.items.some(x => x.ex === id);
      const altId = [nextInMove(ex, day, ctx), ...similarEx(ex, day, ctx).map(e => e.id)].find(id => id && !taken(id));
      const why = sk.k === "never" ? "on your never list" : "skipped this cycle";
      if (!altId) { changes.push(`Dropped <b>${esc(exById(ex).name)}</b> (${why}, no good swap)`); continue; }
      changes.push(`<b>${esc(exById(ex).name)}</b> → <b>${esc(exById(altId).name)}</b> (${why})`);
      ex = altId;
    }
    const adv = exerciseAdvice(ex, day, ctx);
    if (adv.lvl >= 2) {
      const alt = adv.alts.find(a => canDo(a.id) && !items.some(x => x.ex === a.id) && !r.items.some(x => x.ex === a.id));
      if (!alt) { changes.push(`Dropped <b>${esc(exById(ex).name)}</b> (${esc(adv.reasons[0])}, no good swap)`); continue; }
      changes.push(`<b>${esc(exById(ex).name)}</b> → <b>${esc(alt.name)}</b> (${esc(adv.reasons[0])})`);
      ex = alt.id;
    }
    // 2. One set fewer when a main muscle would pass its weekly cap, or a loaded joint is already running hot
    const E = exById(ex), prim = Object.entries(E.muscles).filter(([, w]) => w >= .75).map(([m]) => m);
    const full = prim.find(m => wk[m] + sets > MUSCLES[m].hi);
    const hotJ = JOINT_ORDER.find(j => (JOINT[j]?.[ex] || 0) >= .6 && ctx.jr[j].ratio > 1.3);
    if (sets > 1 && (full || hotJ)) {
      changes.push(`<b>${esc(E.name)}</b> ${sets} → ${sets - 1} sets (${full ? `${MUSCLES[full].n.toLowerCase()} at ${Math.round(wk[full])} of ${MUSCLES[full].hi} this week` : `${JOINT_NAMES[hotJ]} load ${ctx.jr[hotJ].ratio.toFixed(1)}× usual`})`);
      sets--;
    }
    const sameKind = E.kind === exById(it.ex).kind;
    items.push({ ex, sets, r: sameKind ? it.r : E.kind === "time" ? 30 : 8, rHi: sameKind ? it.rHi : E.kind === "time" ? 45 : 12, w: ex === it.ex ? it.w : 0 });
    count(ex, sets);
  }
  // A compound movement a level behind the others goes first, while you're fresh (arms stay at the end)
  const lagIds = strengthLevels(day).groups.filter(g => g.lag && g.k !== "arms").flatMap(g => STD_GROUPS.find(x => x[0] === g.k)[2]);
  const li = items.findIndex(x => lagIds.includes(x.ex));
  if (li > 0) { const [x] = items.splice(li, 1); items.unshift(x); changes.push(`<b>${esc(exById(x.ex).name)}</b> first: that movement is a level behind your others`); }
  // Deload week: half the sets (rounded up), at ~90% of the weight (set at Start)
  if (deloadOn(day)) {
    const before = items.reduce((a, x) => a + x.sets, 0);
    for (const x of items) x.sets = Math.ceil(x.sets / 2);
    changes.push(`Deload week: <b>${before} → ${items.reduce((a, x) => a + x.sets, 0)} sets</b>, weights about 90%, 3–4 reps left in each set`);
    return { items, changes, deload: true };
  }
  // 3. Top up to two fresh muscles your routines under-cover across a week, minus extra work already done this week
  //    (structural gaps, so a lower day doesn't fill in for the upper day that's coming anyway). Not on a lighter day.
  if (!r.auto && !trimReason(day) && !isNewcomer(day)) {
    const base = r.items.reduce((a, it) => a + it.sets, 0);
    let total = items.reduce((a, x) => a + x.sets, 0), added = 0;
    const used = {}; for (const x of allDoneSets()) used[x.ex.id] = (used[x.ex.id] || 0) + 1;
    const { cov, exs } = routineCoverage(day), extra = Object.fromEntries(Object.keys(MUSCLES).map(m => [m, 0]));
    for (const x of allDoneSets(x => x.day >= addDays(day, -6) && x.day < day && !exs.has(x.ex.id)))
      for (const [m, w] of Object.entries(x.ex.muscles)) if (extra[m] != null) extra[m] += w * setWeight(x.e);
    for (const x of items) if (!exs.has(x.ex)) for (const [m, w] of Object.entries(exById(x.ex).muscles)) if (extra[m] != null) extra[m] += w * x.sets;
    const need = m => MUSCLES[m].lo - cov[m] - extra[m];
    const gaps = Object.keys(MUSCLES).filter(m => MUSCLES[m].lo > 0 && readiness(ctx.fat[m]) !== "fat").sort((a, b) => need(b) - need(a));
    for (const m of gaps) {
      if (added >= 2 || total >= base + 6) break;
      const gap = need(m); if (gap < 2) continue;
      const pick = allEx().filter(e => (e.muscles[m] || 0) >= 1 && canDo(e.id) && !skipped(e.id) && !items.some(x => x.ex === e.id) && exerciseAdvice(e.id, day, { ...ctx, noAlts: true }).lvl === 0)
        .sort((a, b) => isFav(b.id) - isFav(a.id) || (used[b.id] || 0) - (used[a.id] || 0) || Object.keys(a.muscles).length - Object.keys(b.muscles).length)[0];
      if (!pick) continue;
      const n = Math.min(3, Math.ceil(gap));
      items.push({ ex: pick.id, sets: n, r: pick.kind === "time" ? 30 : pick.kind === "bodyweight" ? 10 : 12, rHi: pick.kind === "time" ? 45 : 15, w: 0 });
      changes.push(`+ ${n} sets <b>${esc(pick.name)}</b> (your routines give ${MUSCLES[m].n.toLowerCase()} ${Math.round(cov[m])} of ${MUSCLES[m].lo} sets a week${extra[m] >= .5 ? `; ${Math.round(extra[m])} extra so far` : ""})`);
      count(pick.id, n); total += n; added++;
      for (const [mm, w] of Object.entries(pick.muscles)) if (extra[mm] != null) extra[mm] += w * n;
    }
  }
  return { items, changes };
}
// A week of the routines (each once) with gear you lack swapped out: sets per muscle, and the exercises involved
function routineCoverage(day) {
  const ctx0 = { issues: [], fat: {}, wk: {} }, cov = Object.fromEntries(Object.keys(MUSCLES).map(m => [m, 0])), exs = new Set();
  for (const r of Object.values(S.routines)) for (const it of r.items) {
    const ex = canDo(it.ex) ? it.ex : exerciseAdvice(it.ex, day, ctx0).alts.find(a => canDo(a.id))?.id;
    if (!ex) continue;
    exs.add(ex);
    for (const [m, w] of Object.entries(exById(ex).muscles)) if (cov[m] != null) cov[m] += w * it.sets;
  }
  return { cov, exs };
}

/* Balanced session (settings.week.mode = "auto"): built each day instead of taken from a routine.
   Full body, three main slots (lower, push, pull), each alternating between its two movements so each is
   trained about 1.5× a week on 3 lift days (frequency helps strength: docs/training-research.md §3). Then one core
   exercise, taking turns between bracing, rotation and flexion (CORE_TYPES). Then up to 2 accessories: first a regular
   of yours that has gone quiet (droppedLifts), then the muscles furthest below their weekly range, taking turns between
   the exercises you've done for that muscle. Exercises: what your gear and joints allow; main lifts prefer the ones
   you've done most (so progression has a history to work from). */
const SLOT_SUBS = {
  squat:  ["Squat", ["squat", "front_squat", "goblet", "split_squat", "lunge"], "squat"],
  hinge:  ["Hinge", ["deadlift", "rdl", "hip_thrust", "sl_rdl", "glute_bridge", "kb_swing"], "hinge"],
  hpress: ["Press", ["bench", "db_bench", "floor_press", "incline_db", "dip", "pushup"], "press"],
  vpress: ["Overhead", ["ohp", "db_ohp", "pike_pushup"], "overhead"],
  hpull:  ["Row", ["bb_row", "db_row", "inv_row"], "pull"],
  vpull:  ["Pull-up", ["pullup", "chinup", "pulldown"], "pull"],
};
const SESSION_SLOTS = [["squat", "hinge"], ["hpress", "vpress"], ["hpull", "vpull"]];
const AUTO = { id: "auto", name: "Balanced session", items: [], auto: true };
const CORE_TYPES = { brace: ["Bracing", ["plank", "ab_wheel"]], rotate: ["Rotation", ["side_plank", "twist", "pallof"]], flex: ["Flexion", ["leg_raise", "situp", "crunch"]] };
// Which kind of core work an exercise is (your own core exercises: rotation when obliques lead, else flexion); null when it isn't core
function coreType(exId) {
  const k = Object.keys(CORE_TYPES).find(k => CORE_TYPES[k][1].includes(exId)); if (k) return k;
  const E = exById(exId); return E.pattern !== "core" ? null : (E.muscles.obliques || 0) >= 1 ? "rotate" : "flex";
}
const SMALL_MUSCLES = new Set(["calves", "sideDelt", "rearDelt", "forearms", "abs", "obliques"]);
function autoMode() { return S.settings.week?.mode === "auto"; }

/* ---------- Exercise preferences (settings.prefs) ----------
   order: { [movement]: [exId…] }  your ranking inside each movement; balanced sessions take the first one you can do.
                                   Unranked exercises follow, most used first.
   skip:  { [exId | "move:<movement>"]: { k, since, note? } }  three levels of "not this one":
            (not today = a one-off swap on Today, nothing stored)
            cycle: left out of suggestions until the next deload has passed (or 8 weeks without one); then the coach asks
            never: left out of everything the app suggests, for good. You can still add it yourself.
   fav:   [exId…]  accessories you like: picked first when they cover a gap
   block: end day of the deload whose "new block" offer you've answered */
const CYCLE_FALLBACK = 56;
function prefs() { const p = S.settings.prefs || {}; return { order: p.order || {}, skip: p.skip || {}, fav: p.fav || [], block: p.block || null }; }
async function setPrefs(fn) {
  const p = JSON.parse(JSON.stringify(prefs())); fn(p);
  S.settings = { ...S.settings, prefs: p }; render(); await saveDoc("settings/main", S.settings);
}
function subOf(exId) { return Object.keys(SLOT_SUBS).find(k => SLOT_SUBS[k][1].includes(exId)) || null; }
// The skip that applies: the exercise's own, else its movement's
function skipOf(exId) { const sk = prefs().skip, s = subOf(exId); return sk[exId] || (s && sk["move:" + s]) || null; }
function skipped(exId) { return !!skipOf(exId); }
function isFav(exId) { return prefs().fav.includes(exId); }
function skipName(key) { return key.startsWith("move:") ? MOVE_NAMES[key.slice(5)] : exById(key).name; }
const MOVE_NAMES = { squat: "Squatting", hinge: "Hinging", hpress: "Horizontal pressing", vpress: "Overhead pressing", hpull: "Rowing", vpull: "Pull-ups" };
// A "this cycle" skip is up for review once a deload that started after it has ended, or after 8 weeks without one
function cycleDue(sk, day) {
  if (sk.k !== "cycle") return false;
  return (S.settings.deloads || []).some(d => d.start > sk.since && d.end < day) || daysBetween(sk.since, day) >= CYCLE_FALLBACK;
}
// The deload that just ended, if this day is in the week after it
function newBlock(day) {
  return (S.settings.deloads || []).filter(d => d.end < day && daysBetween(d.end, day) <= 7).sort((a, b) => a.end < b.end ? 1 : -1)[0] || null;
}
// For each movement you've trained lately: your current pick and up to two others you could switch to
function blockOffers(day) {
  const ctx = adviceCtx(day), out = [];
  for (const sub of Object.keys(SLOT_SUBS)) {
    const opts = ranked(sub).filter(id => !skipped(id) && canDo(id) && exerciseAdvice(id, day, { ...ctx, noAlts: true }).lvl < 2);
    const cur = opts[0];
    if (!cur || !historyFor(cur, day).some(r => r.day > addDays(day, -42))) continue;
    if (opts.length > 1) out.push({ sub, cur, alts: opts.slice(1, 3) });
  }
  return out;
}
function usedCounts(beforeDay) { const used = {}; for (const x of allDoneSets(x => !beforeDay || x.day < beforeDay)) used[x.ex.id] = (used[x.ex.id] || 0) + 1; return used; }
// A movement's exercises in your order (unranked: most used, then the built-in order)
function ranked(sub, used = usedCounts(), ord = prefs().order[sub] || []) {
  const r = id => { const i = ord.indexOf(id); return i < 0 ? 1e3 : i; };
  return [...SLOT_SUBS[sub][1]].sort((a, b) => r(a) - r(b) || (used[b] || 0) - (used[a] || 0));
}
// Put exId first in its movement, or move it one place (d = -1 up, +1 down). The current order is saved in full.
function reorder(p, sub, exId, d) {
  const list = ranked(sub, undefined, p.order[sub]); p.order[sub] = list;
  const i = list.indexOf(exId); if (i < 0) return;
  const t = d == null ? 0 : Math.max(0, Math.min(list.length - 1, i + d));
  list.splice(i, 1); list.splice(t, 0, exId);
}
// Your next choice in a movement after exId: one you can do, haven't skipped, and isn't off-limits today
function nextInMove(exId, day, ctx = adviceCtx(day)) {
  const sub = subOf(exId); if (!sub) return null;
  return ranked(sub).find(id => id !== exId && !skipped(id) && canDo(id) && exerciseAdvice(id, day, { ...ctx, noAlts: true }).lvl < 2) || null;
}
// Exercises that work the same main muscles, best fit first (no skipped ones)
function similarEx(exId, day, ctx = adviceCtx(day), n = 4) {
  const prim = Object.entries(exById(exId).muscles).filter(([, w]) => w >= .75).map(([m]) => m);
  if (!prim.length) return [];
  const sub = { ...ctx, noAlts: true };
  return allEx().filter(e => e.id !== exId && !skipped(e.id) && canDo(e.id)).map(e => ({ e, ov: prim.reduce((a, m) => a + (e.muscles[m] || 0), 0) }))
    .filter(x => x.ov >= .75).map(x => ({ ...x, lvl: exerciseAdvice(x.e.id, day, sub).lvl })).filter(x => x.lvl < 2)
    .sort((a, b) => a.lvl - b.lvl || b.ov - a.ov || isFav(b.e.id) - isFav(a.e.id)).slice(0, n).map(x => x.e);
}

function buildSession(day) {
  const ctx = adviceCtx(day), why = [], items = [], picked = [];
  // Lifted yesterday: main lifts and accessories skip the muscles worked hard then (see workedYesterday)
  const avoid = liftedOn(addDays(day, -1)) ? workedYesterday(day) : null, fresh = id => !hitsWorked(id, avoid).length;
  const used = {}; for (const x of allDoneSets(x => x.day < day)) used[x.ex.id] = (used[x.ex.id] || 0) + 1;
  // Last day a movement was trained. A balanced session records its main slots (session.slots), so its accessories
  // (a single-leg RDL on a squat day) don't count as that movement's turn.
  const lastOn = sub => { let best = null;
    for (const x of allDoneSets(x => x.day < day && SLOT_SUBS[sub][1].includes(x.ex.id))) {
      const sl = S.sessions[x.day]?.slots;
      if ((!sl || sl.includes(sub)) && (!best || x.day > best)) best = x.day;
    }
    return best; };
  // Your routines' numbers for an exercise, when it's in one; otherwise defaults by kind and role
  const fromRoutine = id => { for (const r of Object.values(S.routines)) { const it = r.items.find(i => i.ex === id); if (it) return it; } return null; };
  const numbers = (id, main) => {
    const it = fromRoutine(id), E = exById(id);
    if (it) return { sets: it.sets, r: it.r, rHi: it.rHi || it.r };
    if (E.kind === "time") return { sets: 2, r: 30, rHi: 45 };
    const small = Object.keys(E.muscles).every(m => SMALL_MUSCLES.has(m) || E.muscles[m] < 1);
    if (E.kind === "bodyweight") return main ? { sets: 3, r: 5, rHi: 12 } : { sets: 2, r: 10, rHi: 20 };
    return main ? { sets: 3, r: 6, rHi: 10 } : small ? { sets: 2, r: 12, rHi: 20 } : { sets: 2, r: 10, rHi: 15 };
  };
  const lagK = new Set(strengthLevels(day).groups.filter(g => g.lag).map(g => g.k));
  const ok = (id, maxLvl) => canDo(id) && exerciseAdvice(id, day, { ...ctx, noAlts: true }).lvl <= maxLvl;
  const pickIn = (sub, maxLvl) => ranked(sub, used).find(id => !skipped(id) && ok(id, maxLvl) && fresh(id));
  const pickIn0 = sub => ranked(sub, used).find(id => !skipped(id) && ok(id, 1)) || SLOT_SUBS[sub][1][0];
  const tired = id => Object.entries(exById(id).muscles).some(([m, w]) => w >= 1 && readiness(ctx.fat[m]) === "fat");
  for (const pair of SESSION_SLOTS) {
    const opts = pair.map(sub => {
      const id = pickIn(sub, 1), last = lastOn(sub);
      if (!id) return { sub, score: -1e3 };
      const since = last ? Math.min(14, daysBetween(last, day)) : 14;
      return { sub, id, score: since + (lagK.has(SLOT_SUBS[sub][2]) ? 4 : 0) - (tired(id) ? 10 : 0), since, last };
    }).sort((a, b) => b.score - a.score);
    const o = opts[0];
    if (!o.id) {
      if (avoid && pair.some(sub => ranked(sub, used).some(id => !skipped(id) && ok(id, 1)))) why.push(`${pair.map(sub => SLOT_SUBS[sub][0].toLowerCase()).join(" and ")}: rested today, since you worked ${muscleList(pair.flatMap(sub => hitsWorked(pickIn0(sub), avoid)).filter((m, i, a) => a.indexOf(m) === i))} yesterday`);
      continue;
    }
    picked.push(o.sub);
    items.push({ ex: o.id, ...numbers(o.id, true), w: 0 });
    why.push(`${SLOT_SUBS[o.sub][0].toLowerCase()}: ${o.last ? `last done ${agoText(o.last, day)}` : "not done recently"}${lagK.has(SLOT_SUBS[o.sub][2]) ? ", and it's behind your other movements" : ""}`);
  }
  const sk = prefs().skip;
  for (const sub of Object.keys(SLOT_SUBS)) if (sk["move:" + sub])
    why.push(`${MOVE_NAMES[sub].toLowerCase()} is on your ${sk["move:" + sub].k === "never" ? "never" : "skip-this-cycle"} list; accessories cover its muscles when they fall short`);
  const proj = { ...ctx.wk };
  const add = (id, n, sets, line) => {
    items.push({ ex: id, ...n, sets, w: 0 }); why.push(line);
    for (const [m, w] of Object.entries(exById(id).muscles)) if (proj[m] != null) proj[m] += w * sets;
  };
  for (const it of items) for (const [m, w] of Object.entries(exById(it.ex).muscles)) if (proj[m] != null) proj[m] += w * it.sets;
  const lastDone = {}; for (const x of allDoneSets(x => x.day < day)) if (!(lastDone[x.ex.id] >= x.day)) lastDone[x.ex.id] = x.day;
  const mainIds = new Set(picked.flatMap(k => SLOT_SUBS[k][1]));   // no goblet squat after a split squat: a second helping of the same movement isn't an accessory
  const free = id => !items.some(x => x.ex === id) && !mainIds.has(id) && !skipped(id) && ok(id, 0) && fresh(id);
  // Its main muscles are fresh enough, and these sets keep them inside the weekly range
  const room = (id, sets) => Object.entries(exById(id).muscles).every(([m, w]) => w < 1 || proj[m] == null || (readiness(ctx.fat[m]) !== "fat" && proj[m] + sets <= MUSCLES[m].hi));
  const lname = id => esc(exById(id).name.toLowerCase());
  // A regular accessory you haven't done in a while gets a place before anything else is added
  const due = droppedLifts(day).find(d => free(d.id) && room(d.id, numbers(d.id, false).sets));
  const dueLine = d => `${lname(d.id)}: a regular of yours, not done in ${d.gap} days`;
  // Core: one exercise every session. The kind you've gone longest without goes next; within it, your favourite or most used
  if (due && coreType(due.id)) { const n = numbers(due.id, false); add(due.id, n, n.sets, dueLine(due)); }
  else {
    const cores = allEx().filter(e => coreType(e.id)), typeLast = k => cores.filter(e => coreType(e.id) === k).map(e => lastDone[e.id] || "").sort().pop() || "";
    for (const k of Object.keys(CORE_TYPES).sort((a, b) => typeLast(a) < typeLast(b) ? -1 : typeLast(a) > typeLast(b) ? 1 : 0)) {
      const pick = cores.filter(e => coreType(e.id) === k && free(e.id) && room(e.id, numbers(e.id, false).sets))
        .sort((a, b) => isFav(b.id) - isFav(a.id) || (used[b.id] || 0) - (used[a.id] || 0))[0];
      if (!pick) continue;
      const n = numbers(pick.id, false);
      add(pick.id, n, n.sets, `${lname(pick.id)}: core takes turns each session, and ${CORE_TYPES[k][0].toLowerCase()} is up${typeLast(k) ? ` (last ${agoText(typeLast(k), day)})` : ""}`);
      break;
    }
  }
  const maxAcc = isNewcomer(day) ? 1 : 2;
  let acc = 0;
  if (due && !coreType(due.id)) { const n = numbers(due.id, false); add(due.id, n, n.sets, dueLine(due)); acc++; }
  // Then fresh muscles furthest below their weekly range, spread over the lift days left this week
  let liftsDone = 0; for (let i = 1; i <= 6; i++) if (liftedOn(addDays(day, -i))) liftsDone++;
  const left = Math.max(1, ({ ...WEEK_DEFAULT, ...(S.settings.week || {}) }).lifts - liftsDone);
  const need = m => MUSCLES[m].lo - proj[m];
  const gaps = Object.keys(MUSCLES).filter(m => MUSCLES[m].lo > 0 && readiness(ctx.fat[m]) !== "fat" && !avoid?.has(m) && need(m) >= 2).sort((a, b) => need(b) - need(a));
  // Among the exercises for a muscle: favourites, then the most direct, then the one you've gone longest without (ones you've never done come last)
  const turn = id => lastDone[id] || "9";
  for (const m of gaps) {
    if (acc >= maxAcc) break;
    if (need(m) < 2) continue;   // an earlier pick may have covered it
    const pick = allEx().filter(e => (e.muscles[m] || 0) >= 1 && free(e.id))
      .sort((a, b) => isFav(b.id) - isFav(a.id) || Object.keys(a.muscles).length - Object.keys(b.muscles).length || (turn(a.id) < turn(b.id) ? -1 : turn(a.id) > turn(b.id) ? 1 : 0))[0];
    if (!pick) continue;
    const at = Math.round(ctx.wk[m]);
    add(pick.id, numbers(pick.id, false), Math.max(2, Math.min(3, Math.ceil(need(m) / left))), `${lname(pick.id)}: ${MUSCLES[m].n.toLowerCase()} at ${at} of ${MUSCLES[m].lo}+ sets this week`);
    acc++;
  }
  const name = picked.length ? (picked.length < SESSION_SLOTS.length && avoid ? "Split: " : "Full body: ") + picked.map((k, i) => i ? SLOT_SUBS[k][0].toLowerCase() : SLOT_SUBS[k][0]).join(", ") : AUTO.name;
  return { ...AUTO, name, items, why, slots: picked };
}

// Look-ahead: replay planDay over the next n days, pretending each suggestion gets done. Nothing is saved.
function forecast(day, n) {
  const saved = {}, savedCardio = S.cardio, out = [];
  S.cardio = [...S.cardio];
  const fakeCardio = (k, title, mins) => {
    // first of your cardio types the plan's title mentions, e.g. "Easy Zone 2: run or bike" → Run
    const sport = cardioTypes().find(t => new RegExp(`\\b${(CARDIO_TYPES[t] || t).toLowerCase()}`, "i").test(title)) || cardioTypes()[0];
    S.cardio.push({ id: "sim-" + k, name: title, sport, day: k, t: parseDay(k).getTime() + 6 * 36e5, mins, km: 0, re: Math.round(mins * .8), muscles: CARDIO[sport] || {} });
  };
  try {
    for (let i = 0; i <= n; i++) {
      const k = addDays(day, i), p = planDay(k);
      if (i) out.push({ day: k, p });
      if (p.kind === "lift" && p.routine) {
        if (!(k in saved)) saved[k] = S.sessions[k];
        S.sessions[k] = { date: k, routine: p.routine.id, ...(p.routine.slots ? { slots: p.routine.slots } : {}), entries: p.routine.items.map(it => ({ ex: it.ex, effort: "solid",
          sets: Array.from({ length: it.sets }, () => ({ w: it.w || 0, r: it.r, done: true, t: parseDay(k).getTime() })) })) };
        if (p.addon) fakeCardio(k, lowImpactWords(), p.addon.mins);
      } else if (p.kind === "cardio") fakeCardio(k, p.title, p.mins || 30);
    }
  } finally {
    for (const k in saved) { if (saved[k] === undefined) delete S.sessions[k]; else S.sessions[k] = saved[k]; }
    S.cardio = savedCardio;
  }
  return out;
}

/* The coach */
function coach(day) {
  const msgs = [];
  const today = dayKey(new Date());
  const isToday = day === today;
  const dayStart = parseDay(day).getTime() - 12 * 36e5;
  const now = isToday ? Date.now() : parseDay(day).getTime() + 6 * 36e5;
  const fatPre = fatigueAt(isToday ? now : dayStart + 18 * 36e5, dayStart);   // before this day's work
  const fatNow = fatigueAt(now, now + 1);
  const sess = S.sessions[day];
  const start = firstDay();
  const histDays = start ? daysBetween(start, day) : 0;

  const deferred = [];   // checks that need the full message list first
  // Joint load spikes (this week vs the usual week)
  const jr = jointRatios(day);
  const spikes = JOINT_ORDER.filter(j => jr[j].ratio > 1.5 && jr[j].acute > JOINT_FLOOR).sort((a, b) => jr[b].ratio - jr[a].ratio);
  if (spikes.length) {
    const causes = [...new Set(spikes.flatMap(j => jr[j].top))].slice(0, 3);
    msgs.push({ k: "week", id: "joints", lvl: jr[spikes[0]].ratio > 2.5 ? "bad" : "warn", t: `<b>Joint load spike</b> this week: ${spikes.slice(0, 3).map(j => `${JOINT_NAMES[j]} <b>${jr[j].ratio.toFixed(1)}×</b>`).join(", ")} ${jr[spikes[0]].basis === "usual" ? "your usual week" : "a normal week of your plan"}${causes.length ? `, mostly from ${causes.map(esc).join(", ")}` : ""}.` });
  }
  for (const is of activeIssues(day)) if (is.k.startsWith("joint:") && is.sev >= 3)
    msgs.push({ k: "today", lvl: "bad", t: `You described your <b>${esc(issueLabel({ ...is, sev: 0 }).toLowerCase())}</b> as more than an ache (sharp, swollen or tweaked). Don't train through that. Rest it, and if it isn't clearly better in a few days, get it checked by a physio or doctor.` });
  // What to do today (flexible week)
  const plan = planDay(day);
  if (sess?.entries?.length && liftedOn(addDays(day, -1))) {
    // Two lifting days running is fine for different muscles; warn only about the ones worked hard yesterday
    const again = [...new Set(sess.entries.flatMap(e => hitsWorked(e.ex, workedYesterday(day))))];
    if (again.length) msgs.push({ k: "today", lvl: "warn", t: `${srcBtn("b2b")} You worked your <b>${muscleList(again)}</b> hard yesterday too. Muscles need about a day or two to recover, so keep those sets light and well short of failure.` });
  }

  // Deload: a lighter week every 5–6 weeks (plan rule), or sooner when warning signs pile up
  const dl = deloadOn(day), due = isToday && deloadDue(day);
  if (dl) msgs.push({ k: "today", lvl: "info", ic: "↓", t: `${srcBtn("deload")} <b>Deload week</b>, day ${daysBetween(dl.start, day) + 1} of ${daysBetween(dl.start, dl.end) + 1} (back to normal ${fmtDay(addDays(dl.end, 1), { weekday: "long" })}). Same lifts, half the sets, about 90% weight. You won't lose strength in a week; this is when the last few weeks' work settles in.
    ${isToday ? `<div class="swaps"><button class="chipbtn" data-act="deload-end">End it early</button></div>` : ""}` });
  else if (due) msgs.push({ k: "ask", lvl: "warn", ic: "↓", t: `${srcBtn("deload")} <b>Time for a deload week.</b> ${due.early ? `${due.weeks} weeks of full training, and ${due.signs.join(" and ")}.` : `${due.weeks} straight weeks of full training.`} For the next 7 days: the same lifts with half the sets at about 90% weight, easy cardio only. You'll come back stronger.
    <div class="swaps"><button class="chipbtn primary" data-act="deload-start">Start deload week</button><button class="chipbtn" data-act="deload-snooze">Not yet</button></div>` });

  // A new block after a deload: a chance to change a main lift (balanced sessions), and to bring back what you set aside
  if (isToday && !dl) {
    const nb = newBlock(day);
    if (nb && autoMode() && prefs().block !== nb.end) {
      const rows = blockOffers(day);
      if (rows.length) msgs.push({ k: "ask", lvl: "info", ic: "↻", t: `${srcBtn("variety")} <b>New block.</b> A good time to change a main lift for variety; whatever you pick, you keep for the block so progress can build.
        <div class="blockrows">${rows.map(o => `<div><span class="small"><b>${SLOT_SUBS[o.sub][0]}:</b> ${esc(exById(o.cur).name)}</span> ${o.alts.map(a => `<button class="chipbtn" data-act="prefer" data-sub="${o.sub}" data-id="${esc(a)}">Try ${esc(exById(a).name)}</button>`).join("")}</div>`).join("")}</div>
        <div class="swaps"><button class="chipbtn primary" data-act="blockdone" data-v="${nb.end}">Done</button></div>` });
    }
    for (const [key, sk] of Object.entries(prefs().skip)) if (cycleDue(sk, day))
      msgs.push({ k: "ask", lvl: "info", ic: "↻", t: `You set <b>${esc(skipName(key))}</b> aside on ${fmtDay(sk.since, { month: "short", day: "numeric" })}. Bring it back for this block?
        <div class="swaps"><button class="chipbtn primary" data-act="unskip" data-id="${esc(key)}">Bring it back</button><button class="chipbtn" data-act="skipex" data-id="${esc(key)}" data-k="cycle">Not yet</button><button class="chipbtn" data-act="skipex" data-id="${esc(key)}" data-k="never">Never</button></div>` });
  }

  // Recovery trending the wrong way → cut cardio first, not lifting (plan rule)
  const hk = Object.keys(S.health).filter(k => k <= day).sort();
  if (hk.length >= 14) {
    const mean = (ks, f) => { const v = ks.map(k => S.health[k][f]).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const last7 = hk.slice(-7), prior = hk.slice(-35, -7);
    const rhr7 = mean(last7, "restingHr"), rhrB = mean(prior, "restingHr"), hrv7 = mean(last7, "hrv"), hrvB = mean(prior, "hrv");
    const rhrUp = rhr7 && rhrB && rhr7 - rhrB >= 4, hrvDown = hrv7 && hrvB && hrv7 < hrvB * .9;
    if (rhrUp || hrvDown) msgs.push({ k: "week", id: "recovery", lvl: "warn", t: `Recovery is trending the wrong way: ${[rhrUp && `resting HR ${rhr7.toFixed(0)} vs usual ${rhrB.toFixed(0)}`, hrvDown && `HRV ${hrv7.toFixed(0)} vs usual ${hrvB.toFixed(0)} ms`].filter(Boolean).join(", ")}. <b>Cut cardio volume first</b>, not lifting.` });
    // …and the reverse: everything green → room to add easy cardio (~10%/week)
    else if (S.conn.strava.st === "ok") deferred.push(() => {
      const ready7 = mean(last7, "readiness");
      const cw = cardioMinutes(addDays(day, -6), day), cp = cardioMinutes(addDays(day, -13), addDays(day, -7));
      const stalled = msgs.some(m => /hasn't moved|Missed reps/.test(m.t));
      const rhrOk = !rhr7 || !rhrB || rhr7 <= rhrB + 1, hrvOk = !hrv7 || !hrvB || hrv7 >= hrvB * .98;
      const rampOk = !cp || cw <= cp * 1.1;
      if (ready7 >= 60 && rhrOk && hrvOk && !stalled && rampOk && (cw > 0 || cp > 0)) {
        const add = Math.max(5, Math.round(Math.max(cw, cp) * .1 / 5) * 5);
        msgs.push({ k: "week", id: "cardioroom", lvl: "good", t: `Recovery looks solid (readiness avg ${ready7.toFixed(0)}${hrv7 ? `, HRV ${hrv7.toFixed(0)} vs usual ${hrvB.toFixed(0)}` : ""}${rhr7 ? `, resting HR ${rhr7.toFixed(0)}` : ""}). Room for more cardio: about <b>+${add} min</b> of Zone 2 this week (you did ${cw} min), ideally added to your longest session. Keep it conversational.` });
      }
    });
  }

  // Fuel: the weight trend vs the goal's rate
  const F = fuel(day);
  if (F.nudge && isToday) {
    const more = F.nudge.delta > 0, ideas = fuelPick(more ? MORE_FOOD : LESS_FOOD, day);
    if (F.status === "waist") msgs.push({ k: "ask", lvl: "info", t: `<b>Trim about ${Math.abs(F.nudge.delta)} kcal a day.</b> Weight is on target (${fmtRate(F.tr.perWk)}), but your waist is up about ${fmtTapeDelta(F.waist.perMo)} a month over ${F.waist.n} measurements. On a lean bulk it should stay close to flat, so some of the gain is going to fat. For example: ${ideas.join(", or ")}. ${srcBtn("tape")}
      <div class="swaps"><button class="chipbtn" data-act="fuelack" data-n="${F.nudge.delta}">Got it</button></div>` });
    else msgs.push({ k: "ask", lvl: more ? "warn" : "info", t: `<b>${more ? "Eat" : "Trim"} about ${Math.abs(F.nudge.delta)} kcal${more ? " more" : ""} a day.</b> Weight is ${fmtRate(F.tr.perWk)} over the last ${F.tr.span} days; a ${F.G.n.toLowerCase()} aims for ${F.G.r} lb/week${F.status === "high" && F.N.goal === "bulk" ? ", and faster than that is mostly fat" : ""}. For example: ${ideas.join(", or ")}. Keep it up for 2 weeks and the next check will show whether it worked.
      <div class="swaps"><button class="chipbtn" data-act="fuelack" data-n="${F.nudge.delta}">Got it</button></div>` });
  } else if (F.recent < 4 && Object.values(S.health).some(x => x.weightLb))
    msgs.push({ k: "week", id: "weighins", lvl: "info", t: `Only <b>${F.recent} weigh-in${F.recent === 1 ? "" : "s"}</b> in the last 2 weeks. The food advice runs on your weight trend, so step on the scale most mornings (after the bathroom, before eating or drinking).` });
  // Tape: a reminder every 2 weeks, once you've measured at least once
  const lt = lastTape(day);
  if (lt && isToday && daysBetween(lt.day, day) >= TAPE_EVERY)
    msgs.push({ k: "week", id: "tape", lvl: "info", t: `Time to measure: last tape was ${agoText(lt.day, day)}. Waist first; it's what tells muscle from fat on a bulk.
      <div class="swaps"><button class="chipbtn primary" data-act="tape-open">Measure</button></div>` });

  // 0. Garmin recovery signals for this morning
  const h = healthOn(day);
  if (h) {
    if (h.readiness != null) {
      if (h.readiness < 25) msgs.push({ k: "today", lvl: "bad", t: `Garmin readiness is <b>${h.readiness}</b> (poor)${h.sleepScore ? `, sleep ${h.sleepScore}` : ""}. Make today light: technique work, mobility, or rest.` });
      else if (h.readiness < 50) msgs.push({ k: "today", lvl: "warn", t: `Garmin readiness is <b>${h.readiness}</b> (low). Train, but skip grinders and drop a set from each lift.` });
      else if (h.readiness >= 75 && !dl) msgs.push({ k: "echo", lvl: "good", t: `Garmin readiness is <b>${h.readiness}</b>. Good day to push for a PR.` });
    } else {
      if (h.sleepScore != null && h.sleepScore < 60) msgs.push({ k: "today", lvl: "warn", t: `Sleep score <b>${h.sleepScore}</b>. Keep the effort moderate today.` });
      if (/LOW|UNBALANCED|POOR/i.test(h.hrvStatus || "")) msgs.push({ k: "today", lvl: "warn", t: `Overnight HRV is <b>${h.hrv ?? "?"} ms</b> (${String(h.hrvStatus).toLowerCase()}). Your body's still under strain. Go lighter.` });
    }
    if (h.recoveryHours >= 36) msgs.push({ k: "today", lvl: "info", t: `Garmin recommends <b>${h.recoveryHours}h</b> more recovery, mostly from cardio. Upper body is the better pick today.` });
  }
  // 0b. Hard cardio in the last 2 days
  const recentCardio = S.cardio.filter(a => a.re >= 30 && a.day <= day && a.day >= addDays(day, -1) && Object.keys(a.muscles).length);
  for (const a of recentCardio.slice(0, 2)) {
    // The muscles it works hard (≥ .5); a walk works none that hard, so name its top two and say it was light
    const ms = Object.entries(a.muscles).filter(([m]) => MUSCLES[m]).sort((x, y) => y[1] - x[1]), main = ms.filter(([, w]) => w >= .5);
    const pick = (main.length ? main : ms.slice(0, 2)).map(([m]) => MUSCLES[m].n.toLowerCase());
    const list = pick.length > 1 ? `${pick.slice(0, -1).join(", ")} and ${pick[pick.length - 1]}` : pick[0];
    if (list) msgs.push({ k: "today", lvl: "info", t: `${a.day === day ? "Today's" : "Yesterday's"} <b>${esc(a.name)}</b> (${a.mins} min, effort ${a.re}) also ${main.length ? "" : "lightly "}loaded your ${list}.` });
  }

  // 1. Planned work on tired muscles
  const planned = new Set();
  for (const e of sess?.entries || []) for (const [m, w] of Object.entries(exById(e.ex).muscles)) if (w >= .75) planned.add(m);
  const tired = [...planned].filter(m => readiness(fatPre[m]) === "fat");
  if (tired.length) msgs.push({ k: "today", lvl: "bad", t: `<b>${tired.map(m => MUSCLES[m].n).join(", ")}</b> ${tired.length > 1 ? "are" : "is"} still fatigued from recent sessions. Keep it light today, or swap to something fresh.` });

  // 2. Same muscle 3 days running
  const streak = {};
  for (let i = 0; i < 3; i++) {
    const k = addDays(day, -i);
    const sp = setsPerMuscle(k, k);
    for (const m in sp) if (sp[m] >= 2) streak[m] = (streak[m] || 0) + 1;
  }
  const streaky = Object.keys(streak).filter(m => streak[m] === 3);
  if (streaky.length) msgs.push({ k: "today", lvl: "bad", t: `You've trained <b>${streaky.map(m => MUSCLES[m].n.toLowerCase()).join(", ")}</b> three days in a row. Muscles grow while they recover. Give ${streaky.length > 1 ? "them" : "it"} 48 hours.` });

  // 3. Weekly volume out of range
  const wk = setsPerMuscle(addDays(day, -6), day);
  const over = Object.keys(wk).filter(m => wk[m] > MUSCLES[m].hi);
  if (over.length) msgs.push({ k: "week", id: "over", lvl: "warn", t: `Over ${over.length > 1 ? "their" : "its"} useful weekly range: ${over.map(m => `<b>${MUSCLES[m].n}</b> ${wk[m].toFixed(0)} sets (cap ~${MUSCLES[m].hi})`).join(", ")}. Past that, extra sets mostly add fatigue.` });
  if (histDays >= 13) {
    const majors = ["chest", "lats", "upperBack", "quads", "hamstrings", "glutes"];
    const under = majors.filter(m => wk[m] < MUSCLES[m].lo / 2);
    if (under.length && !dl) msgs.push({ k: "week", id: "light", lvl: "info", t: `Light this week: ${under.map(m => `<b>${MUSCLES[m].n}</b> ${wk[m].toFixed(0)}/${MUSCLES[m].lo}`).join(", ")} sets.` });
  }

  // 4. Push/pull balance over 14 days
  const two = allDoneSets(x => x.day >= addDays(day, -13) && x.day <= day);
  const push = two.filter(x => x.ex.pattern === "push").length, pull = two.filter(x => x.ex.pattern === "pull").length;
  if (push + pull >= 12 && push > pull * 1.5) msgs.push({ k: "week", id: "pushpull", lvl: "warn", t: `Pressing outweighs pulling <b>${push}:${pull}</b> over two weeks. Shoulders like it closer to 1:1. Add rows or face pulls.` });
  else if (push + pull >= 12 && pull > push * 2) msgs.push({ k: "week", id: "pushpull", lvl: "info", t: `Pulling outweighs pressing <b>${pull}:${push}</b> over two weeks.` });

  // 5. Lower body neglect
  if (histDays >= 13) {
    const legs = allDoneSets(x => x.day > addDays(day, -10) && x.day <= day && (x.ex.pattern === "squat" || x.ex.pattern === "hinge")).length;
    if (!legs) msgs.push({ k: "week", id: "legs", lvl: "warn", t: `No squats or hinges in <b>10 days</b>. Legs are half your muscle mass.` });
  }

  // 6. Load spike (acute : chronic)
  const acute = totalSets(addDays(day, -6), day);
  const chronic = usualAvg(day, totalSets, 0);   // the 4 weeks to today, deload weeks left out
  if (histDays >= 20 && chronic >= 8 && deloadScale(addDays(day, -6), day) === 1) {
    const r = acute / chronic;
    if (r > 1.5) msgs.push({ k: "week", id: "load", lvl: "warn", t: `This week's load is <b>${r.toFixed(1)}×</b> your 4-week average. Ramp up ≤10–20% a week.` });
  }

  // 7. Rest days
  let trained = 0;
  for (let i = 0; i < 7; i++) { const s = S.sessions[addDays(day, -i)]; if (s?.entries?.some(e => doneSets(e).length)) trained++; }
  if (trained >= 6) msgs.push({ k: "week", id: "restdays", lvl: "warn", t: `${trained} training days out of the last 7. Plan a full rest day.` });

  // 8a. A regular accessory you've stopped doing: asked on a lifting day, unless today's plan or session already has it
  if (isToday && !dl && !sess?.finished && (sess?.entries?.length || plan.kind === "lift")) {
    const has = new Set(sess?.entries?.length ? sess.entries.map(e => e.ex) : (plan.routine?.items || []).map(it => sess?.pre?.[it.ex] || it.ex));
    for (const d of droppedLifts(day).filter(d => !has.has(d.id)).slice(0, 2))
      msgs.push({ k: "ask", id: "dropped:" + d.id, lvl: "info", ic: "↻", t: `<b>${esc(exById(d.id).name)}</b> was a regular (${d.n} sessions in 8 weeks), but you haven't done it in <b>${d.gap} days</b>.
        <div class="swaps"><button class="chipbtn primary" data-act="add" data-id="${esc(d.id)}">Add to today</button><button class="chipbtn" data-act="skipex" data-id="${esc(d.id)}" data-k="cycle">Let it go</button></div>` });
  }

  // 8. Stalls
  if (!dl) for (const ex of stalledLifts(day)) {
    // Changing the variation is the other standard fix: your next choice in the movement, else the closest exercise
    const to = isToday && (nextInMove(ex.id, day) || similarEx(ex.id, day)[0]?.id);
    msgs.push({ k: to ? "ask" : "week", id: "stall:" + ex.id, lvl: "info", t: `<b>${esc(ex.name)}</b> hasn't moved in 3 weeks. Try a lighter week, change the rep range, or swap it for a while.${to ? `
      <div class="swaps"><button class="chipbtn" data-act="stallswap" data-id="${esc(ex.id)}" data-to="${esc(to)}">Swap for ${esc(exById(to).name)}</button></div>` : ""}` });
  }

  // 8b. A movement a level behind the rest (Start already moves it to the front)
  if (histDays >= 21 && !dl && isToday) {
    const lag = strengthLevels(day).groups.filter(g => g.lag);
    if (lag.length) msgs.push({ k: "week", id: "lag", lvl: "info", t: `${srcBtn("levels")} <b>${lag.map(g => g.n).join(" and ")}</b> ${lag.length > 1 ? "are" : "is"} about a level behind your other movements (${lag.map(g => `${g.best.level.toLowerCase()} on ${esc(exById(g.best.exId).name.toLowerCase())}`).join(", ")}). Do ${lag.length > 1 ? "them" : "it"} first in the session while you're fresh.` });
  }

  // 9. PRs today
  for (const e of sess?.entries || []) {
    const ex = exById(e.ex), sc = entryScore(e, ex);
    if (!sc) continue;
    const prev = historyFor(e.ex, day);
    if (prev.length && sc > Math.max(...prev.map(r => r.score)))
      msgs.push({ k: "win", lvl: "good", t: `New best on <b>${esc(ex.name)}</b>: ${ex.kind === "weight" ? `est. 1RM ${fmtW(sc)}${PER_HAND.has(ex.id) ? " per hand" : ""}` : `${sc}${ex.kind === "time" ? "s" : " reps"}`}.` });
  }

  deferred.forEach(f => f());
  // Suggestions: fresh muscles with the biggest weekly gap
  const gaps = dl ? [] : Object.keys(MUSCLES).filter(m => MUSCLES[m].lo > 0 && readiness(fatNow[m]) === "fresh")
    .map(m => ({ m, gap: MUSCLES[m].lo - wk[m] })).filter(x => x.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 4);
  const routineScores = Object.values(S.routines).map(r => {
    let score = 0;
    for (const it of r.items) for (const [m, w] of Object.entries(exById(it.ex).muscles)) {
      const rd = readiness(fatNow[m]);
      score += w * (rd === "fresh" ? 1 : rd === "rec" ? -.5 : -2) + (w * Math.max(0, MUSCLES[m]?.lo - wk[m]) / 10);
    }
    return { r, score: score / Math.max(1, r.items.length) };
  }).sort((a, b) => b.score - a.score);
  const usedCount = {};
  for (const x of allDoneSets()) usedCount[x.ex.id] = (usedCount[x.ex.id] || 0) + 1;
  const exSuggest = [];
  for (const g of gaps) {
    const cands = allEx().filter(e => canDo(e.id) && !skipped(e.id) && (e.muscles[g.m] || 0) >= 1 && Object.entries(e.muscles).every(([m, w]) => w < .75 || readiness(fatNow[m]) !== "fat"));
    cands.sort((a, b) => isFav(b.id) - isFav(a.id) || (usedCount[b.id] || 0) - (usedCount[a.id] || 0));
    const pick = cands.find(c => !exSuggest.includes(c));
    if (pick) exSuggest.push(pick);
  }
  return { msgs, fatNow, fatPre, gaps, routineScores, exSuggest, wk, plan };
}

/* ============================== Rendering ============================== */
const $ = s => document.querySelector(s);
function render() {
  document.querySelectorAll("nav.tabs button").forEach(b => b.setAttribute("aria-selected", String(b.id === "tab-" + S.tab)));
  $("#open-settings").setAttribute("aria-pressed", String(S.tab === "settings"));
  $("#banner").innerHTML = S.mode === "demo"
    ? `<div class="banner"><b>Example data.</b> This browser won't let the app save (private browsing?), so it shows three made-up weeks. Nothing here is saved.</div>`
    : S.mode === "readonly" ? `<div class="banner"><b>Read-only.</b> You can look, but changes won't be saved.</div>` : "";
  const v = $("#view");
  if (S.mode === "loading") { v.innerHTML = `<p class="muted">Loading your log…</p>`; return; }
  const setup = needsSetup(); $("nav.tabs").hidden = setup; $("#open-settings").hidden = setup;
  if (setup) { v.innerHTML = renderSetup(); return; }
  const focus = document.activeElement?.id, selStart = document.activeElement?.selectionStart;
  v.innerHTML = S.tab === "today" ? renderToday() : S.tab === "week" ? renderWeek() : S.tab === "progress" ? renderProgress() : renderSettings();
  if (focus) { const el = document.getElementById(focus); if (el) { el.focus(); try { if (selStart != null) el.setSelectionRange(selStart, selStart); } catch {} } }
  if (S.tab === "progress") wireChart();
  drawLinks();
  // A sheet that shows live state (your body, an exercise) redraws with the page
  S.liveSheet?.(); S.liveHelp?.();
  syncHistory();
}
// Replace a layer's content, keeping its scroll position and the caret of whatever was being typed in
function setLayer(sel, html) {
  const el = $(sel), a = document.activeElement, id = a && el.contains(a) ? a.id : null, pos = id ? a.selectionStart : null, top = el.querySelector(".sb")?.scrollTop || 0;
  el.innerHTML = html;
  const sb = el.querySelector(".sb"); if (sb) sb.scrollTop = top;
  if (id) { const n = document.getElementById(id); if (n) { n.focus(); try { if (pos != null) n.setSelectionRange(pos, pos); } catch {} } }
}
function sheetHtml(title, body, attrs = "", head = "") {
  return `<div class="sheet-bg" data-act="closesheet"><div class="sheet" role="dialog" aria-label="${esc(title)}" ${attrs}>
    <div class="sh"><div style="display:flex;justify-content:space-between;align-items:center"><h2>${esc(title)}</h2><button class="x iconbtn" data-act="closesheet" aria-label="Close">×</button></div>${head}</div>
    <div class="sb">${body}</div></div></div>`;
}

/* In-app back: the phone's back gesture closes the top layer (a guide, a sheet, a detail page, Setup) instead of leaving the app.
   The browser history is kept as deep as what's open; hDepth is how many entries the app has pushed. */
let hDepth = 0, hSkip = false;
function navDepth() {
  const page = S.tab === "settings" ? 1 + (S.setupPage ? 1 : 0) : S.tab === "progress" && S.progPage ? (S.progPage.startsWith("lift:") ? 2 : 1) : 0;
  return page + ($("#sheet").innerHTML ? 1 : 0) + ($("#help").innerHTML ? 1 : 0);
}
function syncHistory() {
  if (hSkip) return;
  const want = navDepth();
  try {
    while (hDepth < want) history.pushState({ il: ++hDepth }, "");
    if (hDepth > want) { const n = hDepth - want; hDepth = want; hSkip = true; history.go(-n); setTimeout(() => { hSkip = false; }, 1000); }
  } catch {}
}
function goBack() {
  if ($("#help").innerHTML) closeHelp();
  else if ($("#sheet").innerHTML) closeSheet();
  else if (S.tab === "progress" && S.progPage) { S.progPage = S.progPage.startsWith("lift:") ? "strength" : null; render(); window.scrollTo(0, 0); }
  else if (S.tab === "settings") { if (S.setupPage) S.setupPage = null; else S.tab = S.prevTab || "today"; render(); window.scrollTo(0, 0); }
}
window.addEventListener("popstate", () => {
  if (hSkip) { hSkip = false; syncHistory(); return; }   // the app's own step back
  hDepth = Math.max(0, hDepth - 1);
  goBack(); syncHistory();
});

// First-run tips: each shows once, in context, until "Got it" (kept in settings so it syncs)
const TIPS = {
  plan: "This is today's suggestion. The coach picks lift, cardio or rest from your last 7 days and how recovered you are. Tap <b>Start</b> to load the sets, or <b>Something else</b> for every other option.",
  tick: "Set the weight and reps, then tap <b>✓</b> when the set is done. Only ticked sets count. Tap any exercise to open it; open ones stay open, so you can alternate between two.",
  swap: "Tap <b>⇄</b> next to an exercise to swap it. <b>Today</b> is a one-off. You can also set it aside until your next deload, or for good. Your order inside each movement is under Setup → Exercises.",
  coach: "Questions from the coach show up here, one at a time. Its notes on your week are on the <b>Week</b> tab.",
};
const tip = k => (S.settings.tipsSeen || []).includes(k) ? "" : `<div class="ftip" role="note"><div>${TIPS[k]}</div><button class="linkbtn" data-act="tipok" data-k="${k}">Got it</button></div>`;
// A details element whose open state survives re-renders (S.open, keyed by id)
const fold = (id, summary, body, cls = "") => `<details class="fold ${cls}" id="${id}" ${S.open[id] ? "open" : ""}><summary>${summary}</summary>${body}</details>`;
const MSG_RANK = { bad: 0, warn: 1, good: 2, info: 3 };
const msgRow = m => `<div class="msg ${m.lvl}"><span class="ic">${m.ic || { bad: "!", warn: "!", good: "★", info: "i" }[m.lvl]}</span><div>${m.t}</div></div>`;

// Today changes with the day: a plan before training, the sets while training, a summary once finished
/* Week strip: three days back, today, three ahead. Filled marks are logged, dashed ones planned. */
const WEEK_ICON = {
  lift: `<path d="M3 9v6M6.5 6v12M17.5 6v12M21 9v6M6.5 12h11"/>`,
  cardio: `<path d="M2 12h5l3-7 4 14 3-7h5"/>`,
  rest: `<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>`,
};
function weekDays(day, today) {
  const from = Math.abs(daysBetween(today, day)) <= 3 ? addDays(today, -3) : addDays(day, -3);
  return Array.from({ length: 7 }, (_, i) => addDays(from, i));
}
// The plan for each day from today on. Later days come from the look-ahead, so a tile and its day view agree.
function weekPlans(days, today) {
  const last = days[days.length - 1], plans = {};
  if (last < today) return plans;
  if (days.includes(today)) plans[today] = planDay(today);
  if (last > today) for (const f of forecast(today, Math.min(14, daysBetween(today, last)))) plans[f.day] = f.p;
  for (const k of days) if (k >= today && !plans[k]) plans[k] = planDay(k);
  return plans;
}
function dayMarks(k, today, plans) {
  const lifted = liftedOn(k), mins = cardioOn(k, k).reduce((a, x) => a + cardioMins(x), 0), marks = [];
  const p = k >= today ? plans[k] : null;
  if (lifted) marks.push({ k: "lift", done: true });
  else if (p?.kind === "lift") marks.push({ k: "lift" });
  if (mins) marks.push({ k: "cardio", done: true, mins });
  else if (p?.kind === "cardio" || (p?.addon && !lifted)) marks.push({ k: "cardio" });
  return marks.length ? marks : [{ k: "rest", done: k < today }];
}
function renderWeekStrip(day, today, days, plans) {
  const words = m => m.k === "rest" ? (m.done ? "nothing logged" : "rest") : m.k === "lift" ? (m.done ? "lifted" : "lift planned") : m.done ? `cardio, ${m.mins} minutes` : "cardio planned";
  const tiles = days.map(k => {
    const marks = dayMarks(k, today, plans);
    return `<button class="wd ${k === day ? "sel" : ""} ${k === today ? "now" : ""}" data-act="goto" data-day="${k}" aria-pressed="${k === day}" ${k === today ? `aria-current="date"` : ""} aria-label="${fmtDay(k, { weekday: "long", month: "long", day: "numeric" })}: ${marks.map(words).join(", ")}">
      <span class="wl">${fmtDay(k, { weekday: "narrow" })}</span>
      <span class="wdi n${marks.length}">${marks.map(m => `<svg class="${m.k} ${m.done ? "done" : "plan"}" viewBox="0 0 24 24" aria-hidden="true">${WEEK_ICON[m.k]}</svg>`).join("")}</span>
      <span class="wn num">${parseDay(k).getDate()}</span>
    </button>`;
  }).join("");
  return `<div class="week">
    <button class="wa" data-act="prevday" aria-label="Previous day">‹</button>
    <div class="wds">${tiles}</div>
    <button class="wa" data-act="nextday" aria-label="Next day">›</button>
  </div>`;
}

/* Body map: muscles coloured by readiness, overloaded joints marked. Coordinates are for the left half; `true` means mirror it. */
const BM_ARM = "M20 48C22 47 25 46 27 44C28 52 27 62 25 70L19 70C18 62 18 54 20 48Z", BM_FOREARM = "M18.5 72L25 72C25 82 23 92 21 100L16 100C15 90 16 80 18.5 72Z", BM_SIDE = "M28 32C23 34 20 39 20 46C22 46 24 44 25 40C26 36 27 34 28 32Z";
const BM_FRONT = [
  ["sideDelt", BM_SIDE, true], ["frontDelt", "M36 31C30 31 26 34 25 40C29 42 33 41 36 38Z", true],
  ["chest", "M37 33C42 32 47 33 49 35L49 50C44 54 36 52 33 46C33 41 35 37 37 33Z", true],
  ["biceps", BM_ARM, true], ["forearms", BM_FOREARM, true],
  ["abs", "M43 54L57 54L56 96Q50 100 44 96Z"], ["obliques", "M41 54L34 50C33 62 33 76 35 90L42 94Z", true],
  ["quads", "M33 100C31 115 32 135 37 150L44 150C46 135 46 120 44 108L36 98Z", true],
  ["adductors", "M45 106L49 102L49 128C48 132 47 134 46 134C47 124 47 114 45 106Z", true],
];
const BM_BACK = [
  ["sideDelt", BM_SIDE, true], ["rearDelt", "M35 33C29 32 26 35 25 40C29 43 33 42 37 38Z", true],
  ["traps", "M44 22L56 22L64 33L56 60L50 66L44 60L36 33Z"], ["upperBack", "M37 40L43 60L34 54C33 49 34 44 37 40Z", true],
  ["lats", "M33 56L44 63L44 80L37 88C34 78 32 66 33 56Z", true], ["lowerBack", "M45 68L50 72L55 68L56 94L44 94Z"],
  ["triceps", BM_ARM, true], ["forearms", BM_FOREARM, true],
  ["glutes", "M35 96L49 96L49 120C43 125 36 122 33 114C33 107 34 101 35 96Z", true],
  ["hamstrings", "M33 118C37 125 43 127 49 122L47 150L37 150C33 140 32 128 33 118Z", true],
  ["calves", "M36 156L46 156C47 165 46 176 44 186L38 186C35 176 35 165 36 156Z", true],
];
const BM_REST = { front: ["M50 3a9 10 0 1 0 .01 0Z", "M45 21L55 21L55 31L45 31Z", "M18 101a3.5 5 0 1 0 .01 0Z", "M36 158L45 158C45 170 44 184 43 194L38 194C36 184 35 170 36 158Z", "M37 196L44 196L44 202L34 202Z"], back: ["M50 3a9 10 0 1 0 .01 0Z", "M45 21L55 21L55 31L45 31Z", "M18 101a3.5 5 0 1 0 .01 0Z", "M38 188L44 188L44 202L35 202Z"] };
const BM_JOINT = { shoulder: ["front", 26, 37, true], elbow: ["front", 22, 71, true], wrist: ["front", 18.5, 100, true], hip: ["front", 36, 99, true], knee: ["front", 40, 153, true], ankle: ["front", 40, 195, true], lowerBack: ["back", 50, 88], neck: ["back", 50, 22] };
const MIRROR = `transform="translate(100,0) scale(-1,1)"`;
// The two figures. o: { cls(m) → class, tip(m) → tooltip, hatch: { class: pattern id }, jr, sel, act (tappable), labels, said }
function bodySvg(o) {
  const jr = o.jr, hot = jr ? JOINT_ORDER.filter(j => jr[j].ratio > 1.3) : [];
  const act = k => o.act ? ` data-act="bodysel" data-k="${k}"` : "";
  const region = ([m, d, mirror]) => {
    const k = o.cls(m), attrs = `class="bmr ${k} ${o.sel === "m:" + m ? "on" : ""}" d="${d}"${act("m:" + m)}${o.hatch?.[k] ? ` fill="url(#${o.hatch[k]})"` : ""}`, t = o.act ? `<title>${o.tip(m)}</title>` : "";
    return `<path ${attrs}>${t}</path>${mirror ? `<path ${attrs} ${MIRROR}>${t}</path>` : ""}`;
  };
  const marker = (j, x, y) => jr[j].ratio > 1.5
    ? `<path class="bmj over" d="M${x} ${y - 4.5}l4.5 4.5l-4.5 4.5l-4.5-4.5Z"${act("j:" + j)}/>`
    : `<circle class="bmj warnj" cx="${x}" cy="${y}" r="3.5"${act("j:" + j)}/>`;
  const figure = (side, regions) => `
    ${BM_REST[side].map(d => `<path class="bmn" d="${d}"/><path class="bmn" d="${d}" ${MIRROR}/>`).join("")}
    ${regions.map(region).join("")}
    ${hot.filter(j => BM_JOINT[j][0] === side).map(j => { const [, x, y, mirror] = BM_JOINT[j]; return marker(j, x, y) + (mirror ? marker(j, 100 - x, y) : ""); }).join("")}
    ${o.labels ? `<text x="50" y="214" text-anchor="middle" class="bmt">${side === "front" ? "Front" : "Back"}</text>` : ""}`;
  return `<svg class="${o.act ? "" : "still"}" viewBox="0 0 215 ${o.labels ? 218 : 204}" ${o.said ? `role="img" aria-label="${esc(o.said)}"` : `aria-hidden="true"`}>
      <defs><pattern id="bm-hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="hb" width="3" height="3"/><rect class="hl" width="1" height="3"/></pattern>
        <pattern id="bm-dots" width="5" height="5" patternUnits="userSpaceOnUse"><rect class="db" width="5" height="5"/><circle class="dd" cx="2.5" cy="2.5" r=".8"/></pattern>
        <pattern id="bm-over" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="ob" width="3" height="3"/><rect class="ol" width="1" height="3"/></pattern></defs>
      <g>${figure("front", BM_FRONT)}</g>
      <g transform="translate(115,0)">${figure("back", BM_BACK)}</g>
    </svg>`;
}
const jointCap = j => JOINT_NAMES[j][0].toUpperCase() + JOINT_NAMES[j].slice(1);
function hotJoints(jr) { return JOINT_ORDER.filter(j => jr[j].ratio > 1.3).sort((a, b) => jr[b].ratio - jr[a].ratio); }
function jointDetail(j, r) {
  return `<b>${jointCap(j)}</b>: ${r.ratio.toFixed(1)}× ${r.basis === "usual" ? "your usual week" : "a normal week of your plan"}${r.top.length ? `, mostly from ${r.top.map(esc).join(", ")}` : ""}. Joints and tendons adapt more slowly than muscles, so raise their load about 20–30% a week at most.`;
}
function jointChips(jr, sel, tap) {
  const hot = hotJoints(jr);
  return hot.map(j => { const inner = `${jr[j].ratio > 1.5 ? "◆" : "○"} ${jointCap(j)} <span class="num">${jr[j].ratio.toFixed(1)}×</span>`, cls = `chipbtn jchip ${jr[j].ratio > 1.5 ? "over" : ""}`;
    return tap ? `<button class="${cls}" data-act="bodysel" data-k="j:${j}" aria-pressed="${sel === "j:" + j}">${inner}</button>` : `<span class="${cls}">${inner}</span>`; }).join("");
}
// How fresh each muscle is right now (Today)
function freshOpts(c, day, o = {}) {
  const jr = jointRatios(day), hot = hotJoints(jr);
  const names = l => Object.keys(MUSCLES).filter(m => readiness(c.fatNow[m]) === l).map(m => MUSCLES[m].n.toLowerCase()).join(", ");
  const said = [names("fat") && `Fatigued: ${names("fat")}.`, names("rec") && `Recovering: ${names("rec")}.`, hot.length && `Joints above their usual load: ${hot.map(j => `${JOINT_NAMES[j]} ${jr[j].ratio.toFixed(1)} times`).join(", ")}.`].filter(Boolean).join(" ") || "All muscles fresh.";
  return { cls: m => readiness(c.fatNow[m]), tip: m => `${MUSCLES[m].n}: ${READY_LABEL[readiness(c.fatNow[m])].toLowerCase()}`, hatch: { fat: "bm-hatch" }, jr, said: "Body map. " + said, ...o };
}
function renderBodyMap(c, day) {
  const jr = jointRatios(day), wk = setsPerMuscle(addDays(day, -6), day), sel = S.bodySel;
  let detail = "Tap a muscle or joint for details.";
  if (sel?.startsWith("m:") && MUSCLES[sel.slice(2)]) {
    const m = sel.slice(2), M = MUSCLES[m], v = wk[m];
    detail = `<b>${M.n}</b>: ${READY_LABEL[readiness(c.fatNow[m])].toLowerCase()}. ${v.toFixed(v % 1 ? 1 : 0)} of ${M.lo ? `${M.lo}–${M.hi}` : `up to ${M.hi}`} sets in the last 7 days.`;
  } else if (sel?.startsWith("j:") && jr[sel.slice(2)]) detail = jointDetail(sel.slice(2), jr[sel.slice(2)]);
  const chips = jointChips(jr, sel, true);
  return `<div class="bm">
    ${bodySvg(freshOpts(c, day, { sel, act: true, labels: true }))}
    <div class="legend small"><span><i class="bs fresh"></i>Fresh</span><span><i class="bs rec"></i>Recovering</span><span><i class="bs fat"></i>Fatigued</span></div>
    ${chips ? `<div class="suggest">${chips}</div>` : ""}
    <div class="small muted" aria-live="polite">${detail}</div>
  </div>`;
}
// The week's sets against each muscle's range (Week). Drawn differently from Today's map on purpose: this one is about amount, not freshness.
const WEEK_ST = { ok: "In range", lo: "Below range", hi: "Over the cap", none: "No target" };
function weekState(m, v, dl) {
  const M = MUSCLES[m];
  return v > M.hi * (dl < 1 ? dl * DELOAD_SLACK : 1) ? "hi" : inRange(m, v, dl) || (dl < 1 && v >= .5) ? "ok" : M.lo > 0 && dl >= 1 ? "lo" : "none";
}
function renderWeekMap(end) {
  const from = addDays(end, -6), sp = setsPerMuscle(from, end), dl = deloadScale(from, end), jr = jointRatios(end), sel = S.bodySel;
  const inDl = dl < 1;
  const fmt = v => v.toFixed(v % 1 ? 1 : 0), st = m => weekState(m, sp[m], dl), n = m => MUSCLES[m].n.toLowerCase();
  const range = m => { const M = MUSCLES[m]; return dl < 1 ? `deload target up to ${fmt(M.hi * dl)}` : M.lo ? `${M.lo}–${M.hi}` : `up to ${M.hi}`; };
  const ms = Object.keys(MUSCLES), lo = ms.filter(m => st(m) === "lo"), hi = ms.filter(m => st(m) === "hi"), tgt = ms.filter(m => MUSCLES[m].lo > 0);
  const said = `Sets per muscle against the weekly range. ${lo.length ? `Below range: ${lo.map(n).join(", ")}. ` : ""}${hi.length ? `Over: ${hi.map(n).join(", ")}. ` : ""}${!lo.length && !hi.length ? "Every muscle is in range." : ""}`;
  let detail = "Tap a muscle or joint for its numbers.";
  if (sel?.startsWith("m:") && MUSCLES[sel.slice(2)]) { const m = sel.slice(2); detail = `<b>${MUSCLES[m].n}</b>: ${fmt(sp[m])} sets, ${range(m)}. ${inDl && st(m) === "hi" ? "Heavy for a deload" : WEEK_ST[st(m)]}.`; }
  else if (sel?.startsWith("j:") && jr[sel.slice(2)]) detail = jointDetail(sel.slice(2), jr[sel.slice(2)]);
  const chips = jointChips(jr, sel, true);
  return `<div class="bm wkmap">
    ${bodySvg({ cls: m => "w" + st(m), tip: m => `${MUSCLES[m].n}: ${fmt(sp[m])} sets (${range(m)})`, hatch: { whi: "bm-over", wlo: "bm-dots" }, jr, sel, act: true, labels: true, said })}
    <div class="legend small"><span><i class="bs wok"></i>In range</span><span><i class="bs wlo"></i>Below</span><span><i class="bs whi"></i>${inDl ? "Heavy for a deload" : "Over the cap"}</span></div>
    <div class="wkverdict"><b>${tgt.filter(m => st(m) === "ok").length} of ${tgt.length}</b> muscles in range${inDl ? " for a deload week" : ""}${lo.length ? ` · below: ${lo.map(n).join(", ")}` : ""}${hi.length ? ` · <span class="warnt">${inDl ? "heavy" : "over"}: ${hi.map(n).join(", ")}</span>` : ""}</div>
    ${chips ? `<div class="suggest">${chips}</div>` : ""}
    <div class="small muted" aria-live="polite">${detail}</div>
  </div>`;
}

// Readiness at a glance: the score as a ring, with the day's other numbers beside it
function ringParts(h) {
  const v = Math.max(0, Math.min(100, h.readiness)), lvl = v < 25 ? "bad" : v < 50 ? "warn" : "good", word = v < 25 ? "Poor" : v < 50 ? "Low" : v < 75 ? "OK" : "Good";
  return { v, lvl, word, svg: `<svg class="ring" viewBox="0 0 44 44" role="img" aria-label="Readiness ${v} of 100, ${word.toLowerCase()}"><circle class="rt" cx="22" cy="22" r="18" pathLength="100"/><circle class="rv ${lvl}" cx="22" cy="22" r="18" pathLength="100" stroke-dasharray="${v} 100" transform="rotate(-90 22 22)"/><text x="22" y="26.5" text-anchor="middle">${v}</text></svg>` };
}
function readinessRing(h, hrvLow, lw) {
  const { lvl, word, svg } = ringParts(h);
  const battery = h.bodyBatteryWake ?? h.bodyBatteryHigh;
  return `<div class="rring">
    ${svg}
    <div class="rmarks"><b class="${lvl}">${word}</b>${h.sleepScore != null ? `<span class="${h.sleepScore < 60 ? "warn" : ""}">Sleep <b class="num">${h.sleepScore}</b>${h.sleepHours ? ` · ${h.sleepHours.toFixed(1)}h` : ""}</span>` : ""}${h.hrv != null ? `<span class="${hrvLow ? "warn" : ""}">HRV <b class="num">${h.hrv}</b> ms</span>` : ""}${battery != null ? `<span>Battery <b class="num">${battery}</b></span>` : ""}${lw ? `<span><b class="num">${fmtW(lw.weightLb)}</b>${lw.bodyFatPct ? ` · ${lw.bodyFatPct}% fat` : ""}</span>` : ""}</div>
  </div>`;
}
// Your body in one row: readiness ring, a small map, a word, any joint above its usual load, your note. Tap for the full picture.
function bodyStrip(c, day) {
  const h = healthOn(day), s = S.sessions[day], note = (s?.note || "").trim(), jr = jointRatios(day);
  const count = l => Object.keys(MUSCLES).filter(m => readiness(c.fatNow[m]) === l).length, fat = count("fat"), rec = count("rec");
  const mus = fat ? `${fat} muscle${fat > 1 ? "s" : ""} fatigued${rec ? `, ${rec} recovering` : ""}` : rec ? `${rec} muscle${rec > 1 ? "s" : ""} recovering` : "Muscles fresh";
  const ring = h?.readiness != null ? ringParts(h) : null;
  const issues = adviceCtx(day).issues;
  const chips = `${jointChips(jr, null, false)}${issues.map(i => `<span class="pill ${i.sev >= 3 ? "bad" : i.sev >= 2 ? "warn" : "neutral"}">${esc(issueLabel(i))}</span>`).join("")}`;
  return `<button class="bstrip" data-act="bodysheet" aria-label="Your body: ${ring ? `readiness ${ring.v}, ${ring.word.toLowerCase()}. ` : ""}${mus}. Open details">
    ${ring ? ring.svg : ""}
    <span class="bfig">${bodySvg(freshOpts(c, day, { said: "" }))}</span>
    <span class="bt"><b>${ring ? `<span class="${ring.lvl}">${ring.word}</span> · ` : ""}${mus}</b>
      ${h?.sleepScore != null || h?.hrv != null ? `<span class="small muted num">${[h.sleepScore != null && `Sleep ${h.sleepScore}`, h.hrv != null && `HRV ${h.hrv}`].filter(Boolean).join(" · ")}</span>` : ""}
      ${chips ? `<span class="bchips">${chips}</span>` : ""}
      <span class="small ${note ? "muted bnote" : "blink"}">${note ? `Note: ${esc(note)}` : "+ Note how you feel"}</span></span>
    <span class="chev" aria-hidden="true">›</span>
  </button>`;
}
// The full picture behind the strip: recovery numbers, the body map, what else the coach noticed, and your note
function openBody(focusNote) {
  const day = S.day, c = coach(day), s = S.sessions[day], h = healthOn(day), lw = latestWeight(day);
  const hrvLow = /LOW|UNBALANCED|POOR/i.test(h?.hrvStatus || ""), ring = h?.readiness != null, vit = [];
  if (!ring && h?.sleepScore != null) vit.push(`<span class="pill ${h.sleepScore < 60 ? "warn" : "neutral"}">Sleep ${h.sleepScore}${h.sleepHours ? ` · ${h.sleepHours.toFixed(1)}h` : ""}</span>`);
  if (!ring && h?.hrv != null) vit.push(`<span class="pill ${hrvLow ? "warn" : "neutral"}">HRV ${h.hrv} ms</span>`);
  if (!ring && (h?.bodyBatteryWake != null || h?.bodyBatteryHigh != null)) vit.push(`<span class="pill neutral">Body Battery ${h.bodyBatteryWake ?? h.bodyBatteryHigh}</span>`);
  if (!ring && lw) vit.push(`<span class="pill neutral">${fmtW(lw.weightLb)}${lw.bodyFatPct ? ` · ${lw.bodyFatPct}% fat` : ""}</span>`);
  for (const a of S.cardio.filter(a => a.day === day && (a.re >= CARDIO_MIN_EFFORT || a.z2))) vit.push(`<span class="pill neutral">${esc(a.sport)} ${a.mins}′ · effort ${a.re}${a.z2 ? ` · Zone 2 ${a.z2}′` : ""}</span>`);
  const said = c.msgs.filter(m => m.k === "today" || m.k === "echo").sort((a, b) => MSG_RANK[a.lvl] - MSG_RANK[b.lvl]);
  const todayIssues = s?.issues || [], carried = adviceCtx(day).issues.filter(i => i.day !== day);
  const body = `<div class="bodysheet">
    ${ring ? readinessRing(h, hrvLow, lw) : ""}${vit.length ? `<div class="suggest">${vit.join("")}</div>` : ""}
    ${renderBodyMap(c, day)}
    ${said.length ? `<div class="msgs">${said.map(msgRow).join("")}</div>` : ""}
    <div class="notecard">
      <label class="label" for="daynote">How does your body feel?</label>
      <textarea id="daynote" rows="2" placeholder="e.g. left knee creaking, slept badly, sore quads">${esc(s?.note || "")}</textarea>
      <div class="small muted">Mention aches or how you slept, and the suggestions adjust.</div>
      ${todayIssues.length || carried.length ? `<div class="issues">
        ${todayIssues.map(i => `<span class="pill ${i.sev >= 3 ? "bad" : i.sev >= 2 ? "warn" : "neutral"}">${esc(issueLabel(i))}<button class="chipx" data-act="dismississue" data-k="${esc(i.k)}" aria-label="Not an issue: ${esc(issueLabel(i))}">×</button></span>`).join("")}
        ${carried.map(i => `<span class="pill ${i.sev >= 3 ? "bad" : i.sev >= 2 ? "warn" : "neutral"}">${esc(issueLabel(i))} <span class="muted">(${fmtDay(i.day, { weekday: "short" })})</span><button class="chipx ok" data-act="resolveissue" data-k="${esc(i.k)}" aria-label="Better now: ${esc(issueLabel(i))}">Better ✓</button></span>`).join("")}
      </div>` : ""}
    </div></div>`;
  setLayer("#sheet", sheetHtml(`Your body · ${day === dayKey(new Date()) ? "today" : fmtDay(day)}`, body, `data-live="body"`));
  S.liveSheet = () => { if ($("#sheet [data-live=body]")) openBody(); else S.liveSheet = null; };
  if (focusNote) $("#daynote")?.focus();
}
// One door for everything you might log that isn't a set
function openLog() {
  const row = (act, t, d, extra = "") => `<button class="exrow" data-act="${act}" ${extra}><div class="l"><div>${t}</div><div class="small muted">${d}</div></div><span class="chev" aria-hidden="true">›</span></button>`;
  $("#sheet").innerHTML = sheetHtml("Log", row("cl-open", "Cardio", "A run, row, ride or walk") + row("wt-open", "Weigh-in", "Weight and body fat") + row("tape-open", "Measurements", "Waist, neck, arm, chest, thigh. Every 2 weeks") + row("bodysheet", "Note", "Aches, sleep, how you feel. The plan adjusts.", `data-focus="1"`));
}
// The plan for the day being shown: today's comes from the coach, later days from the look-ahead
function planFor(day, c = coach(day)) {
  const today = dayKey(new Date());
  if (day > today && !S.sessions[day]?.entries?.length) { const f = forecast(today, Math.min(14, daysBetween(today, day))).find(x => x.day === day); if (f) return f.p; }
  return c.plan;
}
// One door for every alternative to the suggestion
function openElse() {
  const day = S.day, c = coach(day), p = planFor(day, c), adapt = p.kind === "lift" ? adaptRoutine(p.routine, day) : null, lift = p.kind === "lift";
  const row = (attrs, t, d, pill = "") => `<button class="exrow" ${attrs}><div class="l"><div>${t}</div><div class="small muted">${d}</div></div>${pill || `<span class="chev" aria-hidden="true">›</span>`}</button>`;
  const rows = [];
  if (adapt?.changes.length) rows.push(row(`data-act="routine" data-raw="1" data-id="${esc(p.routine.id)}"`, `${esc(p.routine.name)} as written`, "Without today's adjustments"));
  if (!p.routine?.auto) rows.push(row(`data-act="routine" data-id="auto"`, "Balanced session", "Built for today: a lower, a push and a pull movement, plus what's short this week"));
  c.routineScores.forEach((x, i) => { if (x.r.id === p.routine?.id) return;
    rows.push(row(`data-act="routine" data-id="${esc(x.r.id)}"`, esc(x.r.name), x.r.items.map(it => esc(exById(it.ex).name)).join(" · "), i === 0 ? `<span class="pill good">Best fit today</span>` : x.score < 0 ? `<span class="pill bad">Muscles tired</span>` : "")); });
  rows.push(row(`data-act="openadd"`, "Build your own", "Add exercises one at a time"));
  if (p.kind !== "cardio") rows.push(row(`data-act="cl-open"`, "Cardio instead", "Log a run, row, ride or walk"));
  $("#sheet").innerHTML = sheetHtml("Something else", (lift ? "" : `<p class="small muted" style="margin:4px 0">The coach suggests ${p.kind === "cardio" ? "cardio" : "rest"} today. Lifting anyway is your call.</p>`) + rows.join(""));
}

// The coach's notes on the week, minus the ones you've said "Got it" to in the last 7 days (kept on this device)
function weekAcks() { try { return JSON.parse(localStorage.getItem("il-week-ack") || "{}"); } catch { return {}; } }
function weekNotes(c, day) {
  const a = weekAcks(), quiet = id => a[id] && daysBetween(a[id], day) >= 0 && daysBetween(a[id], day) < 7;
  return c.msgs.filter(m => m.k === "week" && !quiet(m.id)).sort((x, y) => MSG_RANK[x.lvl] - MSG_RANK[y.lvl]);
}
// Questions get their own card and are asked one at a time
function askCard(asks) {
  if (!asks.length) return "";
  const n = asks.length, i = (S.askI || 0) % n;
  return `<div class="coach ask" aria-label="Coach asks"><div class="head"><span class="label">Coach asks${n > 1 ? ` · ${i + 1} of ${n}` : ""}</span>${n > 1 ? `<button class="linkbtn" data-act="asknext">Next ›</button>` : ""}</div>${msgRow(asks[i])}</div>`;
}

function renderToday() {
  const day = S.day, today = dayKey(new Date());
  const s = S.sessions[day];
  const c = coach(day);
  const rel = day === today ? "Today" : day === addDays(today, -1) ? "Yesterday" : day === addDays(today, 1) ? "Tomorrow" : fmtDay(day, { weekday: "long" });
  const total = (s?.entries || []).reduce((a, e) => a + e.sets.length, 0), done = (s?.entries || []).reduce((a, e) => a + doneSets(e).length, 0);
  const status = !total ? "" : s.finished ? `<span class="pill good">✓ Logged</span>` : `<span class="pill neutral num">${done}/${total} sets</span>`;
  const empty = !s?.entries?.length;
  const weekK = weekDays(day, today), weekP = weekPlans(weekK, today);
  const p = day > today && empty && weekP[day] ? weekP[day] : c.plan;
  const phase = empty ? "plan" : s.finished ? "done" : "workout";

  // What the coach has to say, sorted by what it is: questions, cautions about today, the rest of today's notes. Weekly notes live on Week.
  const asks = c.msgs.filter(m => m.k === "ask");
  const cautions = c.msgs.filter(m => m.k !== "ask" && (m.lvl === "bad" || (m.k === "today" && m.lvl === "warn"))).sort((a, b) => MSG_RANK[a.lvl] - MSG_RANK[b.lvl]);
  const also = c.msgs.filter(m => m.k === "today" && m.lvl !== "bad" && m.lvl !== "warn");
  const KIND = { lift: ["Lift", "good"], cardio: ["Cardio", "neutral"], rest: ["Rest", "warn"], done: ["Done", "good"] };
  const ahead = day === today ? forecast(day, phase === "done" ? 1 : 4) : [];
  const aheadRow = ({ day: k, p: q }) => `<div class="ad"><b>${fmtDay(k, { weekday: "short" })}</b><span class="pill ${KIND[q.kind][1]}">${KIND[q.kind][0]}</span><span>${esc(q.kind === "lift" ? q.routine.name + (q.addon ? ` + ${q.addon.mins}′ easy cardio` : "") : q.kind === "cardio" ? `${q.title} · ${q.mins || 30}′` : q.title)}</span></div>`;

  let weekLine = "";
  if (day === today && phase !== "workout") {
    const R = weekReview(today), n = weekNotes(c, today).length;
    weekLine = `<button class="weekline" data-act="tab" data-v="week"><span>Lifts <b class="num">${R.lifts}/${R.liftsT}</b> · Cardio <b class="num">${R.mins}/${R.minsT}</b> min${n ? ` · <b>${n} note${n > 1 ? "s" : ""}</b>` : ""}</span><span class="chev" aria-hidden="true">›</span></button>`;
  }
  const head = `
    <div class="daynav">
      <div class="d"><div class="big">${rel}</div><div class="small muted">${fmtDay(day, { weekday: "short", month: "long", day: "numeric", year: "numeric" })}${status ? ` · ${status}` : ""}</div></div>
      ${day !== today ? `<button class="chipbtn primary" data-act="gotoday">Today</button>` : ""}
      <button class="chipbtn" data-act="logsheet">+ Log</button>
    </div>
    ${renderWeekStrip(day, today, weekK, weekP)}${weekLine}`;
  const actx = adviceCtx(day);
  const entries = (s?.entries || []).map((e, i) => renderEntry(e, i, day, s.entries, actx, phase === "workout")).join("");
  const hasRoutines = Object.keys(S.routines).length;
  const addonRow = p.addon ? `<button class="pxrow addon" data-act="cl-open"><span class="nm">${p.addon.done ? "✓" : "∿"} ${esc(p.addon.text)}</span><span class="small muted">${p.addon.done ? "done" : "Log it ›"}</span></button>` : "";

  if (phase === "plan") {
    const adapt = p.kind === "lift" ? adaptRoutine(p.routine, day) : null;
    const lessOne = !adapt?.deload && trimReason(day);   // Start loads one set fewer on a lighter day
    const planEx = adapt ? applyPre(adapt.items, day).map(it => { const n = exById(it.ex).name, sets = lessOne ? Math.max(1, it.sets - 1) : it.sets;
      return `<div class="pxrow"><span class="nm">${esc(n)}${it.from ? ` <span class="small muted">· swapped</span>` : ""}</span><span class="small muted num">${sets}×${it.r}${it.rHi && it.rHi !== it.r ? "–" + it.rHi : ""}${exById(it.ex).kind === "time" ? "s" : ""}</span>
        <button class="linkbtn" data-act="swapsheet" data-pre="${esc(it.ex)}" data-orig="${esc(it.from || it.ex)}" data-rid="${esc(p.routine.id)}" aria-label="Swap ${esc(n)}">⇄</button></div>`; }).join("") : "";
    const main = adapt ? `<button class="btn primary big" data-act="routine" data-id="${esc(p.routine.id)}">▶ Start${adapt.changes.length ? " (adjusted)" : p.trim ? " (lighter)" : ""}</button>`
      : p.kind === "cardio" ? `<button class="btn primary big" data-act="cl-open">+ Log cardio</button>` : "";
    // One line of reason on the card; the full list, today's adjustments and the coach's other notes for today sit behind "Why?"
    const why1 = p.why[1] || p.why[0] || "", reason = why1 ? why1[0].toUpperCase() + why1.slice(1) : "How the coach chose this";
    const more = `<div class="plan-more">
      ${adapt?.changes.length ? `<div class="adapt"><div class="label">Adjusted for today</div><ul>${adapt.changes.map(x => `<li>${x}</li>`).join("")}</ul></div>` : ""}
      <ul class="why">${p.why.map(w => `<li>${w}</li>`).join("")}</ul>
      ${also.length ? `<div class="msgs">${also.map(msgRow).join("")}</div>` : ""}</div>`;
    return `${head}${p.kind === "lift" ? tip("plan") || tip("swap") : ""}
    ${bodyStrip(c, day)}
    <div class="coach" aria-label="Plan">
      ${cautions.length ? `<div class="msgs">${cautions.map(msgRow).join("")}</div>` : ""}
      <div class="today-plan">
        ${p.kind === "done" ? `<div class="label">✓ Done</div>` : `<div class="label">${day === today ? "Suggested today" : "Suggested for this day"} <span class="pill ${KIND[p.kind][1]}">${KIND[p.kind][0]}</span>${deloadOn(day) ? ` <span class="pill neutral">Deload</span>` : ""}</div>`}
        <div class="pt">${esc(p.cardio ? p.cardio.name : p.title)}</div>
        ${p.cardio ? `<div class="small num">${p.cardio.mins}′${p.cardio.re ? ` · effort ${p.cardio.re}` : ""}${p.cardio.z2 ? ` · Zone 2 ${p.cardio.z2}′` : ""}${isZ2Walk(p.cardio) ? " · counts as a Zone 2 session" : ""}</div>` : p.note ? `<div class="small">${esc(p.note)}</div>` : ""}
        ${fold("plan-fold", `<span class="reason">${reason}.</span> <span class="whyl">Why?</span>`, more, "whyfold")}
        ${planEx || addonRow ? `<div class="planex">${planEx}${addonRow}</div>` : ""}
        <div class="suggest startrow">${main}${p.kind !== "done" ? `<button class="btn big" data-act="elsesheet">Something else</button>` : `<button class="btn" data-act="openadd">+ Add exercise</button>`}</div>
      </div>
      ${fuelLine(day, p)}
    </div>
    ${askCard(asks) ? tip("coach") + askCard(asks) : ""}`;
  }

  const ts = (s.entries || []).flatMap(e => doneSets(e).map(x => x.t)).filter(Boolean).sort((a, b) => a - b);
  if (phase === "workout") {
    // While training, only a serious caution interrupts. Open exercises stay open until they're finished or you close them.
    const urgent = c.msgs.filter(m => m.k !== "ask" && m.lvl === "bad");
    const allDone = done === total, mins = day === today && ts.length ? Math.round((Date.now() - ts[0]) / 6e4) : 0;
    return `${head}
    ${urgent.length ? `<div class="coach mini" aria-label="Coach"><div class="msgs">${urgent.map(msgRow).join("")}</div></div>` : ""}
    ${tip("tick")}
    <div class="entries">${entries}</div>
    ${addonRow ? `<div class="planex solo">${addonRow}</div>` : ""}
    <div class="linkrow"><button class="linkbtn" data-act="bodysheet">Body and notes ›</button>${hasRoutines ? `<button class="linkbtn" data-act="openroutines">Add a routine</button>` : ""}</div>
    <div class="pin"><span class="pn num"><b>${done}</b> of ${total} sets${mins >= 1 && mins < 300 ? ` · ${mins} min` : ""}</span>
      <button class="btn ${allDone ? "" : "primary"}" data-act="openadd">+ Exercise</button>
      <button class="btn ${allDone ? "primary" : ""}" data-act="finish">Finish</button></div>`;
  }

  // Done: what got logged, any new bests, what's next
  const mins = ts.length > 1 ? Math.round((ts[ts.length - 1] - ts[0]) / 6e4) : 0;
  const exN = s.entries.filter(e => doneSets(e).length).length;
  const bests = c.msgs.filter(m => m.k === "win");
  return `${head}
    <div class="coach summary">
      <div class="label">Workout logged</div>
      <div class="pt">${done} set${done === 1 ? "" : "s"} · ${exN} exercise${exN === 1 ? "" : "s"}${mins >= 5 ? ` · ${mins} min` : ""}</div>
      ${bests.length ? `<div class="msgs">${bests.map(msgRow).join("")}</div>` : ""}
      ${cautions.some(m => m.lvl === "bad") ? `<div class="msgs">${cautions.filter(m => m.lvl === "bad").map(msgRow).join("")}</div>` : ""}
      ${addonRow ? `<div class="planex solo">${addonRow}</div>` : ""}
      ${fuelLine(day, p)}
      ${ahead.length ? `<div class="ahead"><span class="label">Next up · tentative</span>${ahead.map(aheadRow).join("")}</div>` : ""}
    </div>
    ${bodyStrip(c, day)}
    ${askCard(asks)}
    ${fold("done-sets", `See the sets`, `<div class="entries" style="margin-top:10px">${entries}</div>`)}
    <div class="actions"><button class="btn ghost" data-act="finish">Reopen workout</button></div>`;
}

// Today's food targets: total kcal and protein up front; timing and ideas folded
function fuelLine(day, p) {
  const F = fuel(day), lift = p.kind === "lift" || liftedOn(day);
  const doneMins = cardioMinutes(day, day), planMins = p.kind === "cardio" ? p.mins || 30 : p.addon?.mins || 0;
  const mins = Math.max(doneMins, planMins), extra = mins >= 20 ? round50(mins * F.bw * .055) : 0;   // Zone 2 burns ~0.055 kcal per lb per minute
  const tip = lift ? "Carbs and some protein 1–2 h before lifting; a protein-heavy meal within a few hours after."
    : extra ? "Carbs before or after cardio keep it from eating into the surplus."
    : "Eat the same as a training day. Muscle gets built on rest days.";
  const i = daysBetween("2026-01-01", day), a = PROTEIN_IDEAS[(i * 3) % PROTEIN_IDEAS.length], b = PROTEIN_IDEAS[(i * 3 + 5) % PROTEIN_IDEAS.length];
  const idea = lift ? `${POST_LIFT[i % POST_LIFT.length]}, or ${a}` : `${a}, or ${b}`;
  return `<div class="fuel small"><div class="fuelrow"><svg viewBox="0 0 24 24" role="img" aria-label="Fuel"><path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-2 1-3.500 2-4.500 0 2 1 3 2 3 1-3-.5-6 2-9.500z"/></svg><span><b class="num">~${(F.kcal + extra).toLocaleString()}</b> kcal · <b class="num">${F.prot} g</b> protein</span></div>
    ${fold("fuel-fold", "Timing and protein ideas", `<div class="small" style="margin-top:4px">${extra ? `Includes ~${extra} kcal for ${mins}′ cardio. ` : ""}About 30–40 g protein at each of 4 meals. ${tip}</div><div class="small muted"><b>Protein idea:</b> ${idea}.</div>`)}</div>`;
}

// Column labels are only needed for the first few workouts
function knowsColumns() { return Object.values(S.sessions).filter(x => x.entries?.some(e => doneSets(e).length)).length >= 3; }
/* A workout shows each exercise as one line. The ones you're working on are open, and stay open until every set is ticked
   or you close them, so two or three can be on the go at once. Inside an open exercise one set is being edited; the rest are a tap away. */
const entryKey = (e, i) => e.id || "i" + i;
function entryOpen(e, i, entries, auto = true) {
  const st = S.exOpen[entryKey(e, i)]; if (st != null) return st;
  if (!auto) return false;
  const n = doneSets(e).length;
  if (n) return n < e.sets.length;   // started and not finished
  // Nothing on the go: the next exercise you haven't started opens by itself
  return !entries.some(x => { const d = doneSets(x).length; return d && d < x.sets.length; }) && entries.findIndex(x => !doneSets(x).length) === i;
}
function renderEntry(e, i, day, entries, actx, auto) {
  const ex = exById(e.ex), key = entryKey(e, i);
  const unitLbl = ex.kind === "time" ? "sec" : "reps";
  const nDone = doneSets(e).length, started = nDone > 0, allDone = e.sets.length && nDone === e.sets.length;
  const adv = started ? { lvl: 0 } : exerciseAdvice(e.ex, day, actx);
  const doneTxt = s => ex.kind === "time" ? `${s.r}s${s.w ? ` · +${fmtW(s.w)}` : ""}`
    : `${ex.kind === "bodyweight" ? (s.w ? `BW + ${fmtW(s.w)}` : "Bodyweight") : fmtW(s.w || 0)} × ${s.r}`;
  // "30 lb × 8, 8, 7" when the weight held; otherwise each set
  const setsTxt = sets => ex.kind !== "time" && sets.length && sets.every(x => (x.w || 0) === (sets[0].w || 0))
    ? `${doneTxt(sets[0]).replace(/ × \d+$/, "")} × ${sets.map(x => x.r).join(", ")}` : sets.map(doneTxt).join(" · ");
  const effortBtns = `<div class="effort" role="group" aria-label="How did it feel">${Object.entries(EFFORT).map(([k, v]) => `<button data-act="effort" data-i="${i}" data-v="${k}" aria-pressed="${e.effort === k}">${v.label}</button>`).join("")}</div>`;
  const range = e.rHi ? `${e.rLo}–${e.rHi}` : `${e.sets[0]?.r ?? ""}`;

  if (!entryOpen(e, i, entries, auto)) {
    const dots = `<span class="dots" aria-hidden="true">${e.sets.map(s => s.done ? "●" : "○").join("")}</span>`;
    return `
    <div class="entry line ${allDone ? "complete" : ""}">
      <button class="eline" data-act="exopen" data-i="${i}" aria-expanded="false">
        <span class="nm">${allDone ? `<span class="tick" aria-hidden="true">✓</span> ` : ""}${esc(ex.name)}${allDone && e.effort ? ` <span class="small muted">· ${EFFORT[e.effort].label}</span>` : ""}${adv.lvl ? ` <span class="pill ${adv.lvl >= 2 ? "bad" : "warn"}">${adv.lvl >= 2 ? "Not now" : "Careful"}</span>` : ""}</span>
        <span class="small muted num">${allDone ? setsTxt(doneSets(e)) : `${started ? `${nDone} of ${e.sets.length}` : `${e.sets.length}×${range}${ex.kind === "time" ? "s" : ""}`} ${dots}`}</span>
      </button>
      ${allDone && !e.effort ? `<div class="foot"><span class="small muted">How did it feel?</span>${effortBtns}</div>` : ""}
    </div>`;
  }

  const prog = progression(e.ex, day);
  const hold = S.sessions[day]?.trim && prog?.bump > 0;   // lighter day: don't push the weight up
  const prim = Object.entries(ex.muscles).filter(([, w]) => w >= .75).map(([m]) => MUSCLES[m]?.n).filter(Boolean).join(" · ");
  const lastSets = prog?.last ? doneSets(prog.last.e) : [], lastTxt = setsTxt(lastSets);
  const same = lastSets.length === e.sets.length && lastSets.every((x, k) => (x.w || 0) === (e.sets[k].w || 0) && x.r === e.sets[k].r);
  // Deload week: last full session → today's lighter version
  let dp = deloadDay(day) && prog?.last ? deloadPlan(e.ex, day) : null;
  if (dp && e.dl) dp = { ...dp, ...e.dl };
  const dlSame = dp && e.sets.length === dp.n && e.sets.every(s => (s.w || 0) === dp.w && s.r === dp.r);
  // One target line before the first set: what happened last time, what today asks for, and one tap to take the other option
  let target = "", tcls = "info";
  if (!started) {
    const again = lastSets.length && !same ? ` <button class="linkbtn" data-act="repeat" data-i="${i}">Same again</button>` : "";
    if (dp) target = `${srcBtn("deload")} <b>Last full:</b> <span class="num">${lastTxt}</span> → <b>Deload:</b> <span class="num">${doneTxt(dp)}, ${dp.n} set${dp.n > 1 ? "s" : ""}</span>.
      ${ex.kind === "weight" && dp.w >= dp.top ? "Same weight (the step is too big to drop). " : ""}${ex.kind === "time" ? "Stop well before it gets hard." : "Stop with 3–4 reps left."}${dlSame ? "" : ` <button class="linkbtn" data-act="dlapply" data-i="${i}">Use deload</button>`}`;
    else if (!prog) target = ex.kind === "weight" && !e.sets.some(s => s.w) ? "First time: pick a weight you could lift 2–3 more reps than the target with good form. Go lighter if unsure; the coach takes it from there." : "";
    else if (hold) target = `Last <span class="num">${lastTxt}</span>. Hold the weight today: ${esc(S.sessions[day].trim)}.${again}`;
    else if (prog.bump > 0) { const top = Math.max(...prog.last.e.sets.map(s => s.w || 0)), applied = e.sets.some(s => !s.done && (s.w || 0) >= top + prog.bump);
      target = `${prog.text}${applied ? "" : ` <button class="chipbtn upchip" data-act="bump" data-i="${i}" data-n="${prog.bump}" aria-label="Add ${fmtW(prog.bump)} to the remaining sets">↑ ${fmtW(prog.bump)}</button>`}`; }
    else if (prog.bump < 0) { tcls = "warn"; target = `${prog.text} <button class="linkbtn" data-act="bump" data-i="${i}" data-n="${prog.bump}">Apply</button>`; }
    else target = `${prog.text}${again}`;
  }
  // Bar loading: plates per side for the set being edited, or the nearest weights the plates can make
  const kit = plateKit(e.ex);
  const plateLine = (st, j) => {
    if (!kit || !(st.w > 0)) return "";
    const P = platesFor(st.w, kit);
    if (P.exact) return `<div class="plates small" aria-label="Plates per side: ${plateTxt(P.side)}">${P.side.length ? `<span class="pbar" aria-hidden="true">${P.side.map(p => `<i style="height:${Math.round(10 + 18 * Math.sqrt(Math.min(1, p.lb / 45)))}px"></i>`).join("")}</span>` : ""}<span class="muted">${kit.two ? "Each dumbbell, per side" : "Per side"}</span> <b class="num">${plateTxt(P.side)}</b></div>`;
    const opts = [P.below, P.above].filter(x => x != null);
    return `<div class="plates small warn"><span>Your plates can't make ${fmtW(st.w)}.</span>${opts.map(w => ` <button class="chipbtn" data-act="wset" data-i="${i}" data-j="${j}" data-w="${w}">${fmtW(w)}</button>`).join("")}</div>`;
  };
  // Warm-up ramp before the first working set; tap a step to cross it off (not logged as a set)
  const wus = started ? [] : warmups(e.ex, e.sets[0]?.w || 0);
  const wuRow = wus.length ? `<div class="wu"><span class="label">Warm-up</span>${wus.map((x, k) => `<button class="wuchip ${(e.wu || []).includes(k) ? "done" : ""}" data-act="wu" data-i="${i}" data-k="${k}" aria-pressed="${(e.wu || []).includes(k)}"><b class="num">${x.bar ? (kit?.tool === "dumbbells" ? "Handle" : "Bar") : fmtW(x.w)} × ${x.r}</b>${x.side && !x.bar ? `<span class="num">${plateTxt(x.side)}</span>` : ""}</button>`).join("")}</div>` : "";
  const first = e.sets.findIndex(s => !s.done);
  const ed = S.setEdit?.k === key && e.sets[S.setEdit.j] && !e.sets[S.setEdit.j].done ? S.setEdit.j : first;
  const rows = e.sets.map((s, j) => s.done ? `
    <div class="setrow done">
      <span class="idx">${j + 1}</span>
      <span class="donetxt num">${doneTxt(s)}</span>
      <button class="check" data-act="done" data-i="${i}" data-j="${j}" aria-pressed="true" aria-label="Set ${j + 1} done. Tap to edit">✓</button>
    </div>` : j !== ed ? `
    <div class="setrow later">
      <span class="idx">${j + 1}</span>
      <button class="setline num" data-act="setedit" data-i="${i}" data-j="${j}" aria-label="Set ${j + 1}: ${doneTxt(s)}. Tap to change">${doneTxt(s)}</button>
      <button class="check" data-act="done" data-i="${i}" data-j="${j}" aria-pressed="false" aria-label="Set ${j + 1} done">✓</button>
    </div>` : `
    <div class="setrow">
      <span class="idx">${j + 1}</span>
      ${ex.kind === "time" ? `<span class="small muted">${s.w ? "" : "bodyweight"}</span>` : `
      <div class="stepper"><button data-act="w-" data-i="${i}" data-j="${j}" aria-label="Less weight">−</button>
        <input id="w-${i}-${j}" inputmode="decimal" data-act="w" data-i="${i}" data-j="${j}" value="${s.w ? toDisp(s.w) : ""}" placeholder="${ex.kind === "bodyweight" ? "BW" : "0"}" aria-label="Weight, set ${j + 1}">
        <span class="u">${s.w || ex.kind === "weight" ? unit() : "+"}</span><button data-act="w+" data-i="${i}" data-j="${j}" aria-label="More weight">+</button></div>`}
      <div class="stepper"><button data-act="r-" data-i="${i}" data-j="${j}" aria-label="Fewer ${unitLbl}">−</button>
        <input id="r-${i}-${j}" inputmode="numeric" data-act="r" data-i="${i}" data-j="${j}" value="${s.r}" aria-label="${unitLbl}, set ${j + 1}">
        <span class="u">${ex.kind === "time" ? "s" : "×"}</span><button data-act="r+" data-i="${i}" data-j="${j}" aria-label="More ${unitLbl}">+</button></div>
      <button class="check" data-act="done" data-i="${i}" data-j="${j}" aria-pressed="false" aria-label="Set ${j + 1} done">✓</button>
    </div>${plateLine(s, j)}`).join("");
  const menu = S.exMenu === key;
  return `
    <div class="entry open ${allDone ? "complete" : ""}">
      <div class="eh"><button class="exname" data-act="exopen" data-i="${i}" aria-expanded="true"><span class="nm">${esc(ex.name)}</span><span class="sub">${prim}${e.rHi ? ` · ${e.rLo}–${e.rHi}${ex.kind === "time" ? "s" : " reps"}` : ""}</span></button>
        <div class="rowbtns">${helpBtn(e.ex, ex.name)}<button class="iconbtn sm" data-act="exmenu" data-i="${i}" aria-expanded="${menu}" aria-label="More for ${esc(ex.name)}">⋯</button></div></div>
      ${menu ? `<div class="exmenu"><button class="linkbtn" data-act="addset" data-i="${i}">+ Set</button>${e.sets.length > 1 ? `<button class="linkbtn" data-act="rmset" data-i="${i}">− Set</button>` : ""}${started ? "" : `<button class="linkbtn" data-act="swapsheet" data-i="${i}">⇄ Swap</button>`}<button class="linkbtn danger" data-act="rm" data-i="${i}">Remove</button></div>` : ""}
      ${adv.lvl ? `<div class="hint ${adv.lvl >= 2 ? "bad" : "warn"}"><b>${adv.lvl >= 2 ? "Not the best right now" : "Careful"}:</b> ${esc(adv.reasons.join("; "))}.${adv.alts.length ? `<div class="swaps">Swap for: ${adv.alts.map(a => `<button class="chipbtn" data-act="swap" data-i="${i}" data-id="${esc(a.id)}">${esc(a.name)}</button>`).join("")}</div>` : ""}</div>` : ""}
      ${target ? `<div class="hint ${tcls} target">${target}</div>` : ""}
      ${wuRow}
      ${allDone || knowsColumns() ? "" : `<div class="setrow small muted" aria-hidden="true"><span></span><span class="label">${ex.kind === "time" ? "" : ex.kind === "bodyweight" ? "Added load" : "Weight"}</span><span class="label">${ex.kind === "time" ? "Seconds" : "Reps"}</span><span></span></div>`}
      ${rows}
      ${allDone || e.effort ? `<div class="foot"><span class="small muted">How did it feel?</span>${effortBtns}</div>` : ""}
    </div>`;
}

/* ---------- Week ---------- */
// The rolling 7 days the coach plans on, in one place: targets, the days, muscles and joints, and the coach's notes.
// Paging back shows earlier weeks in the same layout, which is also the session history.
function weekTargetRows() {
  const wk = { ...WEEK_DEFAULT, ...(S.settings.week || {}) };
  const stepper = (key, v, lo, hi, step = 1) => `<span class="stepper" style="display:inline-flex;width:auto"><button data-act="wk" data-k="${key}" data-d="${-step}" aria-label="Fewer" ${v <= lo ? "disabled" : ""}>−</button><span class="num" style="min-width:28px;text-align:center">${v}</span><button data-act="wk" data-k="${key}" data-d="${step}" aria-label="More" ${v >= hi ? "disabled" : ""}>+</button></span>`;
  return `<div class="list">
    <div class="row"><div class="l"><b>Lifting sessions a week</b></div>${stepper("lifts", wk.lifts, 2, 5)}</div>
    <div class="row"><div class="l"><b>Easy cardio sessions</b><div class="small muted">15+ min; a walk counts with 15+ min in Zone 2</div></div>${stepper("cardio", wk.cardio, 0, 6)}</div>
    <div class="row"><div class="l"><b>Cardio minutes a week</b><div class="small muted">Walks add their time in Zone 2 (stretches of ${Z2_BOUT}+ min)</div></div>${stepper("cardioMin", wk.cardioMin, 30, 300, 10)}</div>
    <div class="row"><div class="l"><b>Cardio you do</b><div class="suggest" style="margin-top:6px">${Object.entries(CARDIO_TYPES).filter(([k]) => k !== "Walk").map(([k, n]) => `<button class="chipbtn ${cardioTypes().includes(k) ? "primary" : ""}" data-act="cardiotype" data-v="${k}" aria-pressed="${cardioTypes().includes(k)}">${n}</button>`).join("")}</div></div></div>
  </div>`;
}
function renderWeek() {
  const today = dayKey(new Date()), off = S.weekOff || 0, end = addDays(today, -7 * off), from = addDays(end, -6), cur = !off;
  const wk = { ...WEEK_DEFAULT, ...(S.settings.week || {}) }, R = weekReview(end), start = firstDay();
  const md = k => fmtDay(k, { month: "short", day: "numeric" });
  const head = `<div class="daynav">
      <div class="d"><div class="big">${cur ? "Week" : `Week to ${md(end)}`}</div><div class="small muted">${cur ? "Last 7 days and what's next" : `${md(from)} – ${md(end)}`}${R.deload ? ` · <span class="pill neutral">Deload</span>` : ""}</div></div>
      <button class="chipbtn" data-act="weekpage" data-d="1" ${start && start < from ? "" : "disabled"}>‹ Earlier</button>
      ${off ? `<button class="chipbtn" data-act="weekpage" data-d="-1">Later ›</button>` : ""}
    </div>`;
  const meters = `<div class="wmeters">${[["Lifts", R.lifts, wk.lifts], ["Cardio", cardioOn(from, end).length, wk.cardio], ["Minutes", R.mins, wk.cardioMin]].map(([n, v, g]) => `
      <div class="wm"><div class="label">${n}</div><div class="num"><b>${v}</b> / ${g}</div><div class="wbar"><i style="width:${Math.min(100, g ? v / g * 100 : 0)}%"></i></div></div>`).join("")}</div>
    ${!cur ? "" : S.weekEdit ? `${weekTargetRows()}<div><button class="btn primary" data-act="weekedit">Done</button></div>` : `<div><button class="linkbtn" data-act="weekedit">Change targets</button></div>`}`;

  // The days: what you did, and for the days ahead what the coach expects. Tap one to open it.
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i)), aheadDays = cur ? [1, 2, 3].map(n => addDays(today, n)) : [];
  const plans = cur ? weekPlans([...days, ...aheadDays], today) : {};
  const dayRow = k => {
    const s = S.sessions[k], lifted = liftedOn(k), cs = cardioOn(k, k), p = k >= today ? plans[k] : null, marks = dayMarks(k, today, plans), bits = [];
    if (lifted) bits.push(`${esc(routineOf(k)?.name || "Lift")} <span class="muted num">· ${(n => `${n} set${n === 1 ? "" : "s"}`)(s.entries.reduce((a, e) => a + doneSets(e).length, 0))}</span>${s.deload ? ` <span class="pill neutral">deload</span>` : ""}`);
    for (const a of cs) bits.push(`${esc(a.name || a.sport)} <span class="muted num">· ${a.mins}′</span>`);
    const planned = !lifted && p?.kind === "lift" ? esc(p.routine.name) + (p.addon && !cs.length ? ` + ${p.addon.mins}′ easy cardio` : "") : !cs.length && p?.kind === "cardio" ? `${esc(p.title)} · ${p.mins || 30}′` : !bits.length && p ? esc(p.title) : "";
    if (planned) bits.push(`<span class="muted">${planned}</span>`);
    const tag = k === today ? `<span class="pill ${planned ? "neutral" : "good"}">Today</span>` : planned ? `<span class="small muted">planned</span>` : bits.length ? `<span class="tick" aria-label="done">✓</span>` : "";
    return `<button class="dayrow ${k === today ? "now" : ""} ${k > today ? "ahead" : ""}" data-act="goto" data-day="${k}">
      <span class="dd"><b>${fmtDay(k, { weekday: "short" })}</b> <span class="num">${parseDay(k).getDate()}</span></span>
      <span class="wdi n${marks.length}">${marks.map(m => `<svg class="${m.k} ${m.done ? "done" : "plan"}" viewBox="0 0 24 24" aria-hidden="true">${WEEK_ICON[m.k]}</svg>`).join("")}</span>
      <span class="dt">${bits.join("<br>") || `<span class="muted">${k < today ? "Rest" : "Nothing yet"}</span>`}</span>${tag}</button>`;
  };
  const list = `<div class="daylist">${days.map(dayRow).join("")}${aheadDays.length ? `<div class="label daysep">Coming up · tentative</div>${aheadDays.map(dayRow).join("")}` : ""}</div>`;

  // The coach on this week: its notes beside the numbers that prove them, each one quietable for the week
  const names = l => l.map(m => MUSCLES[m].n.toLowerCase()).join(", ");
  const bests = Object.entries(R.bests).map(([id, sc]) => { const ex = exById(id); return `${esc(ex.name)} ${ex.kind === "weight" ? `${fmtW(sc)}${PER_HAND.has(id) ? " each" : ""}` : `${sc}${ex.kind === "time" ? "s" : " reps"}`}`; });
  const rebound = R.rebound ? `<div class="small"><b>After the deload:</b> ${R.rebound.back.length ? `back above your pre-deload best on ${R.rebound.back.map(id => esc(exById(id).name.toLowerCase())).join(", ")}` : ""}${R.rebound.back.length && R.rebound.notYet.length ? "; " : ""}${R.rebound.notYet.length ? `not yet on ${R.rebound.notYet.map(id => esc(exById(id).name.toLowerCase())).join(", ")}` : ""}.</div>` : "";
  let coachHtml;
  if (cur) {
    const c = coach(today), notes = weekNotes(c, today), quiet = c.msgs.filter(m => m.k === "week").length - notes.length, sugg = c.gaps.length && c.exSuggest.length;
    coachHtml = `<section class="block">
      <h2>Coach on your week</h2>
      ${notes.length ? `<div class="wnotes">${notes.map(m => `<div class="wnote">${msgRow(m)}<button class="linkbtn" data-act="weekack" data-id="${esc(m.id)}">Got it</button></div>`).join("")}</div>` : `<p class="small muted" style="margin:0">Nothing to flag${quiet ? ` (${quiet} note${quiet > 1 ? "s" : ""} quieted for the week)` : ""}.</p>`}
      ${sugg ? `<div class="small">Fresh and short of this week's target: ${c.gaps.map(g => `<b>${MUSCLES[g.m].n.toLowerCase()}</b>`).join(", ")}.<div class="suggest" style="margin-top:6px">${c.exSuggest.map(e => `<button class="chipbtn" data-act="add" data-id="${esc(e.id)}">+ ${esc(e.name)}</button>`).join("")}</div></div>` : ""}
      ${bests.length ? `<div class="small"><b>New bests:</b> ${bests.join(", ")}</div>` : ""}${rebound}
      <div class="small"><b>Next:</b> ${esc(R.focus)}</div>
    </section>`;
  } else coachHtml = bests.length || R.below.length || R.over.length || rebound ? `<section class="block">
      <h2>How it went</h2>
      ${bests.length ? `<div class="small"><b>New bests:</b> ${bests.join(", ")}</div>` : ""}
      ${R.below.length ? `<div class="small"><b>Below range:</b> ${names(R.below)}</div>` : ""}
      ${R.over.length ? `<div class="small"><b>${R.deload ? "Heavy for a deload" : "Over the cap"}:</b> ${names(R.over)}</div>` : ""}${rebound}
    </section>` : "";
  return `${head}
    <section class="block wktop">${meters}${list}</section>
    <section class="block">
      <h2>Muscles and joints ${srcBtn("volume")}</h2>
      ${renderWeekMap(end)}
      ${fold("week-all", "Every muscle and joint, as bars", `<div class="foldbody">${renderMuscleBars(end)}${renderJointBars(end)}</div>`)}
    </section>
    ${coachHtml}`;
}

/* ---------- Progress ---------- */
// Only about months: an overview with one card each for Strength, Body and Volume, and a page behind each card
try { if (localStorage.getItem("il-lv-view") === "movement") S.lvView = "movement"; } catch {}
const pageHead = (act, label) => `<div class="daynav"><button class="backlink" data-act="${act}">‹ ${label}</button></div>`;
// Tiny trend drawings for the cards: a line, or bars with the last one filled
function spark(vals) {
  if (vals.length < 2) return "";
  const W = 96, H = 28, lo = Math.min(...vals), hi = Math.max(...vals), X = i => 3 + i / (vals.length - 1) * (W - 6), Y = v => H - 4 - (hi > lo ? (v - lo) / (hi - lo) : .5) * (H - 8);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${vals.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join("")}"/><circle cx="${X(vals.length - 1).toFixed(1)}" cy="${Y(vals[vals.length - 1]).toFixed(1)}" r="2.6"/></svg>`;
}
function sparkBars(vals) {
  const W = 96, H = 28, hi = Math.max(1, ...vals), bw = W / vals.length;
  return `<svg class="spark bars" viewBox="0 0 ${W} ${H}" aria-hidden="true">${vals.map((v, i) => { const h = Math.max(1, v / hi * (H - 2)); return `<rect class="${i === vals.length - 1 ? "now" : ""}" x="${(i * bw + 1).toFixed(1)}" y="${(H - h).toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${h.toFixed(1)}" rx="1.5"/>`; }).join("")}</svg>`;
}
// One lift's headline: the latest full session against four weeks ago (or the first session while there's less history).
// Deloads are light on purpose and say nothing about strength, so they're left out.
function liftTrend(id, today) {
  const ex = exById(id), h = historyFor(id), hf = historyFor(id, undefined, true), hl = hf.length ? hf : h;
  if (!hl.length) return null;
  const last = hl[hl.length - 1], fourAgo = hl.filter(r => r.day <= addDays(today, -28)).pop(), ref = fourAgo || (hl.length > 1 ? hl[0] : null);
  const pct = ref?.score ? Math.round((last.score / ref.score - 1) * 100) : null;
  const fmt = v => ex.kind === "weight" ? toDisp(v) : Math.round(v);
  const unitTxt = ex.kind === "weight" ? unit() + (PER_HAND.has(ex.id) ? " each" : "") : ex.kind === "time" ? "s" : "reps";
  const trend = pct == null ? null : { arrow: pct > 0 ? "↑" : pct < 0 ? "↓" : "→", pct: Math.abs(pct), cls: pct > 0 ? "up" : pct < 0 ? "down" : "", since: fourAgo ? "in 4 wk" : `since ${fmtDay(ref.day)}` };
  return { ex, h, hf, hl, last, pct, trend, fmt, unitTxt };
}
function trendHtml(t) { return t ? `<span class="trend ${t.cls}"><b>${t.arrow} ${t.pct}%</b> <span class="small muted">${t.since}</span></span>` : ""; }
// Weekly working sets, last 10 weeks (weeks end today). A week that's partly or wholly a deload gets a target.
function weeklyLoad(today) {
  const weeks = [];
  for (let i = 9; i >= 0; i--) { const end = addDays(today, -7 * i), from = addDays(end, -6), sc = deloadScale(from, end);
    weeks.push({ end, v: totalSets(from, end), target: sc < 1 ? usualAvg(end, totalSets) * sc : null }); }
  const acute = weeks[9].v, chronic = usualAvg(today, totalSets, 0), dlT = weeks[9].target, ratio = chronic ? acute / chronic : 0;
  const cls = dlT != null ? (acute > dlT * DELOAD_SLACK ? "warn" : "good") : !chronic ? "neutral" : ratio > 1.5 ? "bad" : ratio > 1.3 || ratio < .6 ? "warn" : "good";
  const txt = dlT != null ? (acute > dlT * DELOAD_SLACK ? "Heavy for a deload" : "Deload on target") : !chronic ? "Not enough history" : ratio > 1.5 ? "Big jump" : ratio > 1.3 ? "Climbing fast" : ratio < .6 ? "Much lighter" : "Steady";
  return { weeks, acute, chronic, dlT, ratio, cls, txt };
}
function loggedLifts() {
  const n = {}; for (const x of allDoneSets()) n[x.ex.id] = (n[x.ex.id] || 0) + 1;
  return { n, ids: Object.keys(n).sort((a, b) => n[b] - n[a]) };
}
function renderProgress() {
  const today = dayKey(new Date()), page = S.progPage || "";
  S._chart = S._wchart = S._vchart = null; S._bodyCharts = [];
  if (page.startsWith("lift:")) return pageHead("progback", "Strength") + renderLift(page.slice(5), today);
  if (page === "strength") return pageHead("progback", "Progress") + renderStrength(today);
  if (page === "body") return pageHead("progback", "Progress") + renderBody();
  if (page === "volume") return pageHead("progback", "Progress") + renderVolume(today);
  const { ids } = loggedLifts(), since = addDays(today, -56);
  // Strength: lifts trained in the last 8 weeks, each against four weeks ago
  const ts = ids.map(id => liftTrend(id, today)).filter(t => t && t.last.day >= since);
  const moved = ts.filter(t => t.pct != null), up = moved.filter(t => t.pct > 1).length, down = moved.filter(t => t.pct < -1).length, flat = moved.length - up - down;
  const strength = !ids.length ? `<div class="pv muted">No finished sets yet. Tick off a few and your lifts show up here.</div>`
    : `<div class="pv">${moved.length ? `<b>${up}</b> lift${up === 1 ? "" : "s"} up${flat ? ` · <b>${flat}</b> flat` : ""}${down ? ` · <b>${down}</b> down` : ""} <span class="small muted">against 4 weeks ago</span>` : "Log each lift on two days to see a trend"}</div>
      <div class="plifts">${ts.slice(0, 4).map(t => `<div class="plift"><span class="nm">${esc(t.ex.name)}</span>${spark(t.hl.slice(-10).map(r => r.score))}<span class="num small">${t.trend ? `${t.trend.arrow} ${t.trend.pct}%` : "—"}</span></div>`).join("")}</div>`;
  // Body: the weight trend against the goal
  const wts = Object.keys(S.health).sort().filter(k => S.health[k].weightLb && k >= since).map(k => S.health[k].weightLb), F = fuel(today);
  const ws = tapeSeries("waist", today, addDays(today, -112));
  const waistLine = ws.length ? `<div class="plift"><span class="nm"><span class="small muted">Waist</span> <span class="num">${toTape(ws[ws.length - 1].v)} ${tapeUnit()}</span></span>${ws.length > 1 ? spark(ws.map(p => p.v)) : "<span></span>"}<span class="small muted">16 wk</span></div>` : "";
  const st = { ok: ["good", "On track"], low: ["warn", "Below target"], high: ["warn", "Above target"], unknown: ["neutral", "Need more weigh-ins"], settling: ["neutral", "Too soon to judge"], waist: ["warn", "Waist rising"] }[F.status];
  const body = wts.length ? `<div class="pv">${F.status !== "unknown" ? `<b class="num">${fmtRate(F.tr.perWk)}</b> ` : ""}<span class="pill ${st[0]}">${st[1]}</span> <span class="small muted">${esc(F.G.n.toLowerCase())}, goal ${F.G.r} lb/wk</span></div>
      <div class="plift"><span class="nm num">${fmtW(wts[wts.length - 1])}</span>${spark(wts)}<span class="small muted">8 wk</span></div>${waistLine}`
    : `<div class="pv muted">${Object.keys(S.health).length ? "No weigh-ins yet. Log one from + Log on Today." : "Weight, body fat and recovery show up here once you log a weigh-in or connect Garmin."}</div>`;
  // Volume: this week's working sets against your usual
  const L = weeklyLoad(today);
  const volume = `<div class="pv"><b class="num">${L.acute.toFixed(0)}</b> sets this week <span class="pill ${L.cls}">${L.txt}</span>${L.chronic ? ` <span class="small muted">usual ${L.chronic.toFixed(0)}</span>` : ""}</div>
      <div class="plift"><span class="nm small muted">Working sets a week</span>${sparkBars(L.weeks.map(w => w.v))}<span class="small muted">10 wk</span></div>`;
  const card = (k, n, inner) => `<button class="pcard" data-act="progpage" data-v="${k}"><span class="ph"><span class="pt">${n}</span><span class="chev" aria-hidden="true">›</span></span>${inner}</button>`;
  return `<div class="daynav"><div class="d"><div class="big">Progress</div><div class="small muted">Over weeks and months</div></div></div>
    ${card("strength", "Strength", strength)}${card("body", "Body", body)}${card("volume", "Volume", volume)}`;
}
// Strength: the levels chart, then every lift with its trend. Tap a lift for its charts.
function renderStrength(today) {
  const { ids } = loggedLifts();
  if (!ids.length) return `<section class="block"><h2>Strength</h2><div class="empty"><b>No finished sets yet.</b><span class="small">Once you tick off a few sets, this page shows your strength estimate for each lift and how it's moving.</span></div></section>`;
  const rows = ids.map(id => { const t = liftTrend(id, today); if (!t) return "";
    return `<button class="liftrow" data-act="progpage" data-v="lift:${esc(id)}"><span class="l"><b>${esc(t.ex.name)}</b><span class="small muted num">${t.fmt(t.last.score)} ${t.unitTxt}${t.ex.kind === "weight" ? " est. max" : ""}</span></span>${spark(t.hl.slice(-12).map(r => r.score))}<span class="num small tr ${t.trend?.cls || ""}">${t.trend ? `${t.trend.arrow} ${t.trend.pct}%` : "—"}</span><span class="chev" aria-hidden="true">›</span></button>`; }).join("");
  return `${renderLevels(today)}
    <section class="block">
      <h2>Your lifts</h2>
      <p class="small muted" style="margin:0">Latest session against four weeks ago. Deload sessions are left out.</p>
      <div class="lifts">${rows}</div>
    </section>`;
}
function renderLift(id, today) {
  const t = liftTrend(id, today);
  if (!t) return `<section class="block"><h2>${esc(exById(id).name)}</h2><p class="small muted">You haven't logged this one yet.</p></section>`;
  const { ex, h, hf, last } = t, fmtScore = t.fmt, scoreUnit = t.unitTxt, isDl = r => !!S.sessions[r.day]?.deload;
  const best = Math.max(...h.map(r => r.score)), bs = ex.kind === "weight" ? bestSet(ex.id) : null;
  const metricName = ex.kind === "weight" ? "Strength estimate" : ex.kind === "time" ? "Longest hold" : "Most reps in a set";
  // Deload sessions sit off the line as hollow points in a shaded band; after each deload a dashed line marks the pre-deload best to beat
  const t0 = h[0].day, bands = deloadRanges().filter(r => r.to >= t0 && r.from <= today);
  const refs = bands.map(r => { const v = preDeloadBest(hf, r); if (!v) return null;
    const next = hf.find(x => x.day > r.to); return { from: r.from, to: next ? next.day : today, v, label: "pre-deload best" }; }).filter(Boolean);
  S._chart = { pts: hf.map(r => ({ day: r.day, v: r.score })), ghosts: h.filter(isDl).map(r => ({ day: r.day, v: r.score })), bands, refs, fmt: fmtScore, unit: scoreUnit, kind: "line" };
  // Volume per session: weight × reps for loaded lifts, total reps (or seconds) otherwise; same-day entries summed
  const volByDay = {};
  for (const r of h) volByDay[r.day] = (volByDay[r.day] || 0) + entryVolume(r.e, ex);
  const vall = Object.keys(volByDay).sort().map(day => ({ day, v: volByDay[day] })), dlDay = d => !!S.sessions[d]?.deload;
  const vpts = vall.filter(p => !dlDay(p.day));
  // A deload session's volume ceiling: what the deload plan gave it (half the sets, ~90% weight). Well past it isn't a deload.
  const vghosts = vall.filter(p => dlDay(p.day)).map(p => { const d = deloadPlan(ex.id, p.day);
    const cap = d ? d.n * (ex.kind === "weight" ? d.w * d.r : d.r) : null; return { ...p, cap, over: cap && p.v > cap * DELOAD_SLACK }; });
  const fmtVol = v => Math.round(ex.kind === "weight" && unit() === "kg" ? v / LB_PER_KG : v).toLocaleString();
  const volUnit = ex.kind === "weight" ? unit() : ex.kind === "time" ? "s" : "reps";
  const volName = ex.kind === "weight" ? "Volume per session" : ex.kind === "time" ? "Total seconds held per session" : "Total reps per session";
  const vl = vpts[vpts.length - 1], vp = vpts[vpts.length - 2], vgl = vghosts[vghosts.length - 1];
  const volLine = vl ? `<div class="small muted">Latest <b class="num">${fmtVol(vl.v)}</b> ${volUnit}${vp && vp.v > 0 ? ` · previous ${fmtVol(vp.v)} (${vl.v >= vp.v ? "+" : "−"}${Math.abs(Math.round((vl.v / vp.v - 1) * 100))}%)` : ""} · best ${fmtVol(Math.max(...vpts.map(p => p.v)))}</div>` : "";
  const dlNote = bands.length ? `<div class="legend small"><span><i class="sw dlw"></i>Deload week</span><span><i class="sw ghost"></i>Deload session (not in the line)</span>${refs.length ? `<span><i class="sw ref"></i>Pre-deload best to beat</span>` : ""}</div>` : "";
  const vdlNote = vghosts.some(g => g.cap) ? `<div class="legend small"><span><i class="sw cap"></i>Deload ceiling</span>${vgl?.cap ? `<span>Last deload: ${fmtVol(vgl.v)} of ${fmtVol(vgl.cap)} ${volUnit}${vgl.over ? ` <b class="hot">· heavier than a deload</b>` : ""}</span>` : ""}</div>` : "";
  S._vchart = { pts: vpts, ghosts: vghosts, bands, fmt: fmtVol, unit: volUnit };
  const lvl = liftLevel(ex.id, today);
  const recent = h.slice(-6).reverse().map(r => `<button data-act="goto" data-day="${r.day}"><div class="l"><b>${fmtDay(r.day)}</b>${isDl(r) ? ` <span class="pill neutral">deload</span>` : ""}</div><span class="num small muted">${doneSets(r.e).map(s => ex.kind === "weight" ? `${toDisp(s.w)}×${s.r}` : s.r).join(", ")}</span></button>`).join("");
  return `
    <section class="block">
      <h2>${esc(ex.name)} ${helpBtn(ex.id, ex.name)}</h2>
      <div class="hero">
        <div class="label">${metricName}</div>
        <div class="herov"><span class="num big">${fmtScore(last.score)}</span><span class="small muted"> ${scoreUnit}</span>${trendHtml(t.trend)}</div>
      </div>
      ${ex.kind === "weight" ? fold("est-info", `What this number is`, `<div class="small muted">Your estimated 1-rep max, worked out from your best set each session. It's only accurate on sets close to failure, so treat it as a floor: your real max is probably higher.</div>`) : ""}
      <div class="chart" id="chart1"></div>
      ${dlNote}
      ${lvl ? `<div class="small herosub"><span class="pill ${lvl.score >= 3 ? "good" : "neutral"}">${lvl.level}${lvl.capped ? "+" : ""}</span>${lvl.next ? ` <span class="muted">${lvl.kind === "reps" ? `${Math.ceil(lvl.next)} reps` : `${fmtW(lvl.next)}${PER_HAND.has(ex.id) ? " each" : ""} est. max`} for ${LEVELS[Math.floor(lvl.score)]}</span>` : ""}</div>` : ""}
      <div class="small muted num herosub">Best ${fmtScore(best)} ${scoreUnit}${bs ? ` · from ${toDisp(bs.w)} × ${bs.r}` : ""}${ex.kind === "weight" && latestWeight(today) ? ` · ${bodyweightRatio(ex.id, best, latestWeight(today).weightLb).toFixed(2)}× bodyweight${PER_HAND.has(ex.id) ? " · both hands" : ""}` : ""}</div>
      <div class="label">${volName}</div>
      ${volLine}
      <div class="chart" id="chart-vol"></div>
      ${vdlNote}
    </section>
    <section class="block">
      <h2>Last sessions</h2>
      <div class="hist">${recent}</div>
    </section>`;
}
// Volume: the long view of training load. This week's detail is on the Week tab.
function renderVolume(today) {
  const L = weeklyLoad(today);
  S._wchart = { pts: L.weeks };
  return `
    <section class="block">
      <h2>Weekly workload</h2>
      <div class="statrow">
        <div class="stat"><div class="label">This week</div><div class="v">${L.acute.toFixed(0)}<span class="small muted"> sets</span></div></div>
        <div class="stat"><div class="label">${L.dlT != null ? "Deload target" : "4-wk avg"}</div><div class="v">${L.dlT != null ? `≤${Math.round(L.dlT)}` : L.chronic.toFixed(0)}<span class="small muted"> sets</span></div></div>
        <div class="stat"><div class="label">vs average</div><div class="v">${L.chronic ? L.ratio.toFixed(1) + "×" : "—"}</div><span class="pill ${L.cls}">${L.txt}</span></div>
      </div>
      <div class="label">Working sets per week · last 10 weeks</div>
      <div class="chart" id="chart2"></div>
      ${fold("load-info", "How sets are counted", `<p class="small muted" style="margin:6px 0 0">Working sets: each ticked set, with easy ones counted as half. Jumps above about 1.5× your average are where tweaks tend to happen. Deload weeks are left out of the average${L.weeks.some(w => w.target != null) ? "; their bars are outlined, with a dashed mark at the deload target (about half a usual week)" : ""}.</p>`)}
      ${S.cardio.length ? `<div class="label">Cardio minutes per week (walks excluded)</div><div class="chart" id="chart3"></div>` : ""}
    </section>
    ${renderMuscleWeeks(today)}`;
}

// Cardio's fatigue load per muscle over a day range, in hard-set equivalents (same scale the fatigue model uses)
function cardioLoadPerMuscle(fromDay, toDay) {
  const out = Object.fromEntries(Object.keys(MUSCLES).map(m => [m, 0]));
  for (const a of S.cardio) {
    if (a.day < fromDay || a.day > toDay || a.re < CARDIO_MIN_EFFORT) continue;
    const eq = Math.min(6, a.re / 10);
    for (const [m, w] of Object.entries(a.muscles)) if (out[m] != null) out[m] += w * eq;
  }
  return out;
}
function renderJointBars(today) {
  const jr = jointRatios(today);
  const rows = JOINT_ORDER.filter(j => jr[j].acute > 0 || jr[j].usual > 0);
  if (!rows.length) return "";
  const maxV = Math.max(JOINT_FLOOR * 1.6, ...rows.map(j => Math.max(jr[j].acute, jr[j].base) * 1.1));
  const dl = rows.some(j => jr[j].target != null);
  const bars = rows.map(j => {
    const r = jr[j], base = r.base, heavy = dl && r.acute > r.target * DELOAD_SLACK;
    // In a deload the bar is judged against the deload mark: green at or under it, amber when it's not much of a deload
    const cls = r.ratio > 1.5 ? "over" : r.ratio > 1.3 || heavy ? "warnf" : dl && r.acute > 0 ? "dlok" : "";
    const tip = `${JOINT_NAMES[j]}: ${Math.round(r.acute)} points this week · ${r.basis === "usual" ? "usual week" : "normal week of your plan"} ${Math.round(base)}${dl ? ` · deload target ${Math.round(r.target)}` : ""}${r.top.length ? ` · mostly ${r.top.join(", ")}` : ""}`;
    return `<div class="bar"><span>${JOINT_NAMES[j][0].toUpperCase() + JOINT_NAMES[j].slice(1)}</span><div class="track" title="${esc(tip)}">
      ${r.acute > 0 ? `<div class="fill ${cls}" style="width:${Math.min(100, r.acute / maxV * 100)}%"></div>` : ""}
      <div class="usual" style="left:${base / maxV * 100}%"></div>
      ${dl ? `<div class="dlt" style="left:${r.target / maxV * 100}%"></div>` : ""}</div>
      <span class="v ${cls === "over" || cls === "warnf" ? "hot" : ""}">${r.acute > 0 ? `${r.ratio.toFixed(1)}×` : "—"}</span></div>`;
  }).join("");
  return `
    <section class="block">
      <h2>Joint stress · last 7 days</h2>
      <p class="small muted" style="margin:0">Reps weighted by how much each exercise stresses the joint (heavier sets count more), plus runs and rows from Strava. The line marks your usual week${Object.values(jr).some(r => r.basis === "starter") ? ", or a normal week of your plan while you're still building history" : ""}. Above 1.5× is a jump your joints haven't adapted to yet.${dl ? " This is a deload week: aim to stay at or under the dashed mark (about half your usual lifting, cardio as normal)." : ""}</p>
      ${dl ? `<div class="legend small"><span><i class="sw usual"></i>Usual week</span><span><i class="sw dlt"></i>Deload target</span></div>` : ""}
      <div class="bars">${bars}</div>
    </section>`;
}
// The past 7 days against your targets, and the one thing most worth changing next week
function weekReview(today) {
  const from = addDays(today, -6), wk = { ...WEEK_DEFAULT, ...(S.settings.week || {}) };
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i));
  const lifts = days.filter(liftedOn).length, mins = cardioMinutes(from, today);
  const sp = setsPerMuscle(from, today), ms = Object.keys(MUSCLES).filter(m => MUSCLES[m].lo > 0), dl = deloadScale(from, today);
  // In a deload, being under the usual range is the point: only going past the deload target is flagged
  const below = dl < 1 ? [] : ms.filter(m => sp[m] < MUSCLES[m].lo).sort((a, b) => (MUSCLES[b].lo - sp[b]) - (MUSCLES[a].lo - sp[a]));
  const over = Object.keys(MUSCLES).filter(m => sp[m] > MUSCLES[m].hi * (dl < 1 ? dl * DELOAD_SLACK : 1));
  const bests = {};
  for (const d of days) for (const e of S.sessions[d]?.entries || []) {
    const ex = exById(e.ex), sc = entryScore(e, ex), prev = historyFor(e.ex, d);
    if (sc && prev.length && sc > Math.max(...prev.map(r => r.score))) bests[e.ex] = sc;
  }
  const jr = jointRatios(today), hot = JOINT_ORDER.find(j => jr[j].acute > 0 && jr[j].ratio > 1.5), tr = recoveryTrend(today);
  const n = m => MUSCLES[m].n.toLowerCase();
  const focus = tr.hrvDown || tr.rhrUp ? "Recovery is dipping. Trim cardio first and hold your lifting weights."
    : over.length && dl < 1 ? `Ease off ${n(over[0])}: ${Math.round(sp[over[0]])} sets is a lot for a deload (aim for about ${Math.round(MUSCLES[over[0]].hi * dl)}).`
    : over.length ? `Ease off ${n(over[0])}: ${Math.round(sp[over[0]])} sets is past its cap of ${MUSCLES[over[0]].hi}.`
    : dl < 1 ? "Deload week: about half your usual sets, lighter weights, stop well short of failure. Afterwards, aim to beat your pre-deload numbers."
    : hot ? `Go easier on your ${JOINT_NAMES[hot]}: its load is ${jr[hot].ratio.toFixed(1)}× a normal week.`
    : lifts < wk.lifts ? `Fit in ${wk.lifts - lifts} more lift${wk.lifts - lifts > 1 ? "s" : ""} to reach your ${wk.lifts} a week.`
    : mins < wk.cardioMin * .8 ? `Add cardio: ${mins} of ${wk.cardioMin} minutes.`
    : below.length ? `Add sets for ${n(below[0])}: ${Math.round(sp[below[0]])} of ${MUSCLES[below[0]].lo}.`
    : "Everything is on target. Keep it going.";
  return { lifts, liftsT: wk.lifts, mins, minsT: wk.cardioMin, inRange: ms.filter(m => inRange(m, sp[m], dl) || (dl < 1 && sp[m] >= .5 && sp[m] <= MUSCLES[m].hi * dl)).length, muscles: ms.length, below, over, bests, focus, deload: dl < 1, rebound: rebound(today) };
}
// Muscles with no minimum count once they've had real work (half a set, the point the weekly grid shows a number)
// s scales the range for a week that's partly or wholly a deload (deloadScale)
function inRange(m, v, s = 1) { return v >= Math.max(MUSCLES[m].lo * s, .5) && v <= MUSCLES[m].hi * s; }
// How far over a deload target still counts as a deload
const DELOAD_SLACK = 1.25;
function renderMuscleBars(today) {
  const wk = setsPerMuscle(addDays(today, -6), today), cw = cardioLoadPerMuscle(addDays(today, -6), today);
  const prior = usualAvg(today, setsPerMuscle), dl = deloadScale(addDays(today, -6), today);
  const usualM = m => prior[m], histOk = (firstDay() || today) <= addDays(today, -14);
  const anyCardio = Object.values(cw).some(v => v >= .05);
  const maxV = Math.max(22, ...Object.keys(wk).map(m => Math.max(wk[m] + cw[m], usualM(m))));
  const fmt = v => v.toFixed(v % 1 ? 1 : 0);
  const bars = Object.keys(MUSCLES).filter(m => MUSCLES[m].lo > 0 || wk[m] > 0 || cw[m] >= .05).map(m => {
    const M = MUSCLES[m], v = wk[m], c = cw[m] >= .05 ? cw[m] : 0, lo = M.lo * dl, hi = M.hi * dl;
    const tip = `${M.n}: ${fmt(v)} lifting sets${c ? ` + ${c.toFixed(1)} from cardio` : ""} · ${dl < 1 ? `deload target ${fmt(lo)}–${fmt(hi)} (normally ${M.lo}–${M.hi})` : `target ${M.lo}–${M.hi}`}`;
    const fcls = v > M.hi ? "over" : v > hi * (dl < 1 ? DELOAD_SLACK : 1) ? "warnf" : "";
    return `<div class="bar"><span${inRange(m, v, dl) ? ` class="inrange"` : ""}>${M.n}</span><div class="track" title="${tip}">
      ${dl < 1 ? `<div class="band ghost" style="left:${M.lo / maxV * 100}%;width:${(M.hi - M.lo) / maxV * 100}%"></div>` : ""}
      <div class="band${dl < 1 ? " dl" : ""}" style="left:${lo / maxV * 100}%;width:${(hi - lo) / maxV * 100}%"></div>
      ${v > 0 ? `<div class="fill ${fcls}" style="width:${Math.min(100, v / maxV * 100)}%"></div>` : ""}
      ${c ? `<div class="cfill" style="left:${v / maxV * 100}%;width:${Math.min(100 - v / maxV * 100, c / maxV * 100)}%"></div>` : ""}
      ${histOk && usualM(m) > 0 ? `<div class="usual" style="left:${usualM(m) / maxV * 100}%" title="Usual week: ${fmt(usualM(m))} sets"></div>` : ""}</div>
      <span class="v">${fmt(v)}${c ? `<span class="cv">+${c.toFixed(1)}</span>` : ""}${histOk && v >= 6 && v > Math.max(usualM(m), 4) * 1.5 ? `<span class="cv hot" title="${(v / Math.max(usualM(m), 4)).toFixed(1)}× your usual week">↑</span>` : ""}</span></div>`;
  }).join("");
  return `
    <section class="block">
      <h2>Sets per muscle · last 7 days</h2>
      <p class="small muted" style="margin:0">${dl < 1 ? `Deload week: the green band is the deload target, about half the usual range (the faint outline), and a muscle's name turns green inside it. Going past it means the week isn't really a deload.` : `Green band is the productive weekly range, and a muscle's name turns green once it's in it.`} Secondary muscles count as partial sets; easy sets count half.</p>
      <div class="legend small"><span><i class="sw lift"></i>Lifting sets</span>${anyCardio ? `<span><i class="sw cardio"></i>Cardio load (fatigue only, not counted toward the target)</span>` : ""}${histOk ? `<span><i class="sw usual"></i>Your usual week</span><span><b class="hot">↑</b> well above usual</span>` : ""}</div>
      <div class="bars">${bars}</div>
    </section>`;
}
function entryVolume(e, ex) { return doneSets(e).reduce((a, s) => a + (ex.kind === "weight" ? (s.w || 0) * s.r : s.r), 0); }
// Weekly sets per muscle over the last 8 weeks, coloured against each muscle's target range
// Strength levels as a chart: a row per muscle (or movement), five zones on the track, the bar's length is the level
// and its colour the zone it reached. Tap a row for the lift behind it and the next step.
function renderLevels(today) {
  if (!S.settings.stdSex) return `<section class="block"><h2>Strength levels ${srcBtn("levels")}</h2><p class="small muted" style="margin:0">See how each muscle compares with beginner-to-elite standards for your bodyweight. Pick men's or women's standards under Setup → About you to turn this on.</p></section>`;
  if (!latestWeight(today)) return "";
  const byMuscle = S.lvView !== "movement", ml = byMuscle ? muscleLevels(today) : null;
  const rows = byMuscle ? ml.rows.filter(r => r.covered) : strengthLevels(today).groups;
  if (!rows.some(r => r.best)) return "";
  const sel = rows.find(r => r.k === S.lvSel && r.best);
  const lvIdx = sc => sc < 1 ? 0 : Math.min(5, Math.floor(sc));
  const row = r => {
    if (!r.best) return `<div class="lvrow none"><span class="lvn">${r.n}</span><span class="lvt">${"<i></i>".repeat(5)}</span><span class="lvl">not logged</span></div>`;
    const b = r.best, ex = exById(b.exId), word = b.level + (b.capped ? "+" : "");
    return `<button class="lvrow${r.lag ? " lag" : ""}${sel === r ? " on" : ""}" data-act="lvsel" data-k="${r.k}" aria-pressed="${sel === r}" aria-label="${r.n}: ${word}${r.lag ? ", behind your others" : ""}, from ${esc(ex.name)}" title="${esc(ex.name)}: ${word}">
      <span class="lvn">${r.lag ? "▲ " : ""}${r.n}</span>
      <span class="lvt" aria-hidden="true">${"<i></i>".repeat(5)}<b class="l${lvIdx(b.score)}" style="width:${Math.max(3, b.score / 5 * 100).toFixed(1)}%"></b></span>
      <span class="lvl">${word}</span></button>`;
  };
  const lags = rows.filter(r => r.lag);
  let detail = lags.length ? `<b>${lags.map(r => r.n).join(", ")}</b> ${lags.length > 1 ? "are" : "is"} a level or more behind the rest (▲). Worth giving ${lags.length > 1 ? "them" : "it"} priority.` : "Tap a row for the lift behind it.";
  if (sel) {
    const b = sel.best, ex = exById(sel.best.exId), each = PER_HAND.has(ex.id) ? " each" : "";
    detail = `<b>${sel.n}</b>: ${b.level.toLowerCase()}${b.capped ? " or better (your gear's limit)" : ""}, from ${esc(ex.name.toLowerCase())} (${b.kind === "reps" ? `${Math.round(b.v)} reps` : `est. max ${fmtW(b.v)}${each}`}).${b.next ? ` ${LEVELS[Math.floor(b.score)]} starts at ${b.kind === "reps" ? `${Math.ceil(b.next)} reps` : `${fmtW(b.next)}${each}`}.` : ""}`;
  }
  const none = byMuscle ? ml.rows.filter(r => !r.covered).map(r => r.n.toLowerCase()) : [];
  return `<section class="block">
    <h2>Strength levels ${srcBtn("levels")}</h2>
    <div class="seg lvseg" role="group" aria-label="Group by">${[["muscle", "By muscle"], ["movement", "By movement"]].map(([k, n]) => `<button data-act="lvview" data-v="${k}" aria-pressed="${(byMuscle ? "muscle" : "movement") === k}">${n}</button>`).join("")}</div>
    <div class="lvkey" aria-hidden="true">${LEVELS.map((n, i) => `<span><i style="background:var(--lv${i + 1})"></i>${n}</span>`).join("")}</div>
    <div class="lvs">${rows.map(row).join("")}</div>
    <div class="lvticks" aria-hidden="true">${LEVELS.map((n, i) => `<span style="left:${(i + 1) * 20}%">${i < 4 ? n.slice(0, 3) + "." : n}</span>`).join("")}</div>
    <div class="small" aria-live="polite" style="margin-top:8px">${detail}</div>
    <p class="small muted" style="margin:6px 0 0">Rough levels from your best set in the last 8 weeks. "+" means you're at your gear's limit, so you may be stronger than this.${none.length ? ` No standards for ${none.join(", ")}.` : ""}</p>
  </section>`;
}
function renderMuscleWeeks(today) {
  const start = firstDay(); if (!start) return "";
  const N = 8, weeks = [];
  for (let i = N - 1; i >= 0; i--) { const end = addDays(today, -7 * i); weeks.push({ end, sp: end >= start ? setsPerMuscle(addDays(end, -6), end) : null, s: deloadScale(addDays(end, -6), end) }); }
  const anyDl = weeks.some(w => w.sp && w.s < 1);
  const ms = Object.keys(MUSCLES).filter(m => MUSCLES[m].lo > 0 || weeks.some(w => w.sp?.[m] >= .5));
  const head = `<span></span>${weeks.map((w, i) => `<span class="h${w.s < 1 ? " dl" : ""}"${w.s < 1 ? ` title="Deload week"` : ""}>${i === N - 1 ? "now" : i % 2 ? (w.s < 1 ? "DL" : "") : fmtDay(w.end, { month: "numeric", day: "numeric" })}</span>`).join("")}`;
  const rows = ms.map(m => { const M = MUSCLES[m];
    return `<span class="n${inRange(m, weeks[N - 1].sp?.[m] ?? 0, weeks[N - 1].s) ? " inrange" : ""}" title="Target ${M.lo}–${M.hi} sets a week">${M.n}</span>` + weeks.map(w => {
      if (!w.sp) return `<span class="c na"></span>`;
      // A deload week is judged against its own, lower target: under it is the point, not a gap
      const v = w.sp[m], s = w.s, cls = v > M.hi * (s < 1 ? DELOAD_SLACK * s : 1) ? "hi" : inRange(m, v, s) || (s < 1 && v >= .5 && v <= M.hi * s) ? "ok" : s < 1 ? "" : M.lo ? "lo" : "";
      const tgt = s < 1 ? `deload target ${(M.lo * s).toFixed(1)}–${(M.hi * s).toFixed(1)}` : `target ${M.lo}–${M.hi}`;
      return `<span class="c ${cls}${s < 1 ? " dl" : ""}" title="${M.n}, week to ${fmtDay(w.end, { month: "short", day: "numeric" })}: ${v.toFixed(1)} sets (${tgt})">${v >= .5 ? Math.round(v) : "·"}</span>`;
    }).join(""); }).join("");
  return `
    <section class="block">
      <h2>Sets per muscle · weekly trend ${srcBtn("volume")}</h2>
      <p class="small muted" style="margin:0">Each column is the 7 days ending on that date; "now" is the past 7 days. Counted the same way as on the Week tab. Watch for a muscle that stays amber week after week.</p>
      <div class="legend small"><span><i class="sw ok"></i>In range</span><span><i class="sw lo"></i>Below range</span><span><i class="sw hi"></i>Over the cap</span>${anyDl ? `<span><i class="sw dlw"></i>Deload week (judged against about half the range)</span>` : ""}</div>
      <div class="mw">${head}${rows}</div>
    </section>`;
}
function renderBody() {
  S._bodyCharts = [];
  const ks = Object.keys(S.health).sort();
  const g = S.conn.garmin;
  if (!ks.length) return `<section class="block"><h2>Body &amp; recovery</h2><div class="empty small">${g.st === "loading" ? "Loading Garmin data…" : esc(g.msg || "Garmin data shows up here once the sync on your Mac has run.")}</div></section>`;
  const wts = ks.filter(k => S.health[k].weightLb).map(k => ({ day: k, v: S.health[k].weightLb }));
  const fat = ks.filter(k => S.health[k].bodyFatPct).map(k => ({ day: k, v: S.health[k].bodyFatPct }));
  const avg = (arr, from) => { const xs = arr.filter(p => p.day >= from).map(p => p.v); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
  const today = dayKey(new Date());
  const w7 = avg(wts, addDays(today, -6)), w28 = avg(wts.filter(p => p.day < addDays(today, -6)), addDays(today, -34));
  if (wts.length) S._bodyCharts.push(["chart-wt", { pts: wts, fmt: v => toDisp(v), unit: unit() }]);
  if (fat.length) S._bodyCharts.push(["chart-fat", { pts: fat, fmt: v => v.toFixed(1), unit: "%" }]);
  const navy = navySeries(today), navyNow = navy.length ? navy[navy.length - 1] : null;
  const rows = ks.slice(-7).reverse().map(k => { const x = S.health[k];
    return `<tr><td>${fmtDay(k, { weekday: "short", day: "numeric" })}</td><td>${x.readiness ?? "—"}</td><td>${x.sleepScore ?? "—"}</td><td>${x.hrv ?? "—"}</td><td>${x.bodyBatteryWake ?? x.bodyBatteryHigh ?? "—"}</td><td>${x.restingHr ?? "—"}</td></tr>`; }).join("");
  return `
    <section class="block">
      <h2>Body &amp; recovery</h2>
      <div class="statrow">
        <div class="stat"><div class="label">Weight · 7d avg</div><div class="v">${w7 ? toDisp(w7) : "—"}<span class="small muted"> ${unit()}</span></div></div>
        <div class="stat"><div class="label">vs prior 4 wk</div><div class="v">${w7 && w28 ? `${w7 >= w28 ? "+" : "−"}${toDisp(Math.abs(w7 - w28))}` : "—"}</div></div>
        <div class="stat"><div class="label">Body fat · ${navyNow ? "tape" : "scale"}${S.settings.goalFat ? ` · goal ${esc(S.settings.goalFat)}` : ""}</div><div class="v">${navyNow ? navyNow.v.toFixed(1) : fat.length ? fat[fat.length - 1].v.toFixed(1) : "—"}<span class="small muted"> %</span></div></div>
      </div>
      ${renderFuel(today)}
      ${wts.length ? `<div class="label">Weight</div><div class="chart" id="chart-wt"></div>` : ""}
      ${renderTape(today)}
      ${fat.length ? `<div class="label">Body fat % · scale</div><div class="chart" id="chart-fat"></div>
      <p class="small muted" style="margin:0">The scale estimates fat from how easily a small current passes through you, which mostly tracks how much water you're holding. Day to day it can swing more than it moves in a month, so read the trend, and trust the tape more. ${srcBtn("tape")}</p>` : ""}
      <div class="label">Last 7 mornings (Garmin)</div>
      <div style="overflow-x:auto"><table class="vt"><thead><tr><th>Day</th><th>Ready</th><th>Sleep</th><th>HRV</th><th>Battery</th><th>RHR</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="small muted" style="margin:0">Synced ${g.at ? new Date(g.at).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" }) : "—"}.</p>
    </section>`;
}
// Measurements on Body: latest of each with its 4-week change, the reading, then the waist and tape body-fat charts
function renderTape(today) {
  const lt = lastTape(today), H = S.settings.heightIn, sex = S.settings.stdSex;
  if (!lt) return `<div class="label">Measurements ${srcBtn("tape")}</div>
      <p class="small muted" style="margin:0">On a bulk the scale can't tell muscle from fat. A tape can: if your weight goes up and your waist stays flat, it's mostly muscle. Waist, neck, arm, chest and thigh every 2 weeks takes about 2 minutes.</p>
      <div class="actions" style="margin-top:0"><button class="btn" data-act="tape-open">Take measurements</button></div>`;
  const read = tapeRead(today), navy = navySeries(today);
  const rows = tapeFields().map(([k, n]) => { const s = tapeSeries(k, today); if (!s.length) return "";
    const c = tapeChange(k, today);
    return `<div class="plift"><span class="nm">${n} <span class="num">${toTape(s[s.length - 1].v)}</span> <span class="small muted">${tapeUnit()}</span></span>${s.length > 1 ? spark(s.slice(-8).map(p => p.v)) : "<span></span>"}<span class="num small ${c && k === "waist" && c.d / daysBetween(c.from, c.to) * 30.4 > WAIST_MAX_MO ? "warnt" : ""}">${c ? fmtTapeDelta(c.d) : "—"}</span></div>`; }).join("");
  const ws = tapeSeries("waist", today);
  if (ws.length >= 2) S._bodyCharts.push(["chart-waist", { pts: ws, fmt: v => toTape(v), unit: tapeUnit() }]);
  if (navy.length >= 2) S._bodyCharts.push(["chart-navy", { pts: navy, fmt: v => v.toFixed(1), unit: "%" }]);
  const need = [!H && "height", !sex && "men's or women's standards", sex === "f" && !lt.hips && "a hips measurement"].filter(Boolean);
  return `<div class="label" style="display:flex;gap:8px;align-items:center">Measurements ${srcBtn("tape")}<span class="small muted" style="margin-left:auto;text-transform:none;letter-spacing:0">last ${fmtDay(lt.day, { month: "short", day: "numeric" })}</span></div>
      ${read ? `<div class="pv"><span class="pill ${read.lvl}">${read.pill}</span> <span class="small">${read.t}</span></div>` : `<p class="small muted" style="margin:0">Changes show once you have measurements at least 3 weeks apart.</p>`}
      <div class="plifts">${rows}</div>
      <div class="actions" style="margin-top:0"><button class="btn" data-act="tape-open">${lt.day === today ? "Edit today's" : "Measure"}</button></div>
      ${ws.length >= 2 ? `<div class="label">Waist</div><div class="chart" id="chart-waist"></div>` : ""}
      ${navy.length >= 2 ? `<div class="label">Body fat % · tape (US Navy method)</div><div class="chart" id="chart-navy"></div>`
        : navy.length ? `<p class="small muted" style="margin:0">Body fat from the tape: <b class="num">${navy[0].v.toFixed(1)}%</b>. A trend line shows from the next measurement.</p>`
        : need.length ? `<p class="small muted" style="margin:0">For a body-fat estimate from the tape, add ${need.join(" and ")}${need.some(x => x !== "a hips measurement") ? " under Setup → About you" : ""}.</p>` : ""}`;
}
function renderFuel(today) {
  const F = fuel(today);
  const st = { ok: ["good", "On track"], low: ["warn", "Below target"], high: ["warn", "Above target"], unknown: ["neutral", "Need more weigh-ins"], settling: ["neutral", "Too soon to judge"], waist: ["warn", "Waist rising"] }[F.status];
  const hist = F.N.changes.slice(-5).reverse().map(c => `<li>${fmtDay(c.day, { month: "short", day: "numeric" })}: ${c.delta > 0 ? "+" : "−"}${Math.abs(c.delta)} kcal → ~${c.kcal.toLocaleString()} (weight was ${fmtRate(c.perWk)})</li>`).join("");
  return `
      <div class="label" style="display:flex;gap:8px;align-items:center">Fuel · ${esc(F.G.n.toLowerCase())} <span class="pill ${st[0]}">${st[1]}</span></div>
      <div class="statrow">
        <div class="stat"><div class="label">Trend</div><div class="v">${F.status !== "unknown" ? fmtRate(F.tr.perWk).split(" ")[0] : "—"}<span class="small muted"> ${unit()}/wk</span></div><div class="small muted">goal ${F.G.r} lb</div></div>
        <div class="stat"><div class="label">Daily target</div><div class="v">${F.kcal.toLocaleString()}<span class="small muted"> kcal</span></div></div>
        <div class="stat"><div class="label">Protein</div><div class="v">${F.prot}<span class="small muted"> g</span></div></div>
      </div>
      <p class="small muted" style="margin:0">No food logging: the trend line through your weigh-ins${F.tr.n >= 2 ? ` (${F.tr.n} in the last ${TREND_DAYS / 7} weeks)` : ""} shows whether you're eating enough.${F.tr.gap ? ` No weigh-ins ${fmtDay(F.tr.gap.from, { month: "short", day: "numeric" })}–${fmtDay(F.tr.gap.to, { month: "short", day: "numeric" })}, so it's less certain.` : ""}${F.status === "settling" ? " Your target changed recently, so the trend needs time to show it." : ""} The calorie number is a rough guess to anchor on; the changes to it are what matter.${F.nextCheck && F.nextCheck > today ? ` Next check ${fmtDay(F.nextCheck, { weekday: "short", month: "short", day: "numeric" })}.` : ""}</p>
      ${F.waist.perMo != null ? `<p class="small muted" style="margin:0">Waist ${fmtTapeDelta(F.waist.perMo)} a month over the last ${F.waist.n} measurements${F.waist.perMo > WAIST_MAX_MO ? `, faster than the ${fmtTapeDelta(WAIST_MAX_MO)} a lean bulk allows${F.waistHold ? ", so no extra food even though weight is slow" : ""}` : ""}.</p>` : ""}
      ${hist ? `<ul class="small muted" style="margin:0;padding-left:18px">${hist}</ul>` : ""}`;
}
function wireChart() {
  const c1 = $("#chart1"), c2 = $("#chart2");
  if (c1 && S._chart) lineChart(c1, S._chart);
  if (c2 && S._wchart) barChart(c2, S._wchart);
  const cv = $("#chart-vol");
  if (cv && S._vchart) lineChart(cv, S._vchart);
  const c3 = $("#chart3");
  if (c3) { const t = dayKey(new Date()), pts = [];
    for (let i = 5; i >= 0; i--) { const end = addDays(t, -7 * i); pts.push({ end, v: cardioMinutes(addDays(end, -6), end) }); }
    barChart(c3, { pts, label: "min" }); }
  for (const [id, cfg] of S._bodyCharts || []) { const el = document.getElementById(id); if (el) lineChart(el, cfg); }
}
// The smallest round step that covers lo..hi in at most n+1 intervals, with the top rounded up so no value sits above the chart
function niceTicks(lo, hi, n = 4) {
  const span = hi - lo || 1, mag = Math.pow(10, Math.floor(Math.log10(span / n)));
  const steps = [1, 2, 2.5, 5, 10, 20, 25, 50].map(m => m * mag);
  const fit = st => [Math.floor(lo / st + 1e-9) * st, Math.ceil(hi / st - 1e-9) * st];
  const step = steps.find(st => { const [b, t] = fit(st); return (t - b) / st <= n + 1 + 1e-9; }) || steps[steps.length - 1];
  const [b, t] = fit(step);
  const out = []; for (let v = b; v <= t + 1e-9; v += step) out.push(+v.toFixed(6));
  if (out.length < 2) out.push(+(b + step).toFixed(6));
  return out;
}
// ghosts: points shown hollow and left off the line (deload sessions), with an optional cap (a ceiling tick) and over flag.
// bands: [{from, to}] shaded day ranges. refs: [{from, to, v, label}] dashed horizontal reference segments.
function lineChart(el, { pts, fmt, unit: u, ghosts = [], bands = [], refs = [] }) {
  const W = 640, H = 220, L = 44, R = 14, T = 14, B = 26;
  const all = [...pts.map(p => ({ ...p })), ...ghosts.map(p => ({ ...p, ghost: true }))].sort((a, b) => a.day < b.day ? -1 : 1);
  if (all.length < 2) { el.innerHTML = `<p class="small muted" style="margin:8px">Log this lift on two different days to see a trend.</p>`; return; }
  const t0 = parseDay(all[0].day).getTime(), t1 = parseDay(all[all.length - 1].day).getTime();
  const vals = [...all.map(p => p.v), ...ghosts.filter(g => g.cap).map(g => g.cap), ...refs.map(r => r.v)], vmin = Math.min(...vals), vmax = Math.max(...vals);
  const ticks = niceTicks(vmin - (vmax - vmin) * .1 - .5, vmax + (vmax - vmin) * .1 + .5);
  const y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const X = t => L + (t - t0) / Math.max(1, t1 - t0) * (W - L - R), Y = v => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
  const Xd = d => Math.min(W - R, Math.max(L, X(parseDay(d).getTime())));
  const xy = pts.map(p => [X(parseDay(p.day).getTime()), Y(p.v)]), axy = all.map(p => [X(parseDay(p.day).getTime()), Y(p.v)]);
  const line = xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
  const area = xy.length > 1 ? `${line}L${xy[xy.length - 1][0].toFixed(1)},${H - B}L${xy[0][0].toFixed(1)},${H - B}Z` : "";
  // first, middle and last dates; the middle one only when it has room (dates bunched at one end would overlap)
  const xl = [0, Math.floor((all.length - 1) / 2), all.length - 1].filter((v, i, a) => a.indexOf(v) === i)
    .filter((v, i, a) => i === 0 || i === a.length - 1 || (axy[v][0] - axy[a[0]][0] > 70 && axy[a[a.length - 1]][0] - axy[v][0] > 70));
  const last = xy[xy.length - 1];
  const band = b => { const x0 = Xd(b.from) - 6, x1 = Xd(b.to) + 6; return `<rect class="dlband" x="${Math.max(L, x0).toFixed(1)}" y="${T}" width="${Math.max(4, Math.min(W - R, x1) - Math.max(L, x0)).toFixed(1)}" height="${H - T - B}"/>`; };
  const ref = r => { const xa = Xd(r.from), xb = Xd(r.to), y = Y(r.v).toFixed(1);
    return `<line class="ref" x1="${xa}" x2="${xb}" y1="${y}" y2="${y}"/>${xb - xa > 80 ? `<text class="reft" x="${xb}" y="${(+y - 4).toFixed(1)}" text-anchor="end">${r.label}</text>` : ""}`; };
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend chart">
    ${bands.map(band).join("")}
    ${ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${Y(t) + 3}" text-anchor="end">${fmt(t)}</text>`).join("")}
    ${xl.map(i => `<text x="${axy[i][0]}" y="${H - 8}" text-anchor="${i === 0 ? "start" : i === all.length - 1 ? "end" : "middle"}">${fmtDay(all[i].day, { month: "short", day: "numeric" })}</text>`).join("")}
    ${area ? `<path d="${area}" fill="var(--accent-soft)" opacity=".7"/>` : ""}
    ${xy.length ? `<path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>` : ""}
    ${refs.map(ref).join("")}
    ${xy.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="var(--accent)"/>`).join("")}
    ${ghosts.map(g => { const x = X(parseDay(g.day).getTime());
      return `${g.cap ? `<line class="cap" x1="${x - 7}" x2="${x + 7}" y1="${Y(g.cap)}" y2="${Y(g.cap)}"/>` : ""}<circle class="ghost${g.over ? " over" : ""}" cx="${x}" cy="${Y(g.v)}" r="3.5"/>`; }).join("")}
    ${last ? `<circle cx="${last[0]}" cy="${last[1]}" r="5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>` : ""}
    <line id="xh" x1="0" x2="0" y1="${T}" y2="${H - B}" stroke="var(--muted)" stroke-dasharray="3 3" visibility="hidden"/>
    <rect x="${L}" y="0" width="${W - L - R}" height="${H}" fill="transparent" id="hit"/>
  </svg><div class="tip" hidden></div>`;
  const svg = el.querySelector("svg"), tip = el.querySelector(".tip"), xh = el.querySelector("#xh");
  const move = ev => {
    const r = svg.getBoundingClientRect(), sx = (ev.clientX - r.left) / r.width * W;
    let bi = 0; axy.forEach((p, i) => { if (Math.abs(p[0] - sx) < Math.abs(axy[bi][0] - sx)) bi = i; });
    const p = all[bi];
    xh.setAttribute("x1", axy[bi][0]); xh.setAttribute("x2", axy[bi][0]); xh.setAttribute("visibility", "visible");
    tip.hidden = false; tip.textContent = `${fmtDay(p.day, { month: "short", day: "numeric" })} · ${fmt(p.v)} ${u}${p.ghost ? ` · deload${p.cap ? `, ceiling ${fmt(p.cap)}` : ""}` : ""}`;
    tip.style.left = (axy[bi][0] / W * r.width + 8) + "px"; tip.style.top = (axy[bi][1] / H * r.height + 8) + "px";
  };
  svg.addEventListener("pointermove", move); svg.addEventListener("pointerdown", move);
  svg.addEventListener("pointerleave", () => { tip.hidden = true; xh.setAttribute("visibility", "hidden"); });
}
// A point with a target (a deload week) gets a hatched bar and a dashed tick at the target
function barChart(el, { pts, label = "sets" }) {
  const W = 640, H = 180, L = 34, R = 8, T = 12, B = 24;
  const ticks = niceTicks(0, Math.max(10, ...pts.map(p => Math.max(p.v, p.target || 0))));
  const y1 = ticks[ticks.length - 1], Y = v => T + (1 - v / y1) * (H - T - B);
  const bw = (W - L - R) / pts.length;
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Weekly sets">
    ${ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)"/><text x="${L - 6}" y="${Y(t) + 3}" text-anchor="end">${t}</text>`).join("")}
    ${pts.map((p, i) => { const x = L + i * bw + 3, h = Math.max(0, H - B - Y(p.v)), w = bw - 6;
      return `<g class="b" data-i="${i}"><rect x="${L + i * bw}" y="${T}" width="${bw}" height="${H - T - B}" fill="transparent"/>
      ${h > 0 ? `<path d="M${x},${H - B}V${Y(p.v) + Math.min(4, h)}q0,-4 4,-4h${w - 8}q4,0 4,4V${H - B}Z" fill="${i === pts.length - 1 ? "var(--accent)" : "var(--accent-soft)"}"${p.target != null ? ` class="dlbar"` : ""}/>` : ""}
      ${p.target != null ? `<line class="cap" x1="${x - 2}" x2="${x + w + 2}" y1="${Y(p.target)}" y2="${Y(p.target)}"/>` : ""}
      ${i % 3 === 0 || i === pts.length - 1 ? `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${i === pts.length - 1 ? "now" : fmtDay(p.end, { month: "short", day: "numeric" })}</text>` : ""}</g>`; }).join("")}
  </svg><div class="tip" hidden></div>`;
  const svg = el.querySelector("svg"), tip = el.querySelector(".tip");
  svg.querySelectorAll("g.b").forEach(g => {
    const show = () => { const i = +g.dataset.i, p = pts[i], r = svg.getBoundingClientRect();
      tip.hidden = false; tip.textContent = `Week to ${fmtDay(p.end, { month: "short", day: "numeric" })} · ${p.v.toFixed(0)} ${label}${p.target != null ? ` · deload target ~${p.target.toFixed(0)}` : ""}`;
      tip.style.left = ((L + (i + .5) * bw) / W * r.width) + "px"; tip.style.top = (Y(p.v) / H * r.height) + "px"; };
    g.addEventListener("pointerenter", show); g.addEventListener("pointerdown", show);
  });
  svg.addEventListener("pointerleave", () => tip.hidden = true);
}

/* ---------- Setup (the gear): everything you set, in one place ---------- */
let draft = { name: "", pattern: "push", kind: "weight", muscles: {} };
// One screen of rows, each showing its current value; tapping a row opens its editor
function renderSettings() {
  const page = S.setupPage, t = dayKey(new Date()), eq = equip(), wk = { ...WEEK_DEFAULT, ...(S.settings.week || {}) };
  const rs = Object.values(S.routines).sort((a, b) => a.name.localeCompare(b.name));
  const cs = Object.values(S.custom).sort((a, b) => a.name.localeCompare(b.name));
  const z2 = S.settings.hrZ2, user = window.Sync?.state.user;
  const unitToggle = `<div class="unit-toggle" role="group" aria-label="Units">${["lb", "kg"].map(u => `<button type="button" data-act="unit" data-v="${u}" aria-pressed="${unit() === u}">${u}</button>`).join("")}</div>`;
  if (!page) {
    const F = fuel(t), skipN = Object.keys(prefs().skip).length, can = allEx().filter(e => canDo(e.id)).length;
    const conn = [["strava", "Strava"], ["garmin", "Garmin"]].map(([k, n]) => `${n} ${S.conn[k].st === "ok" ? "✓" : S.conn[k].st === "loading" ? "…" : "off"}`).join(" · ");
    const row = (k, n, v) => `<button class="row nav" data-act="setuppage" data-v="${k}"><span class="l"><b>${n}</b><span class="small muted val">${v}</span></span><span class="chev" aria-hidden="true">›</span></button>`;
    return `<div class="daynav"><div class="d"><div class="big">Setup</div><div class="small muted">What the coach plans from, and the app's own settings</div></div><button class="chipbtn primary" data-act="setupdone">Done</button></div>
    <section class="block">
      <h2>Your training</h2>
      <div class="list">
        ${row("goal", "Goal", `${esc(F.G.n)} · ${F.kcal.toLocaleString()} kcal · ${F.prot} g protein`)}
        ${row("week", "Week targets", `${wk.lifts} lifts · ${wk.cardio} cardio · ${wk.cardioMin} min · ${cardioTypes().filter(k => k !== "Walk").map(k => esc((CARDIO_TYPES[k] || k).toLowerCase())).join(", ") || "no cardio picked"}`)}
        ${row("sessions", "Sessions", `${autoMode() ? "Balanced, built each day" : "Your routines, in rotation"} · ${rs.length} saved routine${rs.length === 1 ? "" : "s"}`)}
        ${row("equipment", "Equipment", eq.have.map(k => esc(EQUIP[k] || k)).join(", ") || "Nothing picked: bodyweight only")}
        ${row("exercises", "Exercises", `${can} you can do · ${skipN} set aside · ${cs.length} your own`)}
        ${row("about", "About you", `${S.settings.stdSex ? (S.settings.stdSex === "m" ? "Men's" : "Women's") + " standards" : "No strength standards"}${S.settings.birthYear ? ` · born ${S.settings.birthYear}` : ""}${S.settings.heightIn ? ` · ${unit() === "kg" ? fmtHeight(S.settings.heightIn) + " cm" : fmtHeight(S.settings.heightIn) + '"'}` : ""} · ${z2 ? `Zone 2 ${z2.lo}–${z2.hi} bpm` : "Zone 2 not set"}`)}
      </div>
    </section>
    <section class="block">
      <h2>The app</h2>
      <div class="list">
        <div class="row"><div class="l"><b>Weights in</b><div class="small muted">Only changes what you see. Your log converts either way.</div></div>${unitToggle}</div>
        ${row("connections", "Connections", conn)}
        ${row("account", "Account and backup", user ? "Synced to your account" : "Saved on this device only")}
        ${(S.settings.tipsSeen || []).length ? `<div class="row"><div class="l"><b>Tips</b><div class="small muted">The short how-to notes shown the first time you use each screen.</div></div><button class="linkbtn" data-act="tipsreset">Show again</button></div>` : ""}
      </div>
    </section>
    <p class="small muted"><a href="privacy.html" style="color:var(--accent)">Privacy</a> · <a href="https://github.com/valerio86/iron-ledger" style="color:var(--accent)">About</a> · Not medical advice.</p>`;
  }
  const back = pageHead("setupback", "Setup");
  if (page === "goal") return `${back}
    <section class="block">
      <h2>Your goal</h2>
      <p class="small muted" style="margin:0">Sets the weight trend the coach steers your eating toward, using your weigh-ins. No food logging.</p>
      <div class="suggest">${Object.entries(GOALS).map(([k, g]) => `<button class="chipbtn ${nutri().goal === k ? "primary" : ""}" data-act="goal" data-v="${k}">${g.n} <span class="small">${g.r} lb/wk</span></button>`).join("")}</div>
      <div class="list"><div class="row"><div class="l"><b>Daily calories</b><div class="small muted">A starting guess the coach adjusts from your trend. Change it if you know better.</div></div>${(() => { const k = fuel(t).kcal; return `<span class="stepper" style="display:inline-flex;width:auto"><button data-act="kcal" data-d="-50" aria-label="Fewer calories">−</button><span class="num" style="min-width:52px;text-align:center">${k.toLocaleString()}</span><button data-act="kcal" data-d="50" aria-label="More calories">+</button></span>`; })()}</div></div>
    </section>`;
  if (page === "week") return `${back}
    <section class="block">
      <h2>Week targets</h2>
      <p class="small muted" style="margin:0">No fixed days. Each morning the coach picks lift, cardio or rest from the last 7 days and how recovered you are. Lifting days are usually kept apart; when you've fallen behind, the day after a lift can be one for the muscles you didn't train. How the week is going is on the Week tab.</p>
      ${weekTargetRows()}
    </section>`;
  if (page === "sessions") {
    const sch = S.settings.schedule, DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const rot = (wk.rotation || Object.keys(S.routines).sort()).filter(id => S.routines[id]);
    return `${back}
    <section class="block">
      <h2>Sessions</h2>
      <div class="list">
        <div class="row"><div class="l"><b>Lifting sessions come from ${srcBtn("reps")}</b><div class="small muted">${autoMode() ? "Built each day for balance: a lower, push and pull movement (alternating), plus what's short this week. Your routines stay here to start by hand." : "Your routines, in rotation."}</div></div>
          <div class="unit-toggle" role="group" aria-label="Lifting sessions come from">${[["auto", "Balanced"], ["routines", "Routines"]].map(([k, n]) => `<button type="button" data-act="wkmode" data-v="${k}" aria-pressed="${(autoMode() ? "auto" : "routines") === k}">${n}</button>`).join("")}</div></div>
        ${autoMode() || !rot.length ? "" : `<div class="row"><div class="l"><b>Rotation</b><div class="small muted">${rot.map((id, i) => `${i + 1}. ${esc(S.routines[id].name)}`).join(" → ")}. The coach goes in this order, but skips ahead when a routine's muscles are still tired.</div></div></div>`}
      </div>
      ${sch ? `<details class="fold"><summary>Original template week (reference)</summary><div style="overflow-x:auto;margin-top:8px"><table class="vt"><tbody>${[1, 2, 3, 4, 5, 6, 0].map(d => { const p = sch[d]; return p ? `<tr><td>${DOW[d]}</td><td style="text-align:left;font-family:var(--font-body)">${esc(p.label)}</td><td class="small" style="font-family:var(--font-body);color:var(--muted)">${esc(p.note || "")}</td></tr>` : ""; }).join("")}</tbody></table></div></details>` : ""}
      ${S.settings.rules ? `<details class="fold"><summary>Plan rules</summary><ul class="small" style="margin:8px 0 0;padding-left:18px">${S.settings.rules.map(r => `<li>${esc(r)}</li>`).join("")}</ul></details>` : ""}
    </section>
    <section class="block">
      <h2>Routines</h2>
      ${rs.length ? `<div class="list">${rs.map(r => `<div class="row"><div class="l"><b>${esc(r.name)}</b><div class="small muted routine-items">${r.items.map(it => `<span>${esc(exById(it.ex).name)} ${it.sets}×${it.r}${it.rHi && it.rHi !== it.r ? `–${it.rHi}` : ""} ${helpBtn(it.ex, exById(it.ex).name)}</span>`).join("")}</div></div><div class="rowbtns"><button class="linkbtn" data-act="editroutine" data-id="${esc(r.id)}">Edit</button><button class="linkbtn" data-act="delroutine" data-id="${esc(r.id)}" style="color:var(--bad)">${S.confirmDel === r.id ? "Confirm delete" : "Delete"}</button></div></div>`).join("")}</div>`
        : `<div class="empty small">No routines yet. Make one here, or log a workout and save it as a routine.</div>`}
      <div class="actions" style="margin-top:4px">
        <button class="btn primary" data-act="editroutine">+ New routine</button>
        ${S.sessions[S.day]?.entries?.length ? `<button class="btn" data-act="routinefromday">Save ${S.day === t ? "today's workout" : fmtDay(S.day)} as a routine</button>` : ""}
      </div>
    </section>`;
  }
  if (page === "equipment") return `${back}
    <section class="block">
      <h2>Your equipment</h2>
      <p class="small muted" style="margin:0">Tap what you own. When you start a routine, exercises that need missing gear are swapped for the closest one you can do. At a max load, progress moves to more reps and then slower reps, instead of more weight.</p>
      <div class="mgrid">${Object.entries(EQUIP).map(([k, n]) => `<button type="button" data-act="eq" data-k="${k}" data-w="${eq.have.includes(k) ? 1 : 0}" aria-pressed="${eq.have.includes(k)}">${n}</button>`).join("")}</div>
    </section>
    ${LOADABLE.some(k => eq.have.includes(k)) ? (() => { const L = plateLoad(), pm = L.mode === "plates", pb = PLATE_BARS.filter(k => eq.have.includes(k));
      const maxRow = k => `<label class="eqmax" for="eqmax-${k}"><span>${EQUIP[k]}: heaviest you can load${k === "dumbbells" || k === "kettlebell" ? " (each)" : ", bar included"}</span>
        <span class="stepper" style="display:inline-flex;width:auto"><input id="eqmax-${k}" inputmode="decimal" value="${eq.max[k] ? toDisp(eq.max[k]) : ""}" placeholder="no cap" style="width:72px"><span class="u">${unit()}</span></span></label>`;
      const wIn = (id, v, ph, lbl) => `<label class="eqin"><span class="small muted">${lbl}</span><span class="stepper" style="display:inline-flex;width:auto"><input id="${id}" inputmode="decimal" value="${v > 0 ? toDisp(v) : ""}" placeholder="${ph}" style="width:64px"><span class="u">${unit()}</span></span></label>`;
      const heaviest = k => { if (!(L.bar[k] > 0)) return k === "dumbbells" ? "Fixed dumbbells: leave the handle blank and type the max below." : "Enter the empty weight to work out the heaviest load.";
        const ex = { barbell: "deadlift", ezbar: "bb_curl", dumbbells: "db_curl" }[k], one = k === "dumbbells" ? plateKit("db_row") : null, kt = plateKit(ex);
        const m = x => `<b class="num">${fmtW(kitMax(x))}</b>${kitMax(x) >= x.limit ? " (limit)" : ""}`;
        return kt ? `Heaviest: ${m(kt)}${one ? ` a hand with two, ${m(one)} with one` : ""}` : ""; };
      return `<section class="block">
      <h2>Loads</h2>
      <div class="seg" role="group" aria-label="How to set loads">${[["max", "Just the max"], ["plates", "Bars and plates"]].map(([k, n]) => `<button data-act="loadmode" data-v="${k}" aria-pressed="${L.mode === k}">${n}</button>`).join("")}</div>
      <p class="small muted" style="margin:8px 0 0">${pm ? "Enter each bar's empty weight and the plates you own: the heaviest load is worked out, each set shows its plates per side, and warm-ups use weights you can load. A limit is optional (a bar's rating, or how much fits on short dumbbell sleeves)." : "Type the heaviest weight you can put on each. Switch to Bars and plates to have it worked out and to see plates for each set."}</p>
      ${pm ? `${pb.map(k => `<div class="eqbar"><b>${k === "dumbbells" ? "Dumbbell handle" : EQUIP[k]}</b><div class="eqins">${wIn(`bar-${k}`, L.bar[k], k === "dumbbells" ? "fixed" : "?", "Empty")}${wIn(`lim-${k}`, L.limit[k], "none", "Limit")}</div><div class="small muted">${heaviest(k)}</div></div>`).join("")}
        ${LOADABLE.filter(k => eq.have.includes(k) && (!PLATE_BARS.includes(k) || !(L.bar[k] > 0))).map(maxRow).join("")}
      <div class="list" style="margin-top:8px"><div class="row"><div class="l"><b>Plates</b><div class="small muted">Pairs you own, in lb, kg or both</div></div>
        <div class="seg" role="group" aria-label="Standard sizes to list" style="margin:0">${["lb", "kg"].map(u => `<button data-act="plateunit" data-v="${u}" aria-pressed="${L.unit === u}">${u}</button>`).join("")}</div></div></div>
      <div class="plategrid">${[...new Set([...PLATE_SIZES[L.unit].map(w => plateKey(w, L.unit)), ...Object.keys(L.plates).filter(k => L.plates[k] > 0)])].map(parsePlate).filter(Boolean).sort((a, b) => b.lb - a.lb).map(p => { const k = plateKey(p.w, p.u), n = L.plates[k] || 0; return `<div class="pg"><span class="num"><b>${p.w}</b> ${p.u}</span><span class="stepper" style="display:inline-flex;width:auto"><button data-act="pairs" data-k="${k}" data-d="-1" aria-label="One pair fewer of ${p.w} ${p.u}" ${n ? "" : "disabled"}>−</button><span class="num" style="min-width:24px;text-align:center">${n}</span><button data-act="pairs" data-k="${k}" data-d="1" aria-label="One more pair of ${p.w} ${p.u}">+</button></span></div>`; }).join("")}</div>
      ${fold("plateadd", "+ Other size", `<div class="plateadd"><input id="pa-w" inputmode="decimal" placeholder="Size" aria-label="Plate size" style="width:80px"><select id="pa-u" aria-label="Plate unit">${["lb", "kg"].map(u => `<option ${u === L.unit ? "selected" : ""}>${u}</option>`).join("")}</select><button class="btn" data-act="plateadd">Add a pair</button></div>`)}`
      : LOADABLE.filter(k => eq.have.includes(k)).map(maxRow).join("")}
      <div class="list" style="margin-top:8px"><div class="row"><div class="l"><b>Warm-up sets</b><div class="small muted">A short ramp before squats, hinges, presses and rows. Not logged as sets. ${srcBtn("warmup")}</div></div>
        <button class="chipbtn ${S.settings.warmups === false ? "" : "primary"}" data-act="warmups" aria-pressed="${S.settings.warmups !== false}">${S.settings.warmups === false ? "Off" : "On"}</button></div></div>
    </section>`; })() : ""}`;
  if (page === "exercises") {
    const view = S.exView === "map" ? "map" : "list";
    return `${back}
    <div class="seg" role="group" aria-label="Exercises view">${[["list", "Your picks"], ["map", "Map"]].map(([k, n]) => `<button data-act="exview" data-v="${k}" aria-pressed="${view === k}">${n}</button>`).join("")}</div>
    ${view === "map" ? renderExMap() : `${renderPicks()}
    <section class="block">
      <h2>Your own exercises</h2>
      ${cs.length ? `<div class="list">${cs.map(e => `<div class="row"><div class="l"><b>${esc(e.name)}</b><div class="small muted">${PATTERN_NAMES[e.pattern]} · ${Object.entries(e.muscles).map(([m, w]) => `${MUSCLES[m]?.n}${w < 1 ? " (½)" : ""}`).join(", ")}</div></div><button class="linkbtn" data-act="delex" data-id="${esc(e.id)}" style="color:var(--bad)">${S.confirmDel === e.id ? "Confirm delete" : "Delete"}</button></div>`).join("")}</div>` : `<p class="small muted" style="margin:0">${BUILTIN.length} common lifts are built in. Add anything else here.</p>`}
      ${fold("newex", "+ New exercise", `<form class="custom" id="customform">
        <input type="text" id="cx-name" placeholder="Name, e.g. Landmine press" value="${esc(draft.name)}" required>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <select id="cx-pattern" aria-label="Movement pattern">${Object.entries(PATTERN_NAMES).map(([k, v]) => `<option value="${k}" ${draft.pattern === k ? "selected" : ""}>${v}</option>`).join("")}</select>
          <select id="cx-kind" aria-label="How it's measured"><option value="weight" ${draft.kind === "weight" ? "selected" : ""}>Weight × reps</option><option value="bodyweight" ${draft.kind === "bodyweight" ? "selected" : ""}>Bodyweight reps</option><option value="time" ${draft.kind === "time" ? "selected" : ""}>Timed hold</option></select>
        </div>
        <div class="label">Muscles: tap once for primary, twice for secondary</div>
        <div class="mgrid">${Object.entries(MUSCLES).map(([m, M]) => `<button type="button" data-act="cxm" data-m="${m}" data-w="${draft.muscles[m] || 0}">${M.n}</button>`).join("")}</div>
        <button class="btn primary" type="submit">Add exercise</button>
      </form>`)}
    </section>`}`;
  }
  if (page === "about") {
    const z2Stepper = (k, v) => `<span class="stepper" style="display:inline-flex;width:auto"><button data-act="z2" data-k="${k}" data-d="-1" aria-label="Lower">−</button><span class="num" style="min-width:32px;text-align:center">${v}</span><button data-act="z2" data-k="${k}" data-d="1" aria-label="Higher">+</button></span>`;
    return `${back}
    <section class="block">
      <h2>About you</h2>
      <div class="list">
        <div class="row"><div class="l"><b>Birth year</b><div class="small muted">${S.settings.birthYear ? `Age ${ageOn(t)}. Adjusts strength levels outside 23–39${ageOn(t) > 40 ? ", recovery time, and from 50 how often deloads come" : ""}.` : "Optional. Adjusts strength levels and recovery for your age."}</div></div>
          <input class="yearin" id="birthyear" inputmode="numeric" maxlength="4" placeholder="Year" value="${S.settings.birthYear || ""}" aria-label="Birth year"></div>
        <div class="row"><div class="l"><b>Height</b><div class="small muted">${S.settings.heightIn ? "With waist and neck measurements, gives a body-fat estimate from the tape." : `Optional. With waist and neck measurements, gives a body-fat estimate from the tape. ${unit() === "kg" ? "In cm." : "Like 5'10 or 70 (inches)."}`}</div></div>
          <input class="yearin" id="heightin" inputmode="${unit() === "kg" ? "numeric" : "text"}" maxlength="6" placeholder="${unit() === "kg" ? "cm" : "ft'in"}" value="${fmtHeight(S.settings.heightIn)}" aria-label="Height"></div>
        <div class="row"><div class="l"><b>Strength standards ${srcBtn("levels")}</b><div class="small muted">Which standards your strength levels compare against. Off until you pick.</div></div>
          <div class="unit-toggle" role="group" aria-label="Strength standards">${[["m", "Men's"], ["f", "Women's"]].map(([k, n]) => `<button type="button" data-act="stdsex" data-v="${k}" aria-pressed="${S.settings.stdSex === k}">${n}</button>`).join("")}</div></div>
        <div class="row"><div class="l"><b>Zone 2 heart rate</b><div class="small muted">${z2 ? `${z2.lo}–${z2.hi} bpm${z2.source ? ` (${esc(z2.source)})` : ""}. Decides how much of a walk counts as cardio.` : "Not set, so walks don't count yet. Your Strava heart-rate zones list it as Zone 2."}</div></div>${z2 ? `${z2Stepper("lo", z2.lo)}${z2Stepper("hi", z2.hi)}` : `<button class="btn" data-act="z2set">Set</button>`}</div>
      </div>
    </section>`;
  }
  if (page === "connections") return `${back}
    <section class="block">
      <h2>Connections</h2>
      <div class="list">
        ${[["strava", "Strava", "Runs, rides and rows add fatigue to the muscles they use."], ["garmin", "Garmin", "Readiness, sleep, HRV, Body Battery, weight and body fat."]].map(([k, n, d]) => { const c = S.conn[k];
          const pill = c.st === "ok" ? `<span class="pill good">${c.n} ${k === "strava" ? "activities" : "days"}</span>` : c.st === "loading" ? `<span class="pill neutral">Loading</span>` : c.st === "off" ? `<span class="pill neutral">Not started</span>` : c.st === "soon" ? `<span class="pill neutral">Later</span>` : `<span class="pill ${c.st === "missing" ? "warn" : "bad"}">${c.st === "missing" ? "Waiting" : "Not connected"}</span>`;
          return `<div class="row"><div class="l"><b>${n}</b><div class="small muted">${c.msg ? esc(c.msg) : d}</div></div>${pill}</div>`; }).join("")}
      </div>
      ${S.conn.garmin.st !== "ok" && MCP ? `<div class="actions" style="margin-top:0"><button class="btn" data-act="retryhealth">Look for the Garmin file again</button></div>` : ""}
      ${renderStravaActions()}
      ${renderConnectorKey()}
    </section>`;
  return `${back}
    ${renderAccount()}
    <section class="block">
      <h2>Backup</h2>
      <p class="small muted" style="margin:0">${user ? "Your log is synced to your account. A backup file is still handy as an extra copy." : "Your log is saved on this device only. Download a backup now and then, or sign in above to sync it."}</p>
      <div class="actions" style="margin-top:0"><button class="btn" data-act="export">Download backup</button><button class="btn" data-act="import">Restore from backup…</button></div>
      <input type="file" id="importfile" accept="application/json,.json" hidden>
    </section>`;
}

/* ---------- Exercise preferences: controls ---------- */
function prefMark(id) {
  const sk = skipOf(id);
  return sk ? `<i class="pm ${sk.k}" title="${sk.k === "never" ? "Never suggested" : "Skipped this cycle"}">${sk.k === "never" ? "⊘" : "⏸"}</i>` : isFav(id) ? `<i class="pm fav" title="Favourite">♥</i>` : "";
}
// Skip level as a 3-way toggle; key is an exercise id or "move:<movement>"
function skipToggle(key) {
  const k = prefs().skip[key]?.k || "";
  return `<div class="unit-toggle" role="group" aria-label="Suggest ${esc(skipName(key))}">${[["", "Suggest"], ["cycle", "Skip cycle"], ["never", "Never"]].map(([v, n]) =>
    `<button type="button" data-act="skipex" data-id="${esc(key)}" data-k="${v}" aria-pressed="${k === v}">${n}</button>`).join("")}</div>`;
}
function skipNote(key) {
  const sk = prefs().skip[key];
  return sk?.k === "never" ? `<input class="skipnote" data-skipnote="${esc(key)}" value="${esc(sk.note || "")}" placeholder="Why? e.g. doctor: no overhead loading" aria-label="Why ${esc(skipName(key))} is on your never list">` : "";
}
function prefControls(id) {
  const sub = subOf(id), mv = sub && prefs().skip["move:" + sub];
  if (mv) return `<div class="small muted">Part of ${MOVE_NAMES[sub].toLowerCase()}, which is ${mv.k === "never" ? "on your never list" : "skipped this cycle"}. Change it under Your picks.</div>`;
  const rank = sub ? ranked(sub).indexOf(id) + 1 : 0;
  return `<div class="prefrow">${skipToggle(id)}${sub ? `<span class="small muted">#${rank} for ${SLOT_SUBS[sub][0].toLowerCase()}</span>`
    : `<button class="chipbtn ${isFav(id) ? "primary" : ""}" data-act="fav" data-id="${esc(id)}" aria-pressed="${isFav(id)}">♥ Favourite</button>`}</div>${skipNote(id)}`;
}
// Setup → Exercises: your order inside each main movement, and everything you've set aside
function renderPicks() {
  const P = prefs(), used = usedCounts();
  const moves = Object.keys(SLOT_SUBS).map(sub => {
    const list = ranked(sub, used), msk = P.skip["move:" + sub];
    const top = list.find(id => !skipped(id) && canDo(id));
    const rows = list.map((id, k) => `<div class="pickrow ${skipped(id) || !canDo(id) ? "off" : ""}"><span class="num muted">${k + 1}</span><span class="nm">${esc(exById(id).name)}${prefMark(id)}${!canDo(id) ? ` <span class="small muted">needs gear</span>` : ""}</span>
      <span class="rowbtns"><button class="iconbtn sm" data-act="rank" data-sub="${sub}" data-id="${esc(id)}" data-d="-1" aria-label="Move ${esc(exById(id).name)} up" ${k ? "" : "disabled"}>↑</button><button class="iconbtn sm" data-act="rank" data-sub="${sub}" data-id="${esc(id)}" data-d="1" aria-label="Move ${esc(exById(id).name)} down" ${k < list.length - 1 ? "" : "disabled"}>↓</button></span></div>`).join("");
    return fold("pick-" + sub, `<b>${SLOT_SUBS[sub][0]}</b> <span class="muted">· ${msk ? (msk.k === "never" ? "never" : "skipped this cycle") : top ? esc(exById(top).name) : "nothing you can do"}</span>`,
      `<div class="picks">${rows}<div class="prefrow"><span class="small muted">The whole movement:</span>${skipToggle("move:" + sub)}</div>${skipNote("move:" + sub)}</div>`);
  }).join("");
  const sk = Object.entries(P.skip).sort((a, b) => (a[1].k === "never") - (b[1].k === "never") || skipName(a[0]).localeCompare(skipName(b[0])));
  return `
    <section class="block">
      <h2>Your picks</h2>
      <p class="small muted" style="margin:0">${autoMode() ? "Balanced sessions" : "Balanced sessions (Setup → Sessions)"} take the first exercise in each movement that your gear and joints allow. ${srcBtn("variety")} Skipped ones are never suggested by the app, in either mode.</p>
      ${moves}
    </section>
    ${sk.length ? `<section class="block">
      <h2>Set aside</h2>
      <div class="list">${sk.map(([key, x]) => `<div class="row"><div class="l"><b>${esc(skipName(key))}</b><div class="small muted">${x.k === "never" ? "Never" : "This cycle"} · since ${fmtDay(x.since, { month: "short", day: "numeric" })}${x.k === "cycle" ? (cycleDue(x, dayKey(new Date())) ? ". Up for review: the coach is asking on Today." : ". The coach asks after your next deload.") : ""}</div>${x.k === "never" ? skipNote(key) : ""}</div><button class="linkbtn" data-act="unskip" data-id="${esc(key)}">Bring back</button></div>`).join("")}</div>
    </section>` : ""}`;
}

/* ---------- Exercise ↔ muscle map (bipartite) ---------- */
// Tap an exercise → its muscles light up; tap a muscle → the exercise list narrows to everything that trains it
function renderExMap() {
  const sel = S.libSel, pat = S.libPat || "all", today = dayKey(new Date());
  const used = {}; for (const x of allDoneSets()) used[x.ex.id] = (used[x.ex.id] || 0) + 1;
  const all = allEx(), selEx = sel?.type === "ex" ? exById(sel.id) : null, selM = sel?.type === "m" ? sel.id : null;
  const exNode = e => {
    const on = selEx?.id === e.id, lit = selM && e.muscles[selM] >= .75;
    return `<div class="exn" data-node-ex="${esc(e.id)}"><button class="node ${on ? "on" : lit ? "lit" : ""} ${selEx && !on ? "dim" : ""} ${skipped(e.id) ? "skipped" : ""}" data-act="bpex" data-id="${esc(e.id)}" title="${esc(e.name)}"><span>${esc(e.name)}</span>${prefMark(e.id)}${used[e.id] ? `<i class="used" title="You've logged this"></i>` : ""}</button>${helpBtn(e.id, e.name)}</div>`;
  };
  let exCol;
  if (selM) exCol = all.filter(e => e.muscles[selM]).sort((a, b) => b.muscles[selM] - a.muscles[selM] || a.name.localeCompare(b.name)).map(exNode).join("");
  else if (pat !== "all") exCol = all.filter(e => e.pattern === pat).map(exNode).join("");
  else exCol = Object.entries(PATTERN_NAMES).map(([k, n]) => { const g = all.filter(e => e.pattern === k); return g.length ? `<div class="glbl">${n}</div>${g.map(exNode).join("")}` : ""; }).join("");
  const musCol = ["Push", "Pull", "Legs", "Core"].map(g => `<div class="glbl">${g}</div>` + Object.keys(MUSCLES).filter(m => MUSCLES[m].g === g).map(m => {
    const on = selM === m, lit = selEx?.muscles[m], dim = (selEx && !lit) || (selM && !on);
    return `<button class="node ${on ? "on" : lit ? "lit" : ""} ${dim ? "dim" : ""}" data-act="bpm" data-id="${m}" data-node-m="${m}"><span>${MUSCLES[m].n}</span>${selEx ? "" : `<span class="k">${all.filter(e => e.muscles[m]).length}</span>`}</button>`;
  }).join("")).join("");
  let detail;
  if (selEx) {
    const chips = Object.entries(selEx.muscles).sort((a, b) => b[1] - a[1]).map(([m, w]) => `<span class="pill ${w >= .75 ? "good" : "neutral"}">${MUSCLES[m]?.n || m}${w >= .75 ? "" : " (assist)"}</span>`).join("");
    detail = `<div class="bpd"><div class="eh"><b>${esc(selEx.name)}</b>${helpBtn(selEx.id, selEx.name)}<button class="x" data-act="bpclear" aria-label="Clear selection">×</button></div>
      <div class="suggest">${chips}</div>
      <div class="small muted">${PATTERN_NAMES[selEx.pattern] || ""} · ${used[selEx.id] ? `you've logged ${used[selEx.id]} sets` : "not logged yet"}</div>
      ${prefControls(selEx.id)}
      <div><button class="chipbtn" data-act="add" data-id="${esc(selEx.id)}">+ Add to ${S.day === today ? "today" : fmtDay(S.day)}</button></div></div>`;
  } else if (selM) {
    const M = MUSCLES[selM], wk = setsPerMuscle(addDays(today, -6), today)[selM];
    const linked = all.filter(e => e.muscles[selM]), main = linked.filter(e => e.muscles[selM] >= .75).length;
    detail = `<div class="bpd"><div class="eh"><b>${M.n}</b><button class="x" data-act="bpclear" aria-label="Clear selection">×</button></div>
      <div class="small">${main} exercise${main === 1 ? "" : "s"} work it as a main mover, ${linked.length - main} as an assist. Target ${M.lo}–${M.hi} sets a week; <b class="num">${wk.toFixed(wk % 1 ? 1 : 0)}</b> in the last 7 days.</div></div>`;
  } else detail = `<p class="small muted" style="margin:0">Tap an exercise to see the muscles it works, or a muscle to see every exercise that trains it. Solid lines are main movers, dashed lines are assists, and the green dot marks lifts you've logged. The numbers count exercises per muscle.</p>`;
  const chipsRow = selM ? "" : `<div class="suggest">${[["all", "All"], ...Object.entries(PATTERN_NAMES)].map(([k, n]) => `<button class="chipbtn ${pat === k ? "primary" : ""}" data-act="bppat" data-v="${k}">${n}</button>`).join("")}</div>`;
  return `
    <section class="block" id="bpwrap">
      <h2>Exercise map</h2>
      ${detail}
      ${chipsRow}
      <div class="bp" id="bp"><svg class="links" aria-hidden="true"></svg><div class="col exs">${exCol}</div><div class="col mus">${musCol}</div></div>
    </section>`;
}
function drawLinks() {
  const bp = document.getElementById("bp"); if (!bp) return;
  const svg = bp.querySelector("svg.links"), r0 = bp.getBoundingClientRect(), sel = S.libSel;
  const mEl = {}; bp.querySelectorAll("[data-node-m]").forEach(el => mEl[el.dataset.nodeM] = el.getBoundingClientRect());
  const back = [], front = [];
  bp.querySelectorAll("[data-node-ex]").forEach(el => {
    const e = exById(el.dataset.nodeEx), a = el.getBoundingClientRect();
    for (const [m, w] of Object.entries(e.muscles)) {
      const b = mEl[m]; if (!b) continue;
      const x1 = a.right - r0.left, y1 = a.top + a.height / 2 - r0.top, x2 = b.left - r0.left, y2 = b.top + b.height / 2 - r0.top, mx = (x1 + x2) / 2;
      const d = `M${x1.toFixed(1)},${y1.toFixed(1)}C${mx.toFixed(1)},${y1.toFixed(1)} ${mx.toFixed(1)},${y2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
      const lit = sel && (sel.type === "ex" ? sel.id === e.id : sel.id === m);
      if (lit) front.push(`<path d="${d}" fill="none" stroke="var(--accent)" stroke-width="${(1 + 2 * w).toFixed(1)}"${w < .75 ? ` stroke-dasharray="4 3"` : ""}/>`);
      else back.push(`<path d="${d}" fill="none" stroke="var(--muted)" stroke-width="${(.5 + w).toFixed(1)}" stroke-opacity="${sel ? .06 : (.12 + .2 * w).toFixed(2)}"/>`);
    }
  });
  svg.innerHTML = back.join("") + front.join("");
}

/* ---------- Add-exercise sheet ---------- */
function openAdd(q = "") {
  const c = coach(S.day);
  const fat = c.fatPre;
  const groups = {};
  const ql = q.trim().toLowerCase();
  for (const e of allEx()) {
    if (ql && !e.name.toLowerCase().includes(ql) && !Object.keys(e.muscles).some(m => MUSCLES[m]?.n.toLowerCase().includes(ql))) continue;
    (groups[e.pattern] ||= []).push(e);
  }
  const actx = { ...adviceCtx(S.day), noAlts: true };
  const advs = Object.fromEntries(allEx().map(e => [e.id, exerciseAdvice(e.id, S.day, actx)]));
  const tag = e => {
    const a = advs[e.id];
    if (!canDo(e.id)) return `<span class="pill neutral">Needs gear</span>`;
    const sk = skipOf(e.id);
    if (sk) return `<span class="pill neutral">${sk.k === "never" ? "Never list" : "Skipped"}</span>`;
    if (S.addFor) return "";
    if (a.lvl >= 2) return `<span class="pill bad">Not now</span>`;
    if (a.lvl === 1) return `<span class="pill warn">Caution</span>`;
    const rec = Object.entries(e.muscles).some(([m, w]) => w >= .75 && readiness(fat[m]) === "rec");
    return `<span class="pill ${rec ? "neutral" : "good"}">${rec ? "Recovering" : "Good"}</span>`;
  };
  const why = e => advs[e.id].lvl && !S.addFor ? `<div class="small" style="color:var(--${advs[e.id].lvl >= 2 ? "bad" : "warn"})">${esc(advs[e.id].reasons[0])}</div>` : "";
  $("#sheet").innerHTML = `<div class="sheet-bg" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Add exercise">
    <div class="sh"><div style="display:flex;justify-content:space-between;align-items:center"><h2>${S.addFor ? "Add to routine" : "Add exercise"}</h2><button class="x iconbtn" data-act="closesheet" aria-label="Close">×</button></div>
    <input class="search" id="exsearch" placeholder="Search by name or muscle" value="${esc(q)}" autocomplete="off"></div>
    <div class="sb">${!ql && !S.addFor && c.gaps.length && c.exSuggest.length ? `<div class="label grouphdr">Fresh and short this week</div><div class="suggest" style="margin-bottom:6px">${c.exSuggest.map(e => `<button class="chipbtn" data-act="add" data-id="${esc(e.id)}">+ ${esc(e.name)}</button>`).join("")}</div>` : ""}
    ${Object.entries(PATTERN_NAMES).filter(([k]) => groups[k]).map(([k, n]) => `<div class="label grouphdr">${n}</div>` + groups[k].map(e => `
      <div class="exline"><button class="exrow" data-act="add" data-id="${esc(e.id)}"><div class="l"><div>${esc(e.name)}</div><div class="small muted">${Object.entries(e.muscles).filter(([, w]) => w >= .75).map(([m]) => MUSCLES[m]?.n).join(" · ")}</div>${why(e)}</div>${tag(e)}</button>${helpBtn(e.id, e.name)}</div>`).join("")).join("") || `<p class="muted">No match. Add it under Setup → Exercises.</p>`}</div>
  </div></div>`;
  const inp = $("#exsearch"); inp.focus(); inp.setSelectionRange(q.length, q.length);
  inp.oninput = () => openAdd(inp.value);
}
// Swap one exercise on Today: just for today, or from now on (it moves to the top of its movement); or stop suggesting it
// o = { i } for an exercise already on Today, or { pre, orig, rid } for one in the plan before Start
// (pre: the exercise shown, orig: what the plan had there, rid: the plan's routine)
function openSwap(o) {
  const exId = o.pre || S.sessions[S.day]?.entries?.[o.i]?.ex; if (!exId) return;
  const e = { ex: exId }, tgt = o.pre ? `data-pre="${esc(o.pre)}" data-orig="${esc(o.orig)}" data-rid="${esc(o.rid || "")}"` : `data-i="${o.i}"`;
  const ex = exById(e.ex), sub = subOf(e.ex), ctx = adviceCtx(S.day), actx = { ...ctx, noAlts: true };
  const same = sub ? ranked(sub).filter(id => id !== e.ex && canDo(id)) : [];
  const sim = similarEx(e.ex, S.day, ctx, 5).map(x => x.id).filter(id => !same.includes(id));
  const routine = S.routines[o.pre ? o.rid : S.sessions[S.day]?.routine], base = o.pre ? o.orig : exId;
  // "From now on": balanced sessions follow your order; a routine gets the exercise replaced in it
  const always = sub && autoMode() ? "Balanced sessions will pick it first" : routine?.items.some(x => x.ex === base) ? `Replaces it in ${routine.name}` : null;
  // In balanced mode "from now on" reorders the movement, so it only makes sense inside the same movement
  const row = id => { const a = exerciseAdvice(id, S.day, actx), sk = skipOf(id), keep = always && !sk && (!autoMode() || subOf(id) === sub);
    return `<div class="swaprow"><div class="l"><div>${esc(exById(id).name)} ${helpBtn(id, exById(id).name)}</div>${sk ? `<div class="small muted">${sk.k === "never" ? "On your never list" : "Skipped this cycle"}</div>` : a.lvl ? `<div class="small" style="color:var(--${a.lvl >= 2 ? "bad" : "warn"})">${esc(a.reasons[0])}</div>` : ""}</div>
      <div class="rowbtns"><button class="chipbtn" data-act="swap" ${tgt} data-id="${esc(id)}">Today</button>${keep ? `<button class="chipbtn" data-act="swapalways" ${tgt} data-id="${esc(id)}">From now on</button>` : ""}</div></div>`; };
  const sk = skipOf(e.ex);
  $("#sheet").innerHTML = `<div class="sheet-bg" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Swap ${esc(ex.name)}">
    <div class="sh"><div style="display:flex;justify-content:space-between;align-items:center"><h2>Swap ${esc(ex.name)}</h2><button class="x iconbtn" data-act="closesheet" aria-label="Close">×</button></div>
    <p class="small muted" style="margin:4px 0 0">${srcBtn("variety")} <b>Today</b> is a one-off: next time the plan is back to normal.${always ? ` <b>From now on:</b> ${esc(always)}.` : ""}</p></div>
    <div class="sb">
      ${same.length ? `<div class="label grouphdr">${MOVE_NAMES[sub]}, in your order</div>${same.map(row).join("")}` : ""}
      ${sim.length ? `<div class="label grouphdr">Same muscles</div>${sim.map(row).join("")}` : ""}
      ${!same.length && !sim.length ? `<p class="muted">Nothing similar you can do with your gear.</p>` : ""}
      <div class="label grouphdr">Stop suggesting ${esc(ex.name)}</div>
      ${sk ? `<p class="small muted" style="margin:0">Already ${sk.k === "never" ? "on your never list" : "skipped this cycle"}.</p>` : `<div class="swaps">
        <button class="chipbtn" data-act="skipex" data-id="${esc(e.ex)}" data-k="cycle" ${tgt}>For this cycle</button>
        <button class="chipbtn" data-act="skipex" data-id="${esc(e.ex)}" data-k="never" ${tgt}>Never</button></div>
      <p class="small muted" style="margin:0">This cycle: the coach asks after your next deload whether to bring it back. Never: it isn't suggested again (you can still add it). Either way, ${o.pre ? "the plan" : "today's"} switches to your next choice.</p>`}
    </div>
  </div></div>`;
}
function openRoutines() {
  const c = coach(S.day);
  $("#sheet").innerHTML = `<div class="sheet-bg" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Start routine">
    <div class="sh"><div style="display:flex;justify-content:space-between;align-items:center"><h2>Start routine</h2><button class="x iconbtn" data-act="closesheet" aria-label="Close">×</button></div></div>
    <div class="sb">${c.routineScores.map((x, i) => `<button class="exrow" data-act="routine" data-id="${esc(x.r.id)}"><div class="l"><div>${esc(x.r.name)}</div><div class="small muted">${x.r.items.map(it => esc(exById(it.ex).name)).join(" · ")}</div></div>${i === 0 ? `<span class="pill good">Best fit today</span>` : x.score < 0 ? `<span class="pill bad">Muscles tired</span>` : ""}</button>`).join("")}</div>
  </div></div>`;
}
// Closing the exercise picker while editing a routine goes back to the editor; force closes everything
function closeSheet(force) {
  S.liveSheet = null;
  if (force) S.addFor = S.rEdit = null;
  if (S.addFor === "routine") { S.addFor = null; openRoutineEditor(); return; }
  $("#sheet").innerHTML = "";
}

/* ---------- Routine editor ---------- */
// S.rEdit is the draft: { id (null when new), name, items: [{ ex, sets, r, rHi, w }] }
function editRoutine(id) {
  const r = id && S.routines[id];
  S.rEdit = r ? { id, name: r.name, items: r.items.map(it => ({ ...it })) } : { id: null, name: "", items: [] };
  openRoutineEditor();
}
function routineFromDay() {
  const s = S.sessions[S.day];
  S.rEdit = { id: null, name: "", items: s.entries.map(e => ({ ex: e.ex, sets: e.sets.length, r: e.rLo || e.sets[0]?.r || 8, ...(e.rHi ? { rHi: e.rHi } : {}), w: e.sets[0]?.w || 0 })) };
  openRoutineEditor();
}
function openRoutineEditor() {
  const R = S.rEdit, n = R.items.length;
  const items = R.items.map((it, k) => { const ex = exById(it.ex), u = ex.kind === "time" ? "Seconds" : "Reps";
    return `<div class="re-item">
      <div class="re-top"><div><b>${esc(ex.name)}</b> ${helpBtn(it.ex, ex.name)}</div>
        <div class="rowbtns"><button class="iconbtn sm" data-act="re-move" data-k="${k}" data-d="-1" aria-label="Move ${esc(ex.name)} up" ${k ? "" : "disabled"}>↑</button><button class="iconbtn sm" data-act="re-move" data-k="${k}" data-d="1" aria-label="Move ${esc(ex.name)} down" ${k < n - 1 ? "" : "disabled"}>↓</button><button class="iconbtn sm" data-act="re-rm" data-k="${k}" aria-label="Remove ${esc(ex.name)}">×</button></div></div>
      <div class="re-nums">
        <div><span class="label">Sets</span><span class="stepper"><button data-act="re-sets" data-k="${k}" data-d="-1" aria-label="Fewer sets" ${it.sets > 1 ? "" : "disabled"}>−</button><span class="num">${it.sets}</span><button data-act="re-sets" data-k="${k}" data-d="1" aria-label="More sets" ${it.sets < 10 ? "" : "disabled"}>+</button></span></div>
        <div><span class="label">${u}</span><span class="re-range"><input id="re-r-${k}" data-re="r" data-k="${k}" inputmode="numeric" value="${it.r}" aria-label="${u}, lowest"><span>to</span><input id="re-rhi-${k}" data-re="rHi" data-k="${k}" inputmode="numeric" value="${it.rHi && it.rHi !== it.r ? it.rHi : ""}" placeholder="—" aria-label="${u}, highest (optional)"></span></div>
      </div></div>`; }).join("");
  $("#sheet").innerHTML = `<div class="sheet-bg" data-act="closesheet"><div class="sheet" role="dialog" aria-label="${R.id ? "Edit routine" : "New routine"}">
    <div class="sh"><div style="display:flex;justify-content:space-between;align-items:center"><h2>${R.id ? "Edit routine" : "New routine"}</h2><button class="x iconbtn" data-act="closesheet" aria-label="Close">×</button></div>
    <input class="search" id="re-name" placeholder="Name, e.g. Upper A" value="${esc(R.name)}" autocomplete="off"></div>
    <div class="sb re">
      ${items || `<p class="small muted" style="margin:0">No exercises yet. Add them in the order you'll do them.</p>`}
      <p class="small muted" style="margin:0">A rep range (say 8 to 12) lets the coach add reps first, then weight once you reach the top of the range. The starting weight comes from your last session.</p>
    </div>
    <div class="sf"><button class="btn" data-act="re-add">+ Add exercise</button><button class="btn primary" data-act="re-save">Save routine</button></div>
  </div></div>`;
  $("#re-name").oninput = ev => { R.name = ev.target.value; };
}
async function saveRoutine() {
  const R = S.rEdit, name = R.name.trim();
  if (!name) { toast("Give the routine a name first"); $("#re-name").focus(); return; }
  if (!R.items.length) { toast("Add at least one exercise"); return; }
  let id = R.id;
  if (!id) { id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || uid(); if (S.routines[id]) id += "-" + uid().slice(0, 4); }
  const items = R.items.map(({ rHi, ...it }) => rHi > it.r ? { ...it, rHi } : it);
  const { id: _, ...prev } = S.routines[id] || {};
  const doc = { ...prev, name, items };
  S.routines[id] = { ...doc, id };
  const wk = S.settings.week;
  if (!R.id && wk?.rotation) { S.settings = { ...S.settings, week: { ...wk, rotation: [...wk.rotation, id] } }; saveDoc("settings/main", S.settings); }
  closeSheet(true); render(); await saveDoc("routines/" + id, doc); toast(`Saved ${name}`);
}

/* ---------- Sources: the evidence behind a rule, one tap away ---------- */
const SOURCES = {
  deload: { t: "Why a deload week", p: [
    "A deload is a planned lighter stretch that lets fatigue clear so the next block of training lands better. Coaches agree it can be scheduled (every 4–6 weeks is common) or triggered by signs of fatigue, and that the main lever is <b>fewer sets</b>, with weights the same or a little lower and the same number of training days.",
    "A full week off isn't the same thing: in one trial, a week of no lifting slightly slowed strength gains compared with training straight through. So Iron Ledger keeps you lifting, just less."],
    refs: [["Bell et al. 2023, Delphi consensus on deloading (Sports Medicine – Open)", "https://doi.org/10.1186/s40798-023-00633-0"], ["Coleman et al. 2024, a one-week deload during training (PeerJ)", "https://peerj.com/articles/16777"]] },
  volume: { t: "Sets per muscle", p: [
    "Weekly hard sets per muscle drive both growth and strength, with diminishing returns: about 10–20 sets a week covers most of the benefit, and strength flattens out sooner than size. Newer lifters get most of it from the low end.",
    "A set counts fully for the muscle it mainly works and partly for helpers (½ for a row's biceps, for example). That fractional count matched results best in the largest analysis so far."],
    refs: [["Pelland et al. 2024, volume and frequency dose–response meta-regressions (SportRxiv)", "https://sportrxiv.org/index.php/server/preprint/view/537"], ["Ralston et al. 2017, weekly set volume and strength (Sports Medicine)", "https://pubmed.ncbi.nlm.nih.gov/28755103/"]] },
  reps: { t: "Reps, load and effort", p: [
    "Muscles grow about as well with light or heavy weights, as long as sets end close to failure; moderate loads (roughly 6–15 reps) are simply the most time-efficient. Strength is more specific: heavier, lower-rep work on the lift itself builds a bigger 1-rep max.",
    "How close to failure matters more for size than for strength. Stopping with 1–3 reps left is a good default; strength work can stop 3–5 short."],
    refs: [["Schoenfeld et al. 2021, the repetition continuum re-examined (Sports)", "https://doi.org/10.3390/sports9020032"], ["Robinson et al. 2024, proximity to failure (FAU summary)", "https://www.fau.edu/newsdesk/articles/muscle-growth-strength-study"]] },
  levels: { t: "Strength levels", p: [
    "Each lift's level compares your best set in the last 8 weeks (as an estimated 1-rep max, or reps for bodyweight moves) with bodyweight-ratio bands for beginner, novice, intermediate, advanced and elite, scaled to your weight.",
    "The bands are Iron Ledger's own blend of widely published standards (several online calculators, the Kilgore tables on ExRx), and dumbbell or variant lifts are converted from their barbell versions. Treat a level as give or take half a step. They're for spotting balance, not a test: no study links particular ratios between lifts to injury.",
    "A movement a full level behind your others gets flagged, so it can get more attention.",
    "With a birth year set, the standards are adjusted outside ages 23–39 using powerlifting's age coefficients (McCulloch for 40 and over, Foster for juniors): at 50 a lift counts about 13% more, at 60 about 34%."],
    refs: [["ExRx strength standards (Kilgore)", "https://exrx.net/Questions/StrengthTests"], ["van den Hoek et al. 2024, powerlifting norms from 809,986 entries (JSAMS)", "https://pubmed.ncbi.nlm.nih.gov/39060209/"], ["Strength Level, community standards", "https://strengthlevel.com/strength-standards"], ["McCulloch masters age coefficients (APF table)", "https://worldpowerliftingcongress.com/wp-content/uploads/2015/02/Glossbrenner.htm"]] },
};
SOURCES.b2b = { t: "Lifting two days running", p: [
    "When the weekly sets are the same, spreading them over more days gives about the same strength and size as fewer, longer sessions. In one trial, 3 and 6 sessions a week did equally well. So lifting the day after a lift isn't a problem in itself.",
    "What needs rest is the muscle. Sets taken to failure slow recovery for 24–48 hours, so the same muscles trained hard again the next day start the session tired. Iron Ledger allows a second day running when you've fallen behind, keeps it to the muscles you didn't work hard yesterday, and suggests stopping sets a few reps short."],
    refs: [["Saric et al. 2019, training 3 vs 6 times a week (J Strength Cond Res)", "https://pubmed.ncbi.nlm.nih.gov/30363041/"], ["Morán-Navarro et al. 2017, recovery after sets to failure or not (Eur J Appl Physiol)", "https://doi.org/10.1007/s00421-017-3725-7"], ["Pelland et al. 2024, volume and frequency dose–response (SportRxiv)", "https://sportrxiv.org/index.php/server/preprint/view/537"]] };
SOURCES.variety = { t: "Changing exercises", p: [
  "Swapping one exercise for another that trains the same muscles doesn't cost you size or strength, and it can help: in a trial where trained men got a random set of exercises each session, gains were about the same as sticking with one set, and they enjoyed training more. A 2024 trial in women found the same.",
  "A systematic review adds the nuance: some <b>planned</b> variation (different angles for the same muscle) can spread growth more evenly across a muscle, while frequent, random switching can hold back gains, especially on skill-heavy lifts like the squat, where getting better at the movement is part of getting stronger.",
  "So Iron Ledger keeps your main lifts steady through a training block so progress can be tracked, and offers a change at the start of the next block or when a lift stalls. A one-off swap any day is fine."],
  refs: [["Kassiano et al. 2022, systematic review of exercise variation (J Strength Cond Res)", "https://pubmed.ncbi.nlm.nih.gov/35438660/"], ["Baz-Valle et al. 2019, random exercise variation in trained men (PLoS One)", "https://doi.org/10.1371/journal.pone.0226989"], ["Kassiano et al. 2024, constant vs varied exercises in women (Res Q Exerc Sport)", "https://ro.ecu.edu.au/ecuworks2022-2026/4912"]] };
SOURCES.warmup = { t: "Warm-up sets", p: [
  "A few lighter sets of the lift itself before the working sets is standard practice in strength coaching: it rehearses the movement and lets you check how the weight moves, without tiring you out. Studies that compared warm-up styles found that a lift-specific ramp like this leads to as many or more reps in the working sets, while long stretching beforehand can cost a little.",
  "Iron Ledger ramps to about 40%, 60% and (from 90 lb) 80% of your first working weight, with fewer reps as it gets heavier, rounded to what your plates can make. Small accessories don't need it. Warm-up steps aren't logged, so they never count as sets."],
  refs: [["Ribeiro et al. 2014, warm-up procedures and resistance training performance (Perceptual and Motor Skills)", "https://pubmed.ncbi.nlm.nih.gov/?term=Ribeiro+2014+warm-up+procedures+resistance+training+performance"], ["McCrary et al. 2015, systematic review of upper-body warm-ups (Br J Sports Med)", "https://pubmed.ncbi.nlm.nih.gov/?term=McCrary+2015+upper+body+warm-up+systematic+review"], ["NSCA, Essentials of Strength Training and Conditioning (warm-up chapter)", "https://www.nsca.com/education/books/essentials-of-strength-training-and-conditioning/"]] };
SOURCES.tape = { t: "Tape vs the scale's body fat", p: [
  "Home scales estimate body fat by bioelectrical impedance: a small current runs through your feet, and a formula turns the resistance into fat and muscle using your height, weight, age and sex. The current follows water, so the reading moves with hydration, a recent meal or workout, and even skin temperature. Training changes how much water your muscles hold, which is exactly when these scales get less reliable. Comparisons against DEXA find they miss individual changes by more than the changes you're trying to see over a few months.",
  "A tape is low-tech but direct. On a lean bulk, the waist is the best simple fat signal: if weight climbs while the waist stays about flat (under a quarter inch, about 0.6 cm, a month) and arms, chest or thighs grow, most of the gain is muscle. Iron Ledger trims the calorie target by about 100 a day when the waist rises faster than that even though weight is on target.",
  "With height, the US Navy method turns waist and neck (and hips, for women) into a body-fat estimate. For a single person it can be 3–4 points off DEXA in either direction, but because the error is mostly a fixed offset, its trend is much steadier than a scale's daily number.",
  "Measure every 2 weeks, in the morning before eating, same spots and same side, tape snug but not pressing in. Changes smaller than about a quarter inch are within measuring error."],
  refs: [["Hodgdon & Beckett 1984, the Navy circumference equations (Naval Health Research Center)", "https://apps.dtic.mil/sti/citations/ADA143890"], ["Kyle et al. 2004, bioelectrical impedance analysis in practice (Clinical Nutrition)", "https://pubmed.ncbi.nlm.nih.gov/15556267/"], ["Ross et al. 2020, waist circumference as a vital sign (Nature Reviews Endocrinology)", "https://pubmed.ncbi.nlm.nih.gov/31959973/"]] };
function srcBtn(key) { return `<button class="help src" data-act="src" data-k="${key}" aria-label="Sources: ${esc(SOURCES[key].t)}">?</button>`; }
function openSource(key) {
  const x = SOURCES[key]; if (!x) return;
  $("#help").innerHTML = `<div class="sheet-bg" data-act="closehelp"><div class="sheet guide" role="dialog" aria-modal="true" aria-labelledby="src-title">
    <div class="sh"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 id="src-title">${x.t}</h2><button class="x iconbtn" data-act="closehelp" aria-label="Close">×</button></div></div>
    <div class="sb">${x.p.map(t => `<p>${t}</p>`).join("")}
      <h3>Sources</h3><ul class="srcs">${x.refs.map(([n, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(n)}</a></li>`).join("")}</ul>
      <p class="small muted">Summaries of the research, not medical advice.</p></div></div></div>`;
  $("#help .x").focus();
}

/* ---------- The exercise sheet ---------- */
// One sheet per exercise, opened by its ? button anywhere: how to do it, how you're doing, and whether you want it suggested
function helpBtn(exId, name) { return `<button class="help" data-act="help" data-id="${esc(exId)}" aria-label="How to do ${esc(name)}">?</button>`; }
function openHelp(exId, sec = "how", keep) {
  const ex = exById(exId), g = GUIDE[exId], today = dayKey(new Date());
  S.helpEx = { id: exId, sec };
  const mus = Object.entries(ex.muscles).sort((a, b) => b[1] - a[1]);
  const chips = mus.map(([m, w]) => `<span class="pill ${w >= .75 ? "good" : "neutral"}">${MUSCLES[m]?.n || m}${w >= .75 ? "" : " (assist)"}</span>`).join("");
  const sect = (title, items, cls = "") => items?.length ? `<h3>${title}</h3><ul class="${cls}">${items.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : "";
  const gear = missingFor(exId).length ? `<p class="hint info">Needs ${esc(missingFor(exId).join(" and "))}, which isn't in your equipment list (Setup → Equipment) yet.</p>` : "";
  let body;
  if (sec === "nums") {
    const t = liftTrend(exId, today);
    if (!t) body = `<p class="muted">You haven't logged this one yet. Your estimate, trend and level show up here after the first session.</p>`;
    else {
      const best = Math.max(...t.h.map(r => r.score)), bs = ex.kind === "weight" ? bestSet(exId) : null, last = t.h[t.h.length - 1], lvl = liftLevel(exId, today);
      body = `<div class="hero"><div class="label">${ex.kind === "weight" ? "Strength estimate" : ex.kind === "time" ? "Longest hold" : "Most reps in a set"}</div>
          <div class="herov"><span class="num big">${t.fmt(t.last.score)}</span><span class="small muted"> ${t.unitTxt}</span>${trendHtml(t.trend)}</div></div>
        <div class="exspark">${spark(t.hl.slice(-12).map(r => r.score))}</div>
        <p class="small muted num">Best ${t.fmt(best)} ${t.unitTxt}${bs ? ` · from ${toDisp(bs.w)} × ${bs.r}` : ""} · last done ${fmtDay(last.day)} (${doneSets(last.e).map(s => ex.kind === "weight" ? `${toDisp(s.w)}×${s.r}` : s.r).join(", ")})</p>
        ${lvl ? `<p class="small"><span class="pill ${lvl.score >= 3 ? "good" : "neutral"}">${lvl.level}${lvl.capped ? "+" : ""}</span>${lvl.next ? ` <span class="muted">${LEVELS[Math.floor(lvl.score)]} starts at ${lvl.kind === "reps" ? `${Math.ceil(lvl.next)} reps` : `${fmtW(lvl.next)}${PER_HAND.has(ex.id) ? " each" : ""} est. max`}</span>` : ""}</p>` : ""}
        <div><button class="btn" data-act="progpage" data-v="lift:${esc(exId)}">Full charts ›</button></div>`;
    }
  } else if (sec === "pref") {
    const sub = subOf(exId), list = sub && !prefs().skip["move:" + sub] ? ranked(sub) : null, k = list ? list.indexOf(exId) : -1;
    body = `<p class="small muted">Whether the coach suggests this exercise, and where it sits among your choices for the same movement. Skipping for a cycle lasts until your next deload, when the coach asks again.</p>
      ${prefControls(exId)}
      ${k >= 0 ? `<div class="prefrow"><span class="small">Move it in your order for ${SLOT_SUBS[sub][0].toLowerCase()}</span><span class="rowbtns"><button class="iconbtn sm" data-act="rank" data-sub="${sub}" data-id="${esc(exId)}" data-d="-1" aria-label="Move ${esc(ex.name)} up" ${k ? "" : "disabled"}>↑</button><button class="iconbtn sm" data-act="rank" data-sub="${sub}" data-id="${esc(exId)}" data-d="1" aria-label="Move ${esc(ex.name)} down" ${k < list.length - 1 ? "" : "disabled"}>↓</button></span></div>` : ""}
      ${gear}`;
  } else body = `${g ? `${sect("Setup", g.s)}${sect("The rep", g.r, "steps")}${sect("Posture cues", g.c, "cues")}${sect("Common mistakes", g.m, "mistakes")}`
        : `<p class="muted">This is one of your own exercises, so there's no write-up for it. General rules: brace your abs before each rep, move through a full range you can control, and lower the weight more slowly than you lift it.</p>`}
      <p class="hint warn" style="margin-top:14px">${GUIDE_ALWAYS}</p>${gear}`;
  const html = `<div class="sheet-bg" data-act="closehelp"><div class="sheet guide" role="dialog" aria-modal="true" aria-labelledby="guide-title" data-live="ex">
    <div class="sh"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 id="guide-title">${esc(ex.name)}</h2><button class="x iconbtn" data-act="closehelp" aria-label="Close">×</button></div>
      <div class="suggest">${chips}</div>
      <div class="seg" role="group" aria-label="About this exercise">${[["how", "How to"], ["nums", "Your numbers"], ["pref", "Suggest it?"]].map(([v, n]) => `<button data-act="helpsec" data-v="${v}" aria-pressed="${sec === v}">${n}</button>`).join("")}</div></div>
    <div class="sb">${body}</div></div></div>`;
  if (keep) setLayer("#help", html); else { $("#help").innerHTML = html; $("#help .x").focus(); }
  S.liveHelp = () => { if (S.helpEx && $("#help [data-live=ex]")) openHelp(S.helpEx.id, S.helpEx.sec, true); else S.liveHelp = null; };
}
function closeHelp() { S.liveHelp = S.helpEx = null; $("#help").innerHTML = ""; }

/* ============================== Actions ============================== */
function newEntry(exId, day) {
  const ex = exById(exId);
  const p = progression(exId, day);
  const dp = deloadDay(day) && deloadPlan(exId, day);   // added during a deload week: start it light too
  if (dp) return { id: uid(), ex: exId, sets: Array.from({ length: dp.n }, () => ({ w: dp.w, r: dp.r, done: false })), effort: null, dl: { n: dp.n, w: dp.w, r: dp.r },
    ...(dp.last.e.rHi ? { rLo: dp.last.e.rLo, rHi: dp.last.e.rHi } : {}) };
  if (p?.last) {
    const sets = p.last.e.sets.map(s => ({ w: s.w || 0, r: s.r, done: false }));
    return { id: uid(), ex: exId, sets, effort: null, ...(p.last.e.rHi ? { rLo: p.last.e.rLo, rHi: p.last.e.rHi } : {}) };
  }
  const r = ex.kind === "time" ? 30 : ex.kind === "bodyweight" ? 10 : 8;
  return { id: uid(), ex: exId, sets: Array.from({ length: 3 }, () => ({ w: 0, r, done: false })), effort: null };
}
// Replace an entry on this day with another exercise, keeping its rep range when the kind matches
// Swaps made on the plan card before Start (session.pre = { planned exercise: swap }), for this day only
function applyPre(items, day) {
  const pre = S.sessions[day]?.pre || {};
  return items.map(it => {
    const to = pre[it.ex]; if (!to || to === it.ex) return it;
    const k = exById(to).kind, same = k === exById(it.ex).kind;
    return { ex: to, sets: it.sets, r: same ? it.r : k === "time" ? 30 : 8, rHi: same ? it.rHi : k === "time" ? 45 : 12, w: 0, from: it.ex };
  });
}
// A balanced session's movements after plan swaps: a swap into another movement takes that turn with it
function slotsAfter(slots, items) {
  return slots && [...new Set(slots.map(sub => { const it = items.find(x => subOf(x.from || x.ex) === sub); return it ? subOf(it.ex) : sub; }).filter(Boolean))];
}
function swapEntry(i, id) {
  mutate(s => {
    const old = s.entries[i], ne = newEntry(id, S.day);
    if (!historyFor(id, S.day).length) ne.sets = old.sets.map(x => ({ w: 0, r: exById(id).kind === "time" ? 30 : x.r, done: false }));
    if (old.rHi && exById(id).kind === exById(old.ex).kind) { ne.rLo = old.rLo; ne.rHi = old.rHi; }
    s.entries[i] = ne;
    // A balanced session remembers which movements it trained: a swap into another movement moves that turn with it
    const fs = subOf(old.ex), ts = subOf(id);
    if (s.slots && fs && fs !== ts && s.slots.includes(fs)) s.slots = [...new Set(s.slots.map(x => x === fs ? ts : x).filter(Boolean))];
  });
}
// Swap an exercise in your routines (just `only` when given). Returns how many changed.
async function replaceInRoutines(from, to, only) {
  let n = 0;
  for (const r of Object.values(S.routines)) {
    if ((only && r.id !== only) || !r.items.some(x => x.ex === from) || r.items.some(x => x.ex === to)) continue;
    const same = exById(from).kind === exById(to).kind;
    r.items = r.items.map(x => x.ex !== from ? x : same ? { ...x, ex: to, w: 0 } : { ex: to, sets: x.sets, r: exById(to).kind === "time" ? 30 : 8, rHi: exById(to).kind === "time" ? 45 : 12, w: 0 });
    const { id, ...doc } = r; await saveDoc("routines/" + id, doc); n++;
  }
  render(); return n;
}
function setPre(orig, to) { mutate(s => { s.pre = { ...(s.pre || {}) }; if (!to || to === orig) delete s.pre[orig]; else s.pre[orig] = to; if (!Object.keys(s.pre).length) delete s.pre; }); }
function mutate(fn) { const s = sessionDoc(S.day); fn(s); saveDay(S.day); render(); }
function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => el.hidden = true, 2600); }

document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act, i = +b.dataset.i, j = +b.dataset.j;
  if ((act === "closesheet" || act === "closehelp") && ev.target !== b && b.classList.contains("sheet-bg")) return;
  if (act === "help") { openHelp(b.dataset.id); return; }
  if (act === "helpsec") { if (S.helpEx) openHelp(S.helpEx.id, b.dataset.v, true); return; }
  if (act === "src") { openSource(b.dataset.k); return; }
  if (act === "closehelp") { closeHelp(); return; }
  const E = () => sessionDoc(S.day).entries[i];
  switch (act) {
    case "bodysel": S.bodySel = S.bodySel === b.dataset.k ? null : b.dataset.k; render(); break;
    // Getting around: tabs, Setup and Progress pages, earlier weeks
    case "tab": S.tab = b.dataset.v; S.weekOff = 0; render(); window.scrollTo(0, 0); break;
    case "setuppage": S.setupPage = b.dataset.v; S.confirmDel = null; render(); window.scrollTo(0, 0); break;
    case "setupback": S.setupPage = null; render(); window.scrollTo(0, 0); break;
    case "setupdone": S.tab = S.prevTab || "today"; S.setupPage = null; render(); window.scrollTo(0, 0); break;
    case "progpage": closeHelp(); closeSheet(true); S.tab = "progress"; S.progPage = b.dataset.v; render(); window.scrollTo(0, 0); break;
    case "progback": S.progPage = S.progPage?.startsWith("lift:") ? "strength" : null; render(); window.scrollTo(0, 0); break;
    case "exview": S.exView = b.dataset.v; render(); break;
    case "weekpage": S.weekOff = Math.max(0, (S.weekOff || 0) + +b.dataset.d); S.bodySel = null; render(); window.scrollTo(0, 0); break;
    case "weekack": { const a = weekAcks(); a[b.dataset.id] = dayKey(new Date()); try { localStorage.setItem("il-week-ack", JSON.stringify(a)); } catch {} render(); toast("Quiet for the week"); break; }
    // Today's sheets and the coach's questions
    case "logsheet": openLog(); break;
    case "bodysheet": openBody(!!b.dataset.focus); break;
    case "elsesheet": openElse(); break;
    case "asknext": S.askI = (S.askI || 0) + 1; render(); break;
    // The workout view: open or close an exercise, pick the set to edit, show an exercise's menu
    case "exopen": { const es = sessionDoc(S.day).entries, k = entryKey(es[i], i); S.exOpen[k] = !entryOpen(es[i], i, es, !S.sessions[S.day].finished); S.exMenu = null; render(); break; }
    case "exmenu": { const k = entryKey(E(), i); S.exMenu = S.exMenu === k ? null : k; render(); break; }
    case "setedit": S.setEdit = { k: entryKey(E(), i), j }; render(); break;
    case "prevday": S.day = addDays(S.day, -1); render(); break;
    case "nextday": S.day = addDays(S.day, 1); render(); break;
    case "swap": closeSheet(true);
      if (b.dataset.pre) setPre(b.dataset.orig, b.dataset.id); else swapEntry(i, b.dataset.id);
      toast(`Swapped to ${exById(b.dataset.id).name}${b.dataset.pre ? " for today" : ""}`); break;
    case "swapsheet": openSwap(b.dataset.pre ? { pre: b.dataset.pre, orig: b.dataset.orig, rid: b.dataset.rid } : { i }); break;
    case "swapalways": {
      const pre = b.dataset.pre, from = pre ? b.dataset.orig : E().ex, to = b.dataset.id, sub = subOf(from);
      closeSheet(true); if (pre) setPre(from, null); else swapEntry(i, to);
      if (sub && autoMode()) { await setPrefs(p => reorder(p, subOf(to) || sub, to)); toast(`Swapped. Balanced sessions will pick ${exById(to).name} first`); }
      else { const n = await replaceInRoutines(from, to, pre ? b.dataset.rid : S.sessions[S.day]?.routine); toast(`Swapped${n ? `, and in ${n === 1 ? "the routine" : n + " routines"} too` : ""}`); }
      break;
    }
    case "skipex": {   // data-k: cycle | never | "" (take it off the list); data-i: also swap that entry on Today
      const key = b.dataset.id, k = b.dataset.k, name = skipName(key);
      await setPrefs(p => { if (k) p.skip[key] = { ...(p.skip[key] || {}), k, since: S.day }; else delete p.skip[key]; });
      if (b.dataset.pre) { closeSheet(true); if (S.sessions[S.day]?.pre?.[b.dataset.orig] === key) setPre(b.dataset.orig, null); }   // the plan rebuilds without it
      if (b.dataset.i) { closeSheet(true); const to = nextInMove(E().ex, S.day) || similarEx(E().ex, S.day)[0]?.id; if (to) swapEntry(i, to); }
      toast(!k ? `${name} is back in` : k === "never" ? `${name} won't be suggested again` : `${name} is out until your next deload`); break;
    }
    case "unskip": await setPrefs(p => { delete p.skip[b.dataset.id]; }); toast(`${skipName(b.dataset.id)} is back in`); break;
    case "prefer": await setPrefs(p => reorder(p, b.dataset.sub, b.dataset.id)); toast(`${exById(b.dataset.id).name} is your pick for ${SLOT_SUBS[b.dataset.sub][0].toLowerCase()} now`); break;
    case "rank": await setPrefs(p => reorder(p, b.dataset.sub, b.dataset.id, +b.dataset.d)); break;
    case "fav": { const id = b.dataset.id; await setPrefs(p => { p.fav = p.fav.includes(id) ? p.fav.filter(x => x !== id) : [...p.fav, id]; }); break; }
    case "blockdone": await setPrefs(p => { p.block = b.dataset.v; }); break;
    case "stallswap": {
      // Balanced: your next choice moves to the top of the movement. Routines: replaced in them. Otherwise: skipped this cycle.
      const from = b.dataset.id, to = b.dataset.to, sub = subOf(from), name = exById(to).name;
      const k = (S.sessions[S.day]?.entries || []).findIndex(e => e.ex === from && !e.sets.some(x => x.done));
      if (k >= 0) swapEntry(k, to);
      if (autoMode() && sub && subOf(to) === sub) { await setPrefs(p => reorder(p, sub, to)); toast(`${name} is your pick for ${SLOT_SUBS[sub][0].toLowerCase()} now`); }
      else if (Object.values(S.routines).some(r => r.items.some(x => x.ex === from))) { const n = await replaceInRoutines(from, to); toast(`${name} replaces ${exById(from).name} in ${n === 1 ? "your routine" : n + " routines"}`); }
      else { await setPrefs(p => { p.skip[from] = { k: "cycle", since: S.day }; }); toast(`${exById(from).name} is out until your next deload`); }
      break;
    }
    case "dismississue": mutate(s => { s.dismissed = [...new Set([...(s.dismissed || []), b.dataset.k])]; s.issues = (s.issues || []).filter(x => x.k !== b.dataset.k); }); break;
    case "resolveissue": mutate(s => { s.resolved = [...new Set([...(s.resolved || []), b.dataset.k])]; }); toast("Glad it's better"); break;
    case "gotoday": S.day = dayKey(new Date()); render(); window.scrollTo(0, 0); break;
    case "openadd": openAdd(); break;
    case "bpex": S.libSel = S.libSel?.type === "ex" && S.libSel.id === b.dataset.id ? null : { type: "ex", id: b.dataset.id }; render(); break;
    case "bpm": {
      S.libSel = S.libSel?.type === "m" && S.libSel.id === b.dataset.id ? null : { type: "m", id: b.dataset.id }; render();
      const w = $("#bpwrap"); if (w && w.getBoundingClientRect().top < 0) w.scrollIntoView({ block: "start" });
      break;
    }
    case "eq": {
      const e = equip(), k = b.dataset.k, have = e.have.includes(k) ? e.have.filter(x => x !== k) : [...e.have, k];
      setEquip({ have }); render(); await saveDoc("settings/main", S.settings); break;
    }
    case "bppat": S.libPat = b.dataset.v; render(); break;
    case "bpclear": S.libSel = null; render(); break;
    case "wkmode": S.settings = { ...S.settings, week: { ...WEEK_DEFAULT, ...(S.settings.week || {}), mode: b.dataset.v } }; render(); await saveDoc("settings/main", S.settings); break;
    case "lvview": S.lvView = b.dataset.v; S.lvSel = null; try { localStorage.setItem("il-lv-view", S.lvView); } catch {} render(); break;
    case "lvsel": S.lvSel = S.lvSel === b.dataset.k ? null : b.dataset.k; render(); break;
    case "stdsex": S.settings = { ...S.settings, stdSex: S.settings.stdSex === b.dataset.v ? null : b.dataset.v }; render(); await saveDoc("settings/main", S.settings); break;
    case "unit": if (S.settings.unit !== b.dataset.v) { S.settings = { ...S.settings, unit: b.dataset.v }; render(); await saveDoc("settings/main", S.settings); } break;
    case "openroutines": openRoutines(); break;
    case "closesheet": closeSheet(); break;
    case "add": if (S.addFor === "routine") { const ex = exById(b.dataset.id); S.addFor = null; S.rEdit.items.push({ ex: ex.id, sets: 3, r: ex.kind === "time" ? 30 : 8, ...(ex.kind === "time" ? {} : { rHi: 12 }), w: 0 }); openRoutineEditor(); break; }
      closeSheet(); mutate(s => { s.entries.push(newEntry(b.dataset.id, S.day)); s.finished = false; }); toast(`Added ${exById(b.dataset.id).name}`); break;
    case "routine": {
      const r = b.dataset.id === "auto" ? buildSession(S.day) : S.routines[b.dataset.id], plan = b.dataset.raw ? { items: r.items, changes: [] } : adaptRoutine(r, S.day), dl = plan.deload;
      const trim = dl ? null : trimReason(S.day); closeSheet();
      const items = applyPre(plan.items, S.day), slots = slotsAfter(r.slots, items);
      mutate(s => { delete s.pre; if (trim) s.trim = trim; if (dl) { s.deload = true; s.trim = "deload week"; } for (const it of items) { const e = newEntry(it.ex, S.day); const p = progression(it.ex, S.day);
        const top = p?.last ? Math.max(...p.last.e.sets.map(x => x.w || 0)) : (it.w || 0);
        const w = dl && exById(it.ex).kind === "weight" ? deloadWeight(top, exById(it.ex).inc) : top;
        // carry last session's reps forward inside the range; start new lifts at the bottom (and always in a deload)
        const lastR = p?.last ? Math.max(...p.last.e.sets.map(x => x.r || 0)) : it.r;
        const r = dl ? it.r : p?.capped ? p.nextR : p?.resetReps ? it.r : Math.min(it.rHi || lastR, Math.max(it.r, lastR));
        const dp = dl && deloadPlan(it.ex, S.day, it.sets, it.r);
        e.sets = dp ? Array.from({ length: dp.n }, () => ({ w: dp.w, r: dp.r, done: false }))
          : Array.from({ length: trim ? Math.max(1, it.sets - 1) : it.sets }, () => ({ w, r, done: false }));
        if (dp) e.dl = { n: dp.n, w: dp.w, r: dp.r };
        if (it.rHi) { e.rLo = it.r; e.rHi = it.rHi; }
        s.entries.push(e); } s.routine = r.id; if (slots) s.slots = slots; s.finished = false; });
      toast(`Started ${r.name}${dl ? " as a deload" : plan.changes.length ? ` with ${plan.changes.length} change${plan.changes.length > 1 ? "s" : ""} for today` : ""}${trim ? `, one set lighter (${trim})` : ""}`); break;
    }
    case "deload-start": {
      const start = S.day, end = addDays(start, DELOAD_DAYS - 1), { deloadSnooze, ...rest } = S.settings;
      S.settings = { ...rest, deloads: [...(S.settings.deloads || []), { start, end }] };
      render(); await saveDoc("settings/main", S.settings);
      toast(`Deload week until ${fmtDay(end, { weekday: "long" })}`); break;
    }
    case "deload-snooze": S.settings = { ...S.settings, deloadSnooze: addDays(S.day, 4) }; render(); await saveDoc("settings/main", S.settings); toast("I'll ask again in a few days"); break;
    case "deload-end": {
      // Today goes back to normal: the deload ends yesterday, or disappears if it only started today
      const ds = [...(S.settings.deloads || [])], k = ds.findIndex(d => d.start <= S.day && S.day <= d.end);
      if (k < 0) break;
      if (ds[k].start >= S.day) ds.splice(k, 1); else ds[k] = { ...ds[k], end: addDays(S.day, -1) };
      S.settings = { ...S.settings, deloads: ds }; render(); await saveDoc("settings/main", S.settings); toast("Back to normal training"); break;
    }
    case "rm": S.exMenu = null; mutate(s => s.entries.splice(i, 1)); break;
    // Ticking the last set folds the exercise back to a line; unticking a set opens it for editing
    case "done": mutate(() => { const e = E(), st = e.sets[j], k = entryKey(e, i); st.done = !st.done; st.t = st.done ? (S.day === dayKey(new Date()) ? Date.now() : parseDay(S.day).getTime()) : null;
      if (!st.done) { S.setEdit = { k, j }; S.exOpen[k] = true; } else { if (S.setEdit?.k === k) S.setEdit = null; if (e.sets.every(x => x.done)) delete S.exOpen[k]; } }); break;
    case "w+": case "w-": mutate(() => { const st = E().sets[j]; const ex = exById(E().ex); const step = unit() === "kg" ? stepLb() : (ex.inc && ex.inc < 5 ? ex.inc : 5);
      st.w = Math.max(0, +((st.w || 0) + (act === "w+" ? step : -step)).toFixed(2)); if (act === "w+") for (let k = j + 1; k < E().sets.length; k++) if (!E().sets[k].done && E().sets[k].w < st.w) E().sets[k].w = st.w; }); break;
    case "r+": case "r-": mutate(() => { const st = E().sets[j]; const d = exById(E().ex).kind === "time" ? 5 : 1; st.r = Math.max(0, st.r + (act === "r+" ? d : -d)); }); break;
    case "effort": mutate(() => { E().effort = E().effort === b.dataset.v ? null : b.dataset.v; }); break;
    case "addset": mutate(() => { const l = E().sets[E().sets.length - 1]; E().sets.push({ w: l.w, r: l.r, done: false }); }); break;
    case "dlapply": mutate(() => { const d = E().dl || deloadPlan(E().ex, S.day); if (d) E().sets = Array.from({ length: d.n }, () => ({ w: d.w, r: d.r, done: false })); }); toast("Back to the deload sets"); break;
    case "repeat": mutate(() => { const L = progression(E().ex, S.day).last; E().sets = doneSets(L.e).map(x => ({ w: x.w || 0, r: x.r, done: false })); }); toast("Loaded last time's sets"); break;
    case "weekedit": S.weekEdit = !S.weekEdit; render(); break;
    case "tipok": case "tipsreset": S.settings = { ...S.settings, tipsSeen: act === "tipsreset" ? [] : [...new Set([...(S.settings.tipsSeen || []), b.dataset.k])] }; render(); if (act === "tipsreset") toast("Tips will show again"); await saveDoc("settings/main", S.settings); break;
    case "rmset": mutate(() => { E().sets.pop(); }); break;
    case "loadmode": savePlates({ ...plateLoad(), mode: b.dataset.v }); render(); await saveDoc("settings/main", S.settings); break;
    case "plateunit": { const L = plateLoad(); savePlates({ ...L, unit: b.dataset.v }); render(); await saveDoc("settings/main", S.settings); break; }
    case "pairs": { const L = plateLoad(), k = b.dataset.k, n = Math.max(0, (L.plates[k] || 0) + +b.dataset.d), plates = { ...L.plates, [k]: n }; if (!n) delete plates[k]; savePlates({ ...L, plates }); render(); await saveDoc("settings/main", S.settings); break; }
    case "plateadd": { const w = parseFloat($("#pa-w").value), u = $("#pa-u").value; if (!(w > 0 && w <= 200)) { toast("Enter a plate size"); break; }
      const L = plateLoad(), k = plateKey(+w.toFixed(2), u); savePlates({ ...L, plates: { ...L.plates, [k]: (L.plates[k] || 0) + 1 } }); render(); toast(`Added a pair of ${+w.toFixed(2)} ${u}`); await saveDoc("settings/main", S.settings); break; }
    case "warmups": S.settings = { ...S.settings, warmups: S.settings.warmups === false }; render(); await saveDoc("settings/main", S.settings); break;
    case "wu": mutate(() => { const k = +b.dataset.k, w = E().wu || []; E().wu = w.includes(k) ? w.filter(x => x !== k) : [...w, k]; }); break;
    case "wset": mutate(() => { const sets = E().sets, old = sets[j].w, w = +b.dataset.w; for (let n = j; n < sets.length; n++) if (!sets[n].done && (n === j || sets[n].w === old)) sets[n].w = w; }); break;
    case "bump": mutate(() => { const n = +b.dataset.n; E().sets.forEach(s => { if (!s.done) { s.w = Math.max(0, +((s.w || 0) + n).toFixed(2)); if (n > 0 && E().rLo) s.r = E().rLo; } }); }); break;
    case "finish": mutate(s => { s.finished = !s.finished; s.finishedAt = s.finished ? Date.now() : null; }); if (S.sessions[S.day].finished) { toast("Workout logged"); window.scrollTo(0, 0); } break;
    case "wk": {
      const k = b.dataset.k, cur = { ...WEEK_DEFAULT, ...(S.settings.week || {}) };
      cur[k] = Math.max(0, cur[k] + +b.dataset.d);
      S.settings = { ...S.settings, week: cur }; render(); await saveDoc("settings/main", S.settings); break;
    }
    case "z2set": case "z2": {   // walks' Zone 2 minutes are worked out again for the new range on the next Strava sync
      const z = act === "z2set" ? { lo: 120, hi: 140 } : { ...S.settings.hrZ2 }, k = b.dataset.k;
      if (k) z[k] = Math.min(200, Math.max(80, z[k] + +b.dataset.d));
      if (z.hi - z.lo < 5) return;
      S.settings = { ...S.settings, hrZ2: { lo: z.lo, hi: z.hi, source: "set by you" } }; render(); await saveDoc("settings/main", S.settings);
      clearTimeout(S.z2Timer); S.z2Timer = setTimeout(() => stravaSync(), 3000); break;
    }
    case "fuelack": case "goal": case "kcal": {
      const N = nutri(), F = fuel(S.day), n = +b.dataset.n || 0;
      const next = act === "fuelack" ? { ...N, kcal: F.kcal + n, changes: [...N.changes, { day: S.day, delta: n, perWk: +F.tr.perWk.toFixed(2), kcal: F.kcal + n }] }
        : act === "goal" ? { ...N, goal: b.dataset.v, kcal: N.goal === b.dataset.v ? N.kcal : null }
        : { ...N, kcal: Math.max(1200, F.kcal + +b.dataset.d) };
      S.settings = { ...S.settings, nutrition: next }; render(); await saveDoc("settings/main", S.settings);
      if (act === "fuelack") toast(`Daily target is now ~${next.kcal.toLocaleString()} kcal`);
      break;
    }
    case "retryhealth": try { localStorage.removeItem("il-health-file"); } catch {} loadHealth(); render(); break;
    case "goto": S.day = b.dataset.day; S.tab = "today"; render(); window.scrollTo(0, 0); break;
    case "editroutine": editRoutine(b.dataset.id); break;
    case "routinefromday": routineFromDay(); break;
    case "re-add": S.addFor = "routine"; openAdd(); break;
    case "re-save": saveRoutine(); break;
    case "re-rm": S.rEdit.items.splice(+b.dataset.k, 1); openRoutineEditor(); break;
    case "re-move": { const its = S.rEdit.items, k = +b.dataset.k, t = k + +b.dataset.d; [its[k], its[t]] = [its[t], its[k]]; openRoutineEditor(); break; }
    case "re-sets": { const it = S.rEdit.items[+b.dataset.k]; it.sets = Math.min(10, Math.max(1, it.sets + +b.dataset.d)); openRoutineEditor(); break; }
    case "delroutine": case "delex": {
      const id = b.dataset.id;
      if (S.confirmDel !== id) { S.confirmDel = id; render(); return; }
      S.confirmDel = null;
      if (act === "delroutine") { delete S.routines[id]; await saveDoc("routines/" + id, null); } else { delete S.custom[id]; await saveDoc("exercises/" + id, null); }
      render(); break;
    }
    case "cxm": { const m = b.dataset.m; const w = draft.muscles[m] || 0; const nw = w === 0 ? 1 : w === 1 ? .5 : 0; if (nw) draft.muscles[m] = nw; else delete draft.muscles[m]; b.dataset.w = String(nw); break; }
    case "export": {
      const data = JSON.stringify({ app: "iron-ledger", version: 1, exported: new Date().toISOString(), unitStored: "lb", docs: Object.fromEntries(Object.entries(DB ? DB.dump() : {}).filter(([k]) => !k.startsWith("connectors/"))) }, null, 1);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
      a.download = `iron-ledger-${dayKey(new Date())}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast("Backup downloaded"); break;
    }
    case "import": $("#importfile").click(); break;
  }
  if (b.closest("nav.tabs")) return;
});
// A tab always opens at its top level: this week, the Progress overview
document.querySelectorAll("nav.tabs button").forEach(b => b.addEventListener("click", () => { S.tab = b.id.slice(4); S.progPage = S.setupPage = null; S.weekOff = 0; closeSheet(true); render(); window.scrollTo(0, 0); }));
$("#open-settings").addEventListener("click", () => { if (S.tab !== "settings") S.prevTab = S.tab; S.tab = "settings"; S.setupPage = null; closeSheet(true); render(); window.scrollTo(0, 0); });
// Whatever a tap opened or closed, keep the back gesture in step with it
document.addEventListener("click", () => setTimeout(syncHistory, 0));
document.addEventListener("change", ev => {
  const t = ev.target;
  if (t.dataset.act === "w" || t.dataset.act === "r") {
    const i = +t.dataset.i, j = +t.dataset.j;
    // A typed value also fills the later unticked sets that still held the old one
    mutate(s => { const sets = s.entries[i].sets, k = t.dataset.act, old = sets[j][k];
      sets[j][k] = k === "w" ? (t.value.trim() === "" ? 0 : fromDisp(t.value)) : Math.max(0, parseInt(t.value) || 0);
      for (let n = j + 1; n < sets.length; n++) if (!sets[n].done && sets[n][k] === old) sets[n][k] = sets[j][k]; });
  }
  if (t.dataset.skipnote) { const key = t.dataset.skipnote, v = t.value.trim(); setPrefs(p => { if (p.skip[key]) { if (v) p.skip[key].note = v; else delete p.skip[key].note; } }); }
  if (t.dataset.re && S.rEdit) { const it = S.rEdit.items[+t.dataset.k], v = parseInt(t.value) || 0;
    if (t.dataset.re === "r") it.r = Math.max(1, v); else if (v > 0) it.rHi = v; else delete it.rHi; }
  if (t.id?.startsWith("bar-") || t.id?.startsWith("lim-")) {
    const L = plateLoad(), f = t.id.startsWith("bar-") ? "bar" : "limit"; savePlates({ ...L, [f]: { ...L[f], [t.id.slice(4)]: t.value.trim() === "" ? 0 : fromDisp(t.value) } });
    render(); saveDoc("settings/main", S.settings);
  }
  if (t.id?.startsWith("eqmax-")) {
    const k = t.id.slice(6), e = equip();
    setEquip({ max: { ...e.max, [k]: t.value.trim() === "" ? 0 : fromDisp(t.value) } });
    render(); saveDoc("settings/main", S.settings);
  }
  if (t.id === "cx-pattern") draft.pattern = t.value;
  if (t.id === "cx-kind") draft.kind = t.value;
});
let noteTimer = null;
document.addEventListener("input", ev => {
  if (ev.target.id === "daynote") {
    const s = sessionDoc(S.day), txt = ev.target.value;
    s.note = txt;
    s.issues = parseNote(txt).filter(i => !(s.dismissed || []).includes(i.k));
    saveDay(S.day);
    clearTimeout(noteTimer); noteTimer = setTimeout(render, 700);   // re-plan once typing pauses
    return;
  } if (ev.target.id === "cx-name") draft.name = ev.target.value; });
document.addEventListener("toggle", ev => { if (ev.target.matches?.("details.fold[id]")) S.open[ev.target.id] = ev.target.open; }, true);
document.addEventListener("submit", async ev => {
  if (ev.target.id !== "customform") return; ev.preventDefault();
  const name = draft.name.trim();
  if (!name) { toast("Name the exercise first"); return; }
  if (!Object.keys(draft.muscles).length) { toast("Pick at least one muscle"); return; }
  const id = "c_" + (name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || uid());
  const doc = { name, pattern: draft.pattern, kind: draft.kind, muscles: { ...draft.muscles }, inc: draft.kind === "weight" ? 5 : 0 };
  S.custom[id] = { ...doc, id }; draft = { name: "", pattern: "push", kind: "weight", muscles: {} };
  await saveDoc("exercises/" + id, doc); render(); toast(`Added ${name}`);
});
// The map's muscle column is sticky, so its links are redrawn as the page scrolls or resizes
let linkFrame = 0;
const queueLinks = () => { if (linkFrame || !document.getElementById("bp")) return; linkFrame = requestAnimationFrame(() => { linkFrame = 0; drawLinks(); }); };
window.addEventListener("scroll", queueLinks, { passive: true });
window.addEventListener("resize", queueLinks);
document.fonts?.ready.then(queueLinks);
document.addEventListener("keydown", ev => { if (ev.key !== "Escape") return; if ($("#help").innerHTML) closeHelp(); else if ($("#sheet").innerHTML) closeSheet(); syncHistory(); });

/* ============================== Example data (preview only) ============================== */
function loadDemo() {
  const today = dayKey(new Date());
  const plan = [
    ["Push", [["bench", 135, 8], ["ohp", 85, 8], ["lateral", 15, 12], ["pushdown", 40, 12]]],
    ["Pull", [["bb_row", 115, 8], ["pullup", 0, 6], ["face_pull", 30, 15], ["db_curl", 25, 10]]],
    ["Legs", [["squat", 155, 6], ["rdl", 135, 8], ["calf", 90, 12], ["situp", 0, 10]]],
  ];
  let k = 0;
  for (let d = 24; d >= 1; d--) {
    if (d % 7 === 3 || d % 7 === 6) continue;
    const day = addDays(today, -d), [, items] = plan[k % 3], wkIdx = Math.floor((24 - d) / 7);
    S.sessions[day] = { date: day, finished: true, entries: items.map(([ex, w, r]) => ({ id: uid(), ex, effort: ["solid", "easy", "solid", "hard"][(k + wkIdx) % 4],
      sets: Array.from({ length: 3 }, () => ({ w: w ? w + wkIdx * (exById(ex).inc || 5) : 0, r: w ? r : r + wkIdx, done: true, t: parseDay(day).getTime() + 6 * 36e5 })) })) };
    k++;
  }
  // a little over-curling to show the coach at work
  for (const d of [2, 1]) S.sessions[addDays(today, -d)].entries.push({ id: uid(), ex: "hammer", effort: "hard", sets: Array.from({ length: 4 }, () => ({ w: 30, r: 10, done: true, t: parseDay(addDays(today, -d)).getTime() + 6 * 36e5 })) });
  S.sessions[today] = { date: today, finished: false, entries: [{ id: uid(), ex: "bb_curl", effort: null, sets: Array.from({ length: 3 }, () => ({ w: 60, r: 10, done: false })) }] };
  for (let d = 20; d >= 0; d--) {
    const k = addDays(today, -d);
    S.health[k] = { readiness: 40 + ((d * 37) % 50), sleepScore: 60 + ((d * 23) % 35), sleepHours: 6 + ((d * 7) % 20) / 10, hrv: 48 + ((d * 13) % 18), bodyBatteryWake: 45 + ((d * 17) % 50), restingHr: 52 + (d % 5) };
    if (d % 2 === 0) Object.assign(S.health[k], { weightLb: +(182 - (20 - d) * .12 + ((d * 7) % 5) * .2).toFixed(1), bodyFatPct: +(21 - (20 - d) * .05).toFixed(1) });
  }
  S.tape = { [addDays(today, -42)]: { waist: 34.5, neck: 15.5, arm: 14, chest: 40, thigh: 22.5 }, [addDays(today, -28)]: { waist: 34.25, neck: 15.5, arm: 14.25, chest: 40.25, thigh: 22.5 },
    [addDays(today, -14)]: { waist: 34.25, neck: 15.5, arm: 14.25, chest: 40.5, thigh: 22.75 }, [today]: { waist: 34.5, neck: 15.75, arm: 14.5, chest: 40.75, thigh: 23 } };
  S.settings.heightIn ||= 70;
  const rowAt = parseDay(addDays(today, -1)).getTime() + 5 * 36e5;
  S.cardio = [{ id: "x", name: "Afternoon Row", sport: "Rowing", day: addDays(today, -1), t: rowAt, mins: 30, km: 6.5, re: 42, muscles: CARDIO.Rowing }];
  S.conn.garmin = { st: "ok", at: Date.now(), n: 21 }; S.conn.strava = { st: "ok", at: Date.now(), n: 1 };
  S.routines = Object.fromEntries(plan.map(([name, items]) => [name.toLowerCase(), { id: name.toLowerCase(), name, items: items.map(([ex, w, r]) => ({ ex, sets: 3, r, w })) }]));
}

boot();

/* ============================== Restore ============================== */
// Accepts this app's backup ({ docs }) or the original artifact's export ({ sessions, exercises, routines })
function backupDocs(j) {
  if (j?.docs && typeof j.docs === "object") return j.docs;
  if (j?.sessions) {
    const docs = {};
    for (const [k, v] of Object.entries(j.sessions || {})) docs["sessions/" + k] = v;
    for (const [k, v] of Object.entries(j.exercises || {})) docs["exercises/" + k] = v;
    for (const [k, v] of Object.entries(j.routines || {})) docs["routines/" + k] = v;
    docs["settings/main"] = j.settings || S.settings;
    return docs;
  }
  return null;
}
// Height: 5'10, 5' 10", 5 10 or 70 (inches) in lb mode, centimetres in kg mode. Stored in inches; blank clears it
function fmtHeight(inches) { if (!inches) return ""; if (unit() === "kg") return String(Math.round(inches * 2.54)); const r = Math.round(inches); return `${Math.floor(r / 12)}'${r % 12}`; }
function parseHeight(v, u = unit()) {
  v = String(v).trim().replace(/[″"]/g, ""); if (!v) return null;
  if (u === "kg") { const n = parseFloat(v); return n ? +(n / 2.54).toFixed(2) : NaN; }
  const m = v.match(/^(\d)\s*(?:['′ ]|ft)\s*(\d{1,2}(?:\.\d+)?)?\s*(?:in)?$/);
  if (m) return +m[1] * 12 + (+m[2] || 0);
  const n = parseFloat(v); return isFinite(n) && /^\d+(\.\d+)?$/.test(v) ? n : NaN;
}
document.addEventListener("change", async ev => {
  if (ev.target.id !== "heightin") return;
  const h = parseHeight(ev.target.value);
  if (h !== null && !(h >= 48 && h <= 90)) { toast(unit() === "kg" ? "Enter your height in cm, like 178" : "Enter your height like 5'10 or 70"); ev.target.value = fmtHeight(S.settings.heightIn); return; }
  const { heightIn, ...rest } = S.settings;
  S.settings = h ? { ...rest, heightIn: h } : rest;
  render(); await saveDoc("settings/main", S.settings);
});
// Birth year: blank clears it; anything outside a plausible range is refused
document.addEventListener("change", async ev => {
  if (ev.target.id !== "birthyear") return;
  const v = ev.target.value.trim(), y = parseInt(v), now = new Date().getFullYear();
  if (v && !(y >= now - 100 && y <= now - 12)) { toast(`Enter a year between ${now - 100} and ${now - 12}`); ev.target.value = S.settings.birthYear || ""; return; }
  const { birthYear, ...rest } = S.settings;
  S.settings = v ? { ...rest, birthYear: y } : rest;
  render(); await saveDoc("settings/main", S.settings);
});
document.addEventListener("change", async ev => {
  if (ev.target.id !== "importfile") return;
  const f = ev.target.files?.[0]; ev.target.value = "";
  if (!f || !DB) return;
  let docs = null;
  try { docs = backupDocs(JSON.parse(await f.text())); } catch {}
  if (!docs) { toast("That file isn't an Iron Ledger backup."); return; }
  const n = Object.keys(docs).filter(k => k.startsWith("sessions/")).length;
  if (!confirm(`Replace everything on this device with the backup (${n} training days)?`)) return;
  try { await DB.restore(docs); toast(`Restored ${n} days`); } catch (e) { toast(saveErr(e)); }
});
