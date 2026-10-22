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
const EFFORT = { easy: { label: "Easy", f: .6, rir: 4 }, solid: { label: "Solid", f: 1, rir: 2 }, hard: { label: "Grinder", f: 1.2, rir: 0 } };

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
  const { have, max } = equip();
  for (const req of NEEDS[exId] || []) for (const t of req.split("|")) if (LOADABLE.includes(t) && have.includes(t) && max[t]) return max[t];
  return null;
}
function atCap(exId) {
  const cap = capLb(exId), h = historyFor(exId);
  return !!cap && h.length > 0 && Math.max(...h[h.length - 1].e.sets.map(s => s.w || 0)) >= cap - .01;
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
    alts = allEx().filter(e => e.id !== exId).map(e => {
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
function jointRatios(day) {
  const ac = jointLoad(addDays(day, -6), day), ch = jointLoad(addDays(day, -34), addDays(day, -7)), rw = routineWeekLoad(day);
  return Object.fromEntries(JOINT_ORDER.map(j => {
    const usual = ch.out[j] / 4, starter = Math.max(JOINT_FLOOR, rw[j] + ch.cardio[j] / 4);
    const base = Math.max(usual, starter), basis = usual >= starter ? "usual" : "starter";
    const top = Object.entries(ac.by[j]).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([n]) => n);
    return [j, { acute: ac.out[j], usual, base, basis, ratio: ac.out[j] / base, top }];
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
  tab: "today", day: dayKey(new Date()), mode: "loading", progEx: null, progView: "lifts", open: {},
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
const CARDIO_SPORTS_EXCL = new Set(["Walk"]);   // walks are daily life, not training cardio
function cardioMinutes(fromDay, toDay) {
  return S.cardio.filter(a => a.day >= fromDay && a.day <= toDay && !CARDIO_SPORTS_EXCL.has(a.sport)).reduce((n, a) => n + a.mins, 0);
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
function fatigueAt(at, before = at) {
  const f = Object.fromEntries(Object.keys(MUSCLES).map(m => [m, 0]));
  for (const x of allDoneSets(x => x.t < before && x.t > at - 6 * 864e5)) {
    const ef = EFFORT[x.e.effort]?.f ?? 1;
    const dt = (at - x.t) / 36e5;
    for (const [m, w] of Object.entries(x.ex.muscles)) if (f[m] != null) f[m] += w * ef * Math.exp(-dt / MUSCLES[m].tau);
  }
  for (const a of S.cardio) {
    if (a.t >= before || a.t <= at - 6 * 864e5 || a.re < CARDIO_MIN_EFFORT) continue;
    const eq = Math.min(6, a.re / 10), dt = (at - a.t) / 36e5;
    for (const [m, w] of Object.entries(a.muscles)) if (f[m] != null) f[m] += w * eq * Math.exp(-dt / MUSCLES[m].tau);
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

function e1rm(lb, reps, effort) {
  const r = reps + (EFFORT[effort]?.rir ?? 0);
  if (!lb || !reps) return 0;
  return r <= 1 ? lb : lb * (1 + r / 30);   // Epley, reps adjusted by reps-in-reserve
}
function entryScore(e, ex) {  // best single-set performance for charts/PRs
  let best = 0;
  for (const s of doneSets(e)) {
    const v = ex.kind === "weight" ? e1rm(s.w, s.r, e.effort) : s.r;
    if (v > best) best = v;
  }
  return best;
}
function historyFor(exId, beforeDay) {
  const rows = [];
  for (const [day, s] of Object.entries(S.sessions)) {
    if (beforeDay && day >= beforeDay) continue;
    for (const e of s.entries || []) if (e.ex === exId && doneSets(e).length) rows.push({ day, e, score: entryScore(e, exById(exId)) });
  }
  return rows.sort((a, b) => a.day < b.day ? -1 : 1);
}
function firstDay() { const ks = Object.keys(S.sessions).filter(k => S.sessions[k].entries?.some(e => doneSets(e).length)).sort(); return ks[0]; }

/* Progression: what to load next time */
function progression(exId, beforeDay) {
  const h = historyFor(exId, beforeDay);
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
function liftedOn(day) { return !!S.sessions[day]?.entries?.some(e => doneSets(e).length); }
function cardioOn(fromDay, toDay) { return S.cardio.filter(a => a.day >= fromDay && a.day <= toDay && !CARDIO_SPORTS_EXCL.has(a.sport) && a.mins >= 15).sort((a, b) => a.t - b.t); }
function routineOf(day) {
  const s = S.sessions[day]; if (!s) return null;
  if (s.routine && S.routines[s.routine]) return S.routines[s.routine];
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
function round50(v) { return Math.round(v / 50) * 50; }
// Least-squares weight trend over weigh-ins in (from, to]: lb/week, and the fitted weight on `to`
function weightTrend(from, to) {
  const pts = Object.keys(S.health).filter(k => k > from && k <= to && S.health[k].weightLb).sort().map(k => [daysBetween(from, k), S.health[k].weightLb]);
  const n = pts.length;
  if (n < 2) return { n, span: 0 };
  const mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
  const sxx = pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0), sxy = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0);
  const slope = sxx ? sxy / sxx : 0;
  return { n, span: pts[n - 1][0] - pts[0][0], perWk: slope * 7, now: my + slope * (daysBetween(from, to) - mx), from };
}
function fuel(day) {
  const N = nutri(), G = GOALS[N.goal], bw = bwLb(day);
  const kcal = N.kcal || round50(bw * (S.settings.nutrition?.perLb || KCAL_PER_LB) + G.add);
  const prot = Math.round(bw * G.prot / 5) * 5;
  const last = N.changes.filter(c => c.day <= day).pop();
  // After a change, skip 4 days: water and food in the gut move the scale before muscle or fat does
  const from = last && addDays(last.day, 4) > addDays(day, -28) ? addDays(last.day, 4) : addDays(day, -28);
  const tr = weightTrend(from, day);
  const recent = Object.keys(S.health).filter(k => k > addDays(day, -14) && k <= day && S.health[k].weightLb).length;
  const nextCheck = last ? addDays(last.day, 14) : null, due = !nextCheck || day >= nextCheck;
  const enough = tr.n >= 6 && tr.span >= 10;
  const status = !enough ? "unknown" : tr.perWk < G.lo ? "low" : tr.perWk > G.hi + (N.goal === "bulk" ? .25 : 0) ? "high" : "ok";
  let nudge = null;
  if (due && (status === "low" || status === "high")) {
    // 0.1 lb/week ≈ 70 kcal/day in practice (the textbook 50, plus what the body burns off when fed more)
    const raw = ((G.lo + G.hi) / 2 - tr.perWk) * 700;
    nudge = { delta: Math.sign(raw) * Math.min(400, Math.max(200, round50(Math.abs(raw)))) };
  }
  return { N, G, bw, kcal, prot, tr, recent, status, nudge, last, nextCheck };
}
function fuelPick(list, day, n = 2) { const i = daysBetween("2026-01-01", day) % list.length; return [...list, ...list].slice(i, i + n); }
function agoText(k, day) { const n = daysBetween(k, day); return n === 1 ? "yesterday" : `${n} days ago`; }
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
  const longest = Math.max(0, ...cardioOn(addDays(day, -28), addDays(day, -7)).map(a => a.mins));
  const longMin = Math.min(45, Math.max(25, Math.round((longest + 10) / 5) * 5)), building = longMin < 45;
  const perSess = Math.min(building ? longMin : 60, Math.max(20, Math.round((minsT - minsDone) / Math.max(1, wk.cardio - cardio.length) / 5) * 5));
  const cardioShort = cardio.length < wk.cardio || minsDone < minsT * .8;
  why.push(`${liftDays.length} of ${wk.lifts} lifts and ${cardio.length} of ${wk.cardio} cardio sessions (${minsDone} of ${minsT} min) in the past 6 days`);
  if (lastLift) why.push(`last lift: ${esc(routineOf(lastLift)?.name || "custom session")}, ${agoText(lastLift, day)}`);
  if (h.readiness != null) why.push(`Garmin readiness ${h.readiness}${h.sleepScore ? `, sleep ${h.sleepScore}` : ""}${h.hrv ? `, HRV ${h.hrv} ms` : ""}`);
  if (tr.hrvDown || tr.rhrUp) why.push(`recovery trending down (${[tr.hrvDown && `HRV ${tr.hrv7.toFixed(0)} vs usual ${tr.hrvB.toFixed(0)}`, tr.rhrUp && `resting HR ${tr.rhr7.toFixed(0)} vs ${tr.rhrB.toFixed(0)}`].filter(Boolean).join(", ")})`);

  const poor = h.readiness != null ? h.readiness < 25 : /POOR/i.test(h.hrvStatus || "");
  const low = h.readiness != null && h.readiness < 50;
  const cardioPick = () => {
    if (tr.hrvDown || tr.rhrUp) return { kind: "cardio", mins: 25, title: "Short easy cardio, or rest", note: `20–30 min, conversational${z2Text()}. Recovery is dipping, and cardio is the first thing to cut, before lifting.` };
    if (!cardio.some(a => a.mins >= longMin)) {
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

  let p;
  if (liftedOn(day)) p = { kind: "done", title: `Lifted today: ${routineOf(day)?.name || "custom session"}`, note: "Easy cardio later is fine. No second lift." };
  else if (sick) p = { kind: "rest", title: "Rest", note: "You noted feeling sick. Training while ill slows recovery from both. Come back when you've had a day without symptoms." };
  else if (poor) p = { kind: "rest", title: "Rest or light mobility", note: "10–20 min. Readiness is poor; a hard session today costs more than it builds." };
  else if (streak >= 6) p = { kind: "rest", title: "Rest day", note: `You've trained ${streak} days in a row. Take one fully off.` };
  else if (lastLift === yest) {
    p = cardioShort ? cardioPickSafe() : { kind: "rest", title: "Rest or light mobility", note: "Cardio is already on target this week." };
    why.push("you lifted yesterday, and lifting days shouldn't be back to back");
  } else if (liftDays.length < wk.lifts && order.length) {
    const ok = r => !blockedIn(r).length;
    const mostlyBlocked = order.every(r => blockedIn(r).length * 2 >= r.items.length);
    if (mostlyBlocked) {
      p = cardioShort ? cardioPickSafe() : { kind: "rest", title: "Rest or light mobility", note: "" };
      why.push(`every routine leans on what you noted (${jointIssues.map(i => JOINT_NAMES[i.k.slice(6)]).join(", ")}), so lifting can wait a day`);
    } else {
      const pick = order.find(r => ok(r) && !tiredIn(r).length) || order.find(ok) || order.find(r => !tiredIn(r).length) || order[0];
      p = { kind: "lift", routine: pick, title: pick.name, note: low ? "Readiness is low: Start drops a set from each exercise and holds your weights. Skip grinders."
        : tiredNote ? "You noted feeling tired: Start drops a set from each exercise. Keep it moderate, no grinders."
        : tr.hrvDown || tr.rhrUp ? "Lift as planned, but hold your weights. No PR attempts while HRV is below your usual."
        : h.readiness >= 75 ? "You're well recovered. Good day to push the top of your rep ranges." : "" };
      p.trim = trimReason(day);
      // Well behind on cardio minutes and recovering fine → stack a short easy session after lifting
      if (minsDone < minsT * .6 && !isNewcomer(day) && !tr.hrvDown && !tr.rhrUp && !low && !tiredNote) {
        const m = Math.min(25, Math.max(15, Math.round((minsT - minsDone) / 3 / 5) * 5));
        p.addon = { mins: m, text: `${m} min easy ${lowImpactWords()} after lifting${z2Text()}. You're at ${minsDone} of ${minsT} cardio minutes this week.` };
      }
      if (pick !== order[0]) {
        const r0 = order[0], b0 = blockedIn(r0), t0 = tiredIn(r0);
        why.push(`${esc(r0.name)} is next in rotation, but ${b0.length ? `${b0.map(esc).join(", ")} ${b0.length > 1 ? "aren't" : "isn't"} a good idea with your ${jointIssues.map(i => JOINT_NAMES[i.k.slice(6)]).join("/")}` : `${t0.map(m => MUSCLES[m].n.toLowerCase()).join(", ")} still need recovery`}`);
      } else if (tiredIn(pick).length) why.push(`every routine hits something still tired (${tiredIn(pick).map(m => MUSCLES[m].n.toLowerCase()).join(", ")}). Go lighter there`);
      const bp = blockedIn(pick);
      if (bp.length) why.push(`swap ${bp.map(esc).join(", ")}: each one's card suggests an alternative`);
    }
  } else if (cardioShort) p = cardioPickSafe();
  else p = { kind: "rest", title: "Rest or light mobility", note: "Lifting and cardio are both on target for the week." };
  if (todayCardio.length && p.kind === "cardio") p = { kind: "done", title: `Cardio done: ${todayCardio[todayCardio.length - 1].name}`, note: `${todayCardio[todayCardio.length - 1].mins} min.` };
  p.alts = order.filter(r => r !== p.routine);
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
  // 3. Top up to two fresh muscles your routines under-cover across a week, minus extra work already done this week
  //    (structural gaps, so a lower day doesn't fill in for the upper day that's coming anyway). Not on a lighter day.
  if (!trimReason(day) && !isNewcomer(day)) {
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
      const pick = allEx().filter(e => (e.muscles[m] || 0) >= 1 && canDo(e.id) && !items.some(x => x.ex === e.id) && exerciseAdvice(e.id, day, { ...ctx, noAlts: true }).lvl === 0)
        .sort((a, b) => (used[b.id] || 0) - (used[a.id] || 0) || Object.keys(a.muscles).length - Object.keys(b.muscles).length)[0];
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
        S.sessions[k] = { date: k, routine: p.routine.id, entries: p.routine.items.map(it => ({ ex: it.ex, effort: "solid",
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
    msgs.push({ lvl: jr[spikes[0]].ratio > 2.5 ? "bad" : "warn", t: `<b>Joint load spike</b> this week: ${spikes.slice(0, 3).map(j => `${JOINT_NAMES[j]} <b>${jr[j].ratio.toFixed(1)}×</b>`).join(", ")} ${jr[spikes[0]].basis === "usual" ? "your usual week" : "a normal week of your plan"}${causes.length ? `, mostly from ${causes.map(esc).join(", ")}` : ""}. Joints and tendons adapt more slowly than muscles, so raise their load about 20–30% a week at most.` });
  }
  for (const is of activeIssues(day)) if (is.k.startsWith("joint:") && is.sev >= 3)
    msgs.push({ lvl: "bad", t: `You described your <b>${esc(issueLabel({ ...is, sev: 0 }).toLowerCase())}</b> as more than an ache (sharp, swollen or tweaked). Don't train through that. Rest it, and if it isn't clearly better in a few days, get it checked by a physio or doctor.` });
  // What to do today (flexible week)
  const plan = planDay(day);
  if (sess?.entries?.length && liftedOn(addDays(day, -1)))
    msgs.push({ lvl: "warn", t: `You lifted yesterday too. Your plan keeps lifting days apart so each one can recover. If you go ahead, keep it light.` });

  // Deload: a lighter week every 5–6 weeks (plan rule)
  if (histDays >= 28) {
    let hardWeeks = 0;
    for (let i = 0; i < 10; i++) {
      const end = addDays(day, -7 * i), v = totalSets(addDays(end, -6), end);
      const base = totalSets(addDays(end, -34), addDays(end, -7)) / 4;
      if (base > 0 && v < base * .6) break;   // found a lighter week
      if (v > 0) hardWeeks++;
    }
    if (hardWeeks >= 5) msgs.push({ lvl: "warn", t: `<b>${hardWeeks} straight weeks</b> without a lighter one. Your plan calls for a deload every 5–6 weeks: same lifts, about half the sets, lighter weight. Don't skip it.` });
  }

  // Recovery trending the wrong way → cut cardio first, not lifting (plan rule)
  const hk = Object.keys(S.health).filter(k => k <= day).sort();
  if (hk.length >= 14) {
    const mean = (ks, f) => { const v = ks.map(k => S.health[k][f]).filter(x => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const last7 = hk.slice(-7), prior = hk.slice(-35, -7);
    const rhr7 = mean(last7, "restingHr"), rhrB = mean(prior, "restingHr"), hrv7 = mean(last7, "hrv"), hrvB = mean(prior, "hrv");
    const rhrUp = rhr7 && rhrB && rhr7 - rhrB >= 4, hrvDown = hrv7 && hrvB && hrv7 < hrvB * .9;
    if (rhrUp || hrvDown) msgs.push({ lvl: "warn", t: `Recovery is trending the wrong way: ${[rhrUp && `resting HR ${rhr7.toFixed(0)} vs usual ${rhrB.toFixed(0)}`, hrvDown && `HRV ${hrv7.toFixed(0)} vs usual ${hrvB.toFixed(0)} ms`].filter(Boolean).join(", ")}. Per your plan, <b>cut cardio volume first</b>, not lifting.` });
    // …and the reverse: everything green → room to add easy cardio (~10%/week)
    else if (S.conn.strava.st === "ok") deferred.push(() => {
      const ready7 = mean(last7, "readiness");
      const cw = cardioMinutes(addDays(day, -6), day), cp = cardioMinutes(addDays(day, -13), addDays(day, -7));
      const stalled = msgs.some(m => /hasn't moved|Missed reps/.test(m.t));
      const rhrOk = !rhr7 || !rhrB || rhr7 <= rhrB + 1, hrvOk = !hrv7 || !hrvB || hrv7 >= hrvB * .98;
      const rampOk = !cp || cw <= cp * 1.1;
      if (ready7 >= 60 && rhrOk && hrvOk && !stalled && rampOk && (cw > 0 || cp > 0)) {
        const add = Math.max(5, Math.round(Math.max(cw, cp) * .1 / 5) * 5);
        msgs.push({ lvl: "good", t: `Recovery looks solid (readiness avg ${ready7.toFixed(0)}${hrv7 ? `, HRV ${hrv7.toFixed(0)} vs usual ${hrvB.toFixed(0)}` : ""}${rhr7 ? `, resting HR ${rhr7.toFixed(0)}` : ""}). Room for more cardio: about <b>+${add} min</b> of Zone 2 this week (you did ${cw} min), ideally on Saturday's long session. Keep it conversational.` });
      }
    });
  }

  // Fuel: the weight trend vs the goal's rate
  const F = fuel(day);
  if (F.nudge && isToday) {
    const more = F.nudge.delta > 0, ideas = fuelPick(more ? MORE_FOOD : LESS_FOOD, day);
    msgs.push({ lvl: more ? "warn" : "info", t: `<b>${more ? "Eat" : "Trim"} about ${Math.abs(F.nudge.delta)} kcal${more ? " more" : ""} a day.</b> Weight is ${fmtRate(F.tr.perWk)} over the last ${F.tr.span} days; a ${F.G.n.toLowerCase()} aims for ${F.G.r} lb/week${F.status === "high" && F.N.goal === "bulk" ? ", and faster than that is mostly fat" : ""}. For example: ${ideas.join(", or ")}. Keep it up for 2 weeks and the next check will show whether it worked.
      <div class="swaps"><button class="chipbtn" data-act="fuelack" data-n="${F.nudge.delta}">Got it</button></div>` });
  } else if (F.recent < 4 && Object.values(S.health).some(x => x.weightLb))
    msgs.push({ lvl: "info", t: `Only <b>${F.recent} weigh-in${F.recent === 1 ? "" : "s"}</b> in the last 2 weeks. The food advice runs on your weight trend, so step on the scale most mornings (after the bathroom, before eating or drinking).` });

  // 0. Garmin recovery signals for this morning
  const h = healthOn(day);
  if (h) {
    if (h.readiness != null) {
      if (h.readiness < 25) msgs.push({ lvl: "bad", t: `Garmin readiness is <b>${h.readiness}</b> (poor)${h.sleepScore ? `, sleep ${h.sleepScore}` : ""}. Make today light: technique work, mobility, or rest.` });
      else if (h.readiness < 50) msgs.push({ lvl: "warn", t: `Garmin readiness is <b>${h.readiness}</b> (low). Train, but skip grinders and drop a set from each lift.` });
      else if (h.readiness >= 75) msgs.push({ lvl: "good", t: `Garmin readiness is <b>${h.readiness}</b>. Good day to push for a PR.` });
    } else {
      if (h.sleepScore != null && h.sleepScore < 60) msgs.push({ lvl: "warn", t: `Sleep score <b>${h.sleepScore}</b>. Keep the effort moderate today.` });
      if (/LOW|UNBALANCED|POOR/i.test(h.hrvStatus || "")) msgs.push({ lvl: "warn", t: `Overnight HRV is <b>${h.hrv ?? "?"} ms</b> (${String(h.hrvStatus).toLowerCase()}). Your body's still under strain. Go lighter.` });
    }
    if (h.recoveryHours >= 36) msgs.push({ lvl: "info", t: `Garmin recommends <b>${h.recoveryHours}h</b> more recovery, mostly from cardio. Upper body is the better pick today.` });
  }
  // 0b. Hard cardio in the last 2 days
  const recentCardio = S.cardio.filter(a => a.re >= 30 && a.day <= day && a.day >= addDays(day, -1) && Object.keys(a.muscles).length);
  for (const a of recentCardio.slice(0, 2))
    msgs.push({ lvl: "info", t: `${a.day === day ? "Today's" : "Yesterday's"} <b>${esc(a.name)}</b> (${a.mins} min, effort ${a.re}) also loaded your ${Object.entries(a.muscles).filter(([, w]) => w >= .5).map(([m]) => MUSCLES[m].n.toLowerCase()).join(", ")}.` });

  // 1. Planned work on tired muscles
  const planned = new Set();
  for (const e of sess?.entries || []) for (const [m, w] of Object.entries(exById(e.ex).muscles)) if (w >= .75) planned.add(m);
  const tired = [...planned].filter(m => readiness(fatPre[m]) === "fat");
  if (tired.length) msgs.push({ lvl: "bad", t: `<b>${tired.map(m => MUSCLES[m].n).join(", ")}</b> ${tired.length > 1 ? "are" : "is"} still fatigued from recent sessions. Keep it light today, or swap to something fresh.` });

  // 2. Same muscle 3 days running
  const streak = {};
  for (let i = 0; i < 3; i++) {
    const k = addDays(day, -i);
    const sp = setsPerMuscle(k, k);
    for (const m in sp) if (sp[m] >= 2) streak[m] = (streak[m] || 0) + 1;
  }
  const streaky = Object.keys(streak).filter(m => streak[m] === 3);
  if (streaky.length) msgs.push({ lvl: "bad", t: `You've trained <b>${streaky.map(m => MUSCLES[m].n.toLowerCase()).join(", ")}</b> three days in a row. Muscles grow while they recover. Give ${streaky.length > 1 ? "them" : "it"} 48 hours.` });

  // 3. Weekly volume out of range
  const wk = setsPerMuscle(addDays(day, -6), day);
  const over = Object.keys(wk).filter(m => wk[m] > MUSCLES[m].hi);
  if (over.length) msgs.push({ lvl: "warn", t: `Over ${over.length > 1 ? "their" : "its"} useful weekly range: ${over.map(m => `<b>${MUSCLES[m].n}</b> ${wk[m].toFixed(0)} sets (cap ~${MUSCLES[m].hi})`).join(", ")}. Past that, extra sets mostly add fatigue.` });
  if (histDays >= 13) {
    const majors = ["chest", "lats", "upperBack", "quads", "hamstrings", "glutes"];
    const under = majors.filter(m => wk[m] < MUSCLES[m].lo / 2);
    if (under.length) msgs.push({ lvl: "info", t: `Light this week: ${under.map(m => `<b>${MUSCLES[m].n}</b> ${wk[m].toFixed(0)}/${MUSCLES[m].lo}`).join(", ")} sets.` });
  }

  // 4. Push/pull balance over 14 days
  const two = allDoneSets(x => x.day >= addDays(day, -13) && x.day <= day);
  const push = two.filter(x => x.ex.pattern === "push").length, pull = two.filter(x => x.ex.pattern === "pull").length;
  if (push + pull >= 12 && push > pull * 1.5) msgs.push({ lvl: "warn", t: `Pressing outweighs pulling <b>${push}:${pull}</b> over two weeks. Shoulders like it closer to 1:1. Add rows or face pulls.` });
  else if (push + pull >= 12 && pull > push * 2) msgs.push({ lvl: "info", t: `Pulling outweighs pressing <b>${pull}:${push}</b> over two weeks.` });

  // 5. Lower body neglect
  if (histDays >= 13) {
    const legs = allDoneSets(x => x.day > addDays(day, -10) && x.day <= day && (x.ex.pattern === "squat" || x.ex.pattern === "hinge")).length;
    if (!legs) msgs.push({ lvl: "warn", t: `No squats or hinges in <b>10 days</b>. Legs are half your muscle mass.` });
  }

  // 6. Load spike (acute : chronic)
  const acute = totalSets(addDays(day, -6), day);
  const chronic = totalSets(addDays(day, -27), day) / 4;
  if (histDays >= 20 && chronic >= 8) {
    const r = acute / chronic;
    if (r > 1.5) msgs.push({ lvl: "warn", t: `This week's load is <b>${r.toFixed(1)}×</b> your 4-week average. Big jumps like this are where tweaks happen. Ramp up ≤10–20% a week.` });
  }

  // 7. Rest days
  let trained = 0;
  for (let i = 0; i < 7; i++) { const s = S.sessions[addDays(day, -i)]; if (s?.entries?.some(e => doneSets(e).length)) trained++; }
  if (trained >= 6) msgs.push({ lvl: "warn", t: `${trained} training days out of the last 7. Plan a full rest day.` });

  // 8. Stalls
  for (const ex of allEx()) {
    const h = historyFor(ex.id).filter(r => r.day > addDays(day, -42) && r.day <= day);
    if (h.length < 4 || atCap(ex.id)) continue;   // capped lifts progress by reps; not a stall
    const recent = Math.max(0, ...h.filter(r => r.day > addDays(day, -21)).map(r => r.score));
    const prior = Math.max(0, ...h.filter(r => r.day <= addDays(day, -21)).map(r => r.score));
    if (prior && recent && recent <= prior * 1.005) msgs.push({ lvl: "info", t: `<b>${esc(ex.name)}</b> hasn't moved in 3 weeks. Try a lighter week, or change the rep range.` });
  }

  // 9. PRs today
  for (const e of sess?.entries || []) {
    const ex = exById(e.ex), sc = entryScore(e, ex);
    if (!sc) continue;
    const prev = historyFor(e.ex, day);
    if (prev.length && sc > Math.max(...prev.map(r => r.score)))
      msgs.push({ lvl: "good", t: `New best on <b>${esc(ex.name)}</b>: ${ex.kind === "weight" ? `est. 1RM ${fmtW(sc)}` : `${sc}${ex.kind === "time" ? "s" : " reps"}`}.` });
  }

  deferred.forEach(f => f());
  // Suggestions: fresh muscles with the biggest weekly gap
  const gaps = Object.keys(MUSCLES).filter(m => MUSCLES[m].lo > 0 && readiness(fatNow[m]) === "fresh")
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
    const cands = allEx().filter(e => canDo(e.id) && (e.muscles[g.m] || 0) >= 1 &&Object.entries(e.muscles).every(([m, w]) => w < .75 || readiness(fatNow[m]) !== "fat"));
    cands.sort((a, b) => (usedCount[b.id] || 0) - (usedCount[a.id] || 0));
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
  v.innerHTML = S.tab === "today" ? renderToday() : S.tab === "progress" ? renderProgress() : renderPlan();
  if (focus) { const el = document.getElementById(focus); if (el) { el.focus(); try { if (selStart != null) el.setSelectionRange(selStart, selStart); } catch {} } }
  if (S.tab === "progress") wireChart();
  if (S.tab === "plan") drawLinks();
}

// First-run tips: each shows once, in context, until "Got it" (kept in settings so it syncs)
const TIPS = {
  plan: "This is today's suggestion. The coach picks lift, cardio or rest from your last 7 days and how recovered you are. Tap <b>Start</b> to load the sets, or pick something else below.",
  tick: "Set the weight and reps, then tap <b>✓</b> when the set is done. Only ticked sets count toward your progress and the coach's advice.",
  coach: "The coach's notes fold up here while you train: weekly gaps, new bests and things to watch. Anything serious stays open on its own.",
};
const tip = k => (S.settings.tipsSeen || []).includes(k) ? "" : `<div class="ftip" role="note"><div>${TIPS[k]}</div><button class="linkbtn" data-act="tipok" data-k="${k}">Got it</button></div>`;
// A details element whose open state survives re-renders (S.open, keyed by id)
const fold = (id, summary, body, cls = "") => `<details class="fold ${cls}" id="${id}" ${S.open[id] ? "open" : ""}><summary>${summary}</summary>${body}</details>`;
const MSG_RANK = { bad: 0, warn: 1, good: 2, info: 3 };
const msgRow = m => `<div class="msg ${m.lvl}"><span class="ic">${m.ic || { bad: "!", warn: "!", good: "★", info: "i" }[m.lvl]}</span><div>${m.t}</div></div>`;

// Today changes with the day: a plan before training, the sets while training, a summary once finished
function renderToday() {
  const day = S.day, today = dayKey(new Date());
  const s = S.sessions[day];
  const c = coach(day);
  const rel = day === today ? "Today" : day === addDays(today, -1) ? "Yesterday" : day === addDays(today, 1) ? "Tomorrow" : fmtDay(day, { weekday: "long" });
  const total = (s?.entries || []).reduce((a, e) => a + e.sets.length, 0), done = (s?.entries || []).reduce((a, e) => a + doneSets(e).length, 0);
  const cmins = cardioOn(day, day).reduce((a, x) => a + x.mins, 0);
  const cardioPill = cmins ? `<span class="pill good">✓ Cardio · ${cmins}′</span>` : "";
  const status = !total ? (cardioPill || (day < today ? `<span class="pill neutral">Rest day</span>` : "")) : (s.finished ? `<span class="pill good">✓ Logged</span>` : `<span class="pill neutral num">${done}/${total} sets</span>`) + (cardioPill ? " " + cardioPill : "");
  const p = c.plan, empty = !s?.entries?.length;
  const phase = empty ? "plan" : s.finished ? "done" : "workout";

  const ready = Object.keys(MUSCLES).filter(m => MUSCLES[m].lo > 0 || c.fatNow[m] >= 1.5).map(m => {
    const r = readiness(c.fatNow[m]);
    return `<div class="m ${r}" title="${READY_LABEL[r]}"><span>${MUSCLES[m].n}</span><span>${r === "fresh" ? "✓" : r === "rec" ? "~" : "!"}</span></div>`;
  }).join("");
  const readyFold = fold("ready-fold", "Muscle readiness right now", `<div class="ready" style="margin-top:8px">${ready}</div>`);

  // Coach messages, most serious first; only the top two stay open
  const sugg = [];
  if (p.kind === "lift" || (p.kind === "done" && !empty)) c.exSuggest.forEach(e => sugg.push(`<button class="chipbtn" data-act="add" data-id="${esc(e.id)}">+ ${esc(e.name)}</button>`));
  const msgs = [...c.msgs].sort((a, b) => MSG_RANK[a.lvl] - MSG_RANK[b.lvl]);
  if (sugg.length && c.gaps.length) msgs.push({ lvl: "info", ic: "→", t: `Fresh and short of this week's target: ${c.gaps.map(g => `<b>${MUSCLES[g.m].n.toLowerCase()}</b>`).join(", ")}.<div class="suggest" style="margin-top:6px">${sugg.join("")}</div>` });

  const h = healthOn(day), lw = latestWeight(day);
  const vit = [];
  if (h?.readiness != null) vit.push(`<span class="pill ${h.readiness < 25 ? "bad" : h.readiness < 50 ? "warn" : "good"}">Readiness ${h.readiness}</span>`);
  if (h?.sleepScore != null) vit.push(`<span class="pill ${h.sleepScore < 60 ? "warn" : "neutral"}">Sleep ${h.sleepScore}${h.sleepHours ? ` · ${h.sleepHours.toFixed(1)}h` : ""}</span>`);
  if (h?.hrv != null) vit.push(`<span class="pill ${/LOW|UNBALANCED|POOR/i.test(h.hrvStatus || "") ? "warn" : "neutral"}">HRV ${h.hrv} ms</span>`);
  if (h?.bodyBatteryWake != null || h?.bodyBatteryHigh != null) vit.push(`<span class="pill neutral">Body Battery ${h.bodyBatteryWake ?? h.bodyBatteryHigh}</span>`);
  if (lw) vit.push(`<span class="pill neutral">${fmtW(lw.weightLb)}${lw.bodyFatPct ? ` · ${lw.bodyFatPct}% fat` : ""}</span>`);
  const dayCardio = S.cardio.filter(a => a.day === day && a.re >= CARDIO_MIN_EFFORT);
  for (const a of dayCardio) vit.push(`<span class="pill neutral">${esc(a.sport)} ${a.mins}′ · effort ${a.re}</span>`);
  const vitHtml = vit.length ? `<div class="suggest">${vit.join("")}</div>` : "";

  const KIND = { lift: ["Lift", "good"], cardio: ["Cardio", "neutral"], rest: ["Rest", "warn"], done: ["Done", "good"] };
  const ahead = day === today ? forecast(day, phase === "done" ? 1 : 4) : [];
  const aheadRow = ({ day: k, p: q }) => `<div class="ad"><b>${fmtDay(k, { weekday: "short" })}</b><span class="pill ${KIND[q.kind][1]}">${KIND[q.kind][0]}</span><span>${esc(q.kind === "lift" ? q.routine.name + (q.addon ? ` + ${q.addon.mins}′ easy cardio` : "") : q.kind === "cardio" ? `${q.title} · ${q.mins || 30}′` : q.title)}</span></div>`;

  // Day notes: today's parsed issues (removable) + ones carried from earlier days (mark better)
  const actx = adviceCtx(day);
  const todayIssues = (s?.issues || []);
  const carried = actx.issues.filter(i => i.day !== day);
  const note = (s?.note || "").trim();
  const noteHtml = `
    <div class="notecard">
      ${fold("note-fold", note ? `Note: <span class="notesum">${esc(note)}</span>` : "How does your body feel? Add a note", `
        <textarea id="daynote" rows="2" placeholder="e.g. left knee creaking, slept badly, sore quads" aria-label="How does your body feel?" style="margin-top:8px">${esc(s?.note || "")}</textarea>
        <div class="small muted">Mention aches or how you slept, and the suggestions adjust.</div>`)}
      ${todayIssues.length || carried.length ? `<div class="issues">
        ${todayIssues.map(i => `<span class="pill ${i.sev >= 3 ? "bad" : i.sev >= 2 ? "warn" : "neutral"}">${esc(issueLabel(i))}<button class="chipx" data-act="dismississue" data-k="${esc(i.k)}" aria-label="Not an issue: ${esc(issueLabel(i))}">×</button></span>`).join("")}
        ${carried.map(i => `<span class="pill ${i.sev >= 3 ? "bad" : i.sev >= 2 ? "warn" : "neutral"}">${esc(issueLabel(i))} <span class="muted">(${fmtDay(i.day, { weekday: "short" })})</span><button class="chipx ok" data-act="resolveissue" data-k="${esc(i.k)}" aria-label="Better now: ${esc(issueLabel(i))}">Better ✓</button></span>`).join("")}
      </div>` : ""}
    </div>`;

  const daynav = `
    <div class="daynav">
      <button class="iconbtn" data-act="prevday" aria-label="Previous day">‹</button>
      <div class="d"><div class="big">${rel}</div><div class="small muted">${fmtDay(day, { weekday: "short", month: "long", day: "numeric", year: "numeric" })}${status ? ` · ${status}` : ""}</div></div>
      ${day !== today ? `<button class="chipbtn primary" data-act="gotoday">Today</button>` : ""}
      <button class="iconbtn" data-act="nextday" aria-label="Next day">›</button>
    </div>`;
  const entries = (s?.entries || []).map((e, i) => renderEntry(e, i, day, c.fatPre, actx)).join("");
  const hasRoutines = Object.keys(S.routines).length;

  if (phase === "plan") {
    const adapt = p.kind === "lift" ? adaptRoutine(p.routine, day) : null;
    const main = adapt ? `<button class="btn primary big" data-act="routine" data-id="${esc(p.routine.id)}">▶ Start ${esc(p.routine.name)}${adapt.changes.length ? " (adjusted)" : p.trim ? " (lighter)" : ""}</button>`
      : p.kind === "cardio" ? `<button class="btn primary big" data-act="cl-open">+ Log cardio</button>` : "";
    const other = [];
    if (adapt?.changes.length) other.push(`<button class="chipbtn" data-act="routine" data-raw="1" data-id="${esc(p.routine.id)}">${esc(p.routine.name)} as written</button>`);
    if (p.kind !== "done") p.alts.forEach(r => other.push(`<button class="chipbtn" data-act="routine" data-id="${esc(r.id)}">${p.kind === "lift" ? "" : "Lift anyway: "}${esc(r.name)}</button>`));
    const more = `
      ${adapt?.changes.length ? `<div class="adapt"><div class="label">Adjusted for today</div><ul>${adapt.changes.map(c => `<li>${c}</li>`).join("")}</ul></div>` : ""}
      <ul class="why">${p.why.map(w => `<li>${w}</li>`).join("")}</ul>
      ${other.length ? `<div class="label">Or do this instead</div><div class="suggest">${other.join("")}</div>` : ""}
      ${ahead.length ? `<div class="ahead"><span class="label">Next days · tentative</span>${ahead.map(aheadRow).join("")}</div>` : ""}`;
    const top = msgs.slice(0, 2), rest = msgs.slice(2);
    return `${daynav}${noteHtml}${p.kind === "lift" ? tip("plan") : ""}
    <div class="coach" aria-label="Coach">
      ${vitHtml}
      <div class="today-plan">
        <div class="label">${day === today ? "Suggested today" : "Suggested for this day"} <span class="pill ${KIND[p.kind][1]}">${KIND[p.kind][0]}</span></div>
        <div class="pt">${esc(p.title)}</div>
        ${p.note ? `<div class="small">${esc(p.note)}</div>` : ""}
        ${p.addon ? `<div class="small"><b>+ Cardio:</b> ${esc(p.addon.text)}</div>` : ""}
        ${main ? `<div class="suggest" style="margin-top:6px">${main}</div>` : ""}
        ${fold("plan-fold", `Why this${other.length ? ", other options" : ""}${ahead.length ? " and the next few days" : ""}`, `<div class="plan-more">${more}</div>`)}
      </div>
      ${fuelLine(day, p)}
      ${top.length ? `<div class="msgs">${top.map(msgRow).join("")}</div>` : ""}
      ${rest.length ? fold("msgs-fold", `${rest.length} more from the coach`, `<div class="msgs" style="margin-top:8px">${rest.map(msgRow).join("")}</div>`) : ""}
      ${readyFold}
    </div>
    <div class="actions">
      ${p.kind !== "cardio" ? `<button class="btn" data-act="cl-open">+ Cardio</button>` : ""}
      <button class="btn" data-act="wt-open">Weigh-in</button>
      <button class="btn" data-act="openadd">+ Add exercise</button>
      ${hasRoutines ? `<button class="btn" data-act="openroutines">Pick a routine</button>` : ""}
    </div>`;
  }

  // During and after a workout the coach shrinks to one line; anything serious stays visible
  const urgent = msgs.filter(m => m.lvl === "bad"), quiet = msgs.filter(m => m.lvl !== "bad");
  const coachBar = `
    <div class="coach mini" aria-label="Coach">
      ${urgent.length ? `<div class="msgs">${urgent.map(msgRow).join("")}</div>` : ""}
      ${fold("coach-fold", `Coach${quiet.length ? ` · ${quiet.length} note${quiet.length > 1 ? "s" : ""}` : ""}${phase === "workout" ? ` · ${esc(p.title)}` : ""}`,
        `<div style="display:grid;gap:10px;margin-top:8px">${vitHtml}${quiet.length ? `<div class="msgs">${quiet.map(msgRow).join("")}</div>` : ""}${readyFold}</div>`)}
    </div>`;
  const links = `<div class="linkrow"><button class="linkbtn" data-act="cl-open">+ Cardio</button><button class="linkbtn" data-act="wt-open">Weigh-in</button>${hasRoutines && phase === "workout" ? `<button class="linkbtn" data-act="openroutines">Add a routine</button>` : ""}</div>`;

  if (phase === "workout") {
    const allDone = done === total;
    const firstTip = tip("tick") || tip("coach");
    return `${daynav}${coachBar}${firstTip}
    <div class="entries">${entries}</div>
    <div class="actions">
      <button class="btn ${allDone ? "" : "primary"}" data-act="openadd">+ Add exercise</button>
      <button class="btn ${allDone ? "primary" : ""}" data-act="finish">Finish workout</button>
    </div>
    ${links}${noteHtml}`;
  }

  // Done: what got logged, any new bests, what's next
  const ts = (s.entries || []).flatMap(e => doneSets(e).map(x => x.t)).filter(Boolean).sort((a, b) => a - b);
  const mins = ts.length > 1 ? Math.round((ts[ts.length - 1] - ts[0]) / 6e4) : 0;
  const exN = s.entries.filter(e => doneSets(e).length).length;
  const bests = c.msgs.filter(m => m.lvl === "good" && m.t.startsWith("New best"));
  return `${daynav}
    <div class="coach summary">
      <div class="label">Workout logged</div>
      <div class="pt">${done} set${done === 1 ? "" : "s"} · ${exN} exercise${exN === 1 ? "" : "s"}${mins >= 5 ? ` · ${mins} min` : ""}</div>
      ${bests.length ? `<div class="msgs">${bests.map(msgRow).join("")}</div>` : ""}
      ${fuelLine(day, p)}
      ${ahead.length ? `<div class="ahead"><span class="label">Next up · tentative</span>${ahead.map(aheadRow).join("")}</div>` : ""}
    </div>
    ${coachBar}
    ${fold("done-sets", `See the sets`, `<div class="entries" style="margin-top:10px">${entries}</div>`)}
    <div class="actions"><button class="btn ghost" data-act="finish">Reopen workout</button></div>
    ${links}${noteHtml}`;
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
  return `<div class="fuel small"><div><b>Fuel:</b> ~${(F.kcal + extra).toLocaleString()} kcal${extra ? ` (incl. ~${extra} for ${mins}′ cardio)` : ""} · <b>${F.prot} g protein</b></div>
    ${fold("fuel-fold", "Timing and protein ideas", `<div class="small" style="margin-top:4px">About 30–40 g protein at each of 4 meals. ${tip}</div><div class="small muted"><b>Protein idea:</b> ${idea}.</div>`)}</div>`;
}

function renderEntry(e, i, day, fatPre, actx) {
  const ex = exById(e.ex);
  const unitLbl = ex.kind === "time" ? "sec" : "reps";
  const allDone = e.sets.length && e.sets.every(s => s.done);
  const prog = progression(e.ex, day);
  const hold = S.sessions[day]?.trim && prog?.bump > 0;   // lighter day: don't push the weight up
  const adv = e.sets.some(s => s.done) ? { lvl: 0 } : exerciseAdvice(e.ex, day, actx);
  const prim = Object.entries(ex.muscles).filter(([, w]) => w >= .75).map(([m]) => MUSCLES[m]?.n).filter(Boolean).join(" · ");
  // Ticked sets shrink to one line; untick one to edit it again
  const doneTxt = s => ex.kind === "time" ? `${s.r}s${s.w ? ` · +${fmtW(s.w)}` : ""}`
    : `${ex.kind === "bodyweight" ? (s.w ? `BW + ${fmtW(s.w)}` : "Bodyweight") : fmtW(s.w || 0)} × ${s.r}`;
  const lastSets = prog?.last ? doneSets(prog.last.e) : [];
  // "30 lb × 8, 8, 7" when the weight held; otherwise each set
  const lastTxt = ex.kind !== "time" && lastSets.length && lastSets.every(x => (x.w || 0) === (lastSets[0].w || 0))
    ? `${doneTxt(lastSets[0]).replace(/ × \d+$/, "")} × ${lastSets.map(x => x.r).join(", ")}` : lastSets.map(doneTxt).join(" · ");
  const same = lastSets.length === e.sets.length && lastSets.every((x, k) => (x.w || 0) === (e.sets[k].w || 0) && x.r === e.sets[k].r);
  const rows = e.sets.map((s, j) => s.done ? `
    <div class="setrow done">
      <span class="idx">${j + 1}</span>
      <span class="donetxt num">${doneTxt(s)}</span>
      <button class="check" data-act="done" data-i="${i}" data-j="${j}" aria-pressed="true" aria-label="Set ${j + 1} done. Tap to edit">✓</button>
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
      <button class="check" data-act="done" data-i="${i}" data-j="${j}" aria-pressed="${!!s.done}" aria-label="Set ${j + 1} done">✓</button>
    </div>`).join("");
  return `
    <div class="entry ${allDone ? "complete" : ""}">
      <div class="eh"><div><div class="nm">${esc(ex.name)} ${helpBtn(e.ex, ex.name)}</div><div class="sub">${prim}${e.rHi ? ` · target ${e.rLo}–${e.rHi}${ex.kind === "time" ? "s" : " reps"}` : ""}</div></div>
        <button class="x" data-act="rm" data-i="${i}" aria-label="Remove ${esc(ex.name)}">×</button></div>
      ${adv.lvl ? `<div class="hint ${adv.lvl >= 2 ? "bad" : "warn"}"><b>${adv.lvl >= 2 ? "Not the best right now" : "Careful"}:</b> ${esc(adv.reasons.join("; "))}.${adv.alts.length ? `<div class="swaps">Swap for: ${adv.alts.map(a => `<button class="chipbtn" data-act="swap" data-i="${i}" data-id="${esc(a.id)}">${esc(a.name)}</button>`).join("")}</div>` : ""}</div>` : ""}
      ${!prog && ex.kind === "weight" && !e.sets.some(s => s.done || s.w) ? `<div class="hint info">First time: pick a weight you could lift 2–3 more reps than the target with good form. Go lighter if unsure; the coach takes it from there.</div>` : ""}
      ${lastSets.length && !e.sets.some(s => s.done) ? `<div class="lastline small muted">Last time, ${fmtDay(prog.last.day)}: <span class="num">${lastTxt}</span>${same ? "" : ` <button class="linkbtn" data-act="repeat" data-i="${i}">Same again</button>`}</div>` : ""}
      ${prog && !e.sets.some(s => s.done) ? `<div class="hint ${prog.bump < 0 ? "warn" : "info"}">${prog.text}${hold ? ` Not today though: ${esc(S.sessions[day].trim)}, so hold the weight.` : ""}${prog.bump && !hold ? ` <button class="linkbtn" data-act="bump" data-i="${i}" data-n="${prog.bump}">Apply</button>` : ""}</div>` : ""}
      ${allDone ? "" : `<div class="setrow small muted" aria-hidden="true"><span></span><span class="label">${ex.kind === "time" ? "" : ex.kind === "bodyweight" ? "Added load" : "Weight"}</span><span class="label">${ex.kind === "time" ? "Seconds" : "Reps"}</span><span></span></div>`}
      ${rows}
      <div class="foot">
        ${e.sets.some(s => s.done) || e.effort ? `<div class="effort" role="group" aria-label="How did it feel">
          ${Object.entries(EFFORT).map(([k, v]) => `<button data-act="effort" data-i="${i}" data-v="${k}" aria-pressed="${e.effort === k}">${v.label}</button>`).join("")}
        </div>` : "<span></span>"}
        <div style="display:flex;gap:12px"><button class="linkbtn" data-act="addset" data-i="${i}">+ Set</button>${e.sets.length > 1 ? `<button class="linkbtn" data-act="rmset" data-i="${i}">− Set</button>` : ""}</div>
      </div>
    </div>`;
}

/* ---------- Progress ---------- */
// Three views so the tab isn't one long scroll: lifts (strength + history), load (volume, joints), body (Garmin)
const PROG_VIEWS = [["lifts", "Strength"], ["load", "Workload"], ["body", "Body"]];
try { const v = localStorage.getItem("il-prog-view"); if (PROG_VIEWS.some(([k]) => k === v)) S.progView = v; } catch {}
function progSeg() { return `<div class="seg" role="group" aria-label="Progress view">${PROG_VIEWS.map(([k, n]) => `<button data-act="progview" data-v="${k}" aria-pressed="${S.progView === k}">${n}</button>`).join("")}</div>`; }
function renderProgress() {
  const today = dayKey(new Date());
  const doneEx = {};
  for (const x of allDoneSets()) doneEx[x.ex.id] = (doneEx[x.ex.id] || 0) + 1;
  const exIds = Object.keys(doneEx).sort((a, b) => doneEx[b] - doneEx[a]);
  S._chart = S._wchart = S._vchart = null;
  if (!exIds.length) { const ld = `${S.cardio.length ? renderMuscleBars(today) : ""}${renderJointBars(today)}`;
    return progSeg() + (S.progView === "body" ? renderBody() : S.progView === "load" && ld ? ld : `<section class="block"><h2>Progress</h2><div class="empty"><b>No finished sets yet.</b><span class="small">Once you tick off a few sets, this page charts your strength estimate and volume per lift, your weekly sets per muscle, and your training load.</span></div></section>`); }
  if (!S.progEx || !doneEx[S.progEx]) S.progEx = exIds[0];
  const ex = exById(S.progEx);
  const h = historyFor(S.progEx);
  const best = Math.max(...h.map(r => r.score));
  const last = h[h.length - 1];
  const fourAgo = h.filter(r => r.day <= addDays(today, -28)).pop();
  const fmtScore = v => ex.kind === "weight" ? toDisp(v) : Math.round(v);
  const scoreUnit = ex.kind === "weight" ? unit() : ex.kind === "time" ? "s" : "reps";
  const metricName = ex.kind === "weight" ? "Strength estimate (est. 1-rep max)" : ex.kind === "time" ? "Longest hold" : "Most reps in a set";


  // Weekly totals, last 10 weeks (weeks end today)
  const weeks = [];
  for (let i = 9; i >= 0; i--) { const end = addDays(today, -7 * i); weeks.push({ end, v: totalSets(addDays(end, -6), end) }); }
  const acute = weeks[9].v, chronic = (weeks[6].v + weeks[7].v + weeks[8].v + weeks[9].v) / 4;
  const ratio = chronic ? acute / chronic : 0;
  const rCls = !chronic ? "neutral" : ratio > 1.5 ? "bad" : ratio > 1.3 || ratio < .6 ? "warn" : "good";
  const rTxt = !chronic ? "Not enough history" : ratio > 1.5 ? "Big jump" : ratio > 1.3 ? "Climbing fast" : ratio < .6 ? "Much lighter" : "Steady";

  const sessions = Object.entries(S.sessions).filter(([, s]) => s.entries?.some(e => doneSets(e).length)).sort((a, b) => a[0] < b[0] ? 1 : -1).slice(0, 30);

  S._chart = { pts: h.map(r => ({ day: r.day, v: r.score })), fmt: fmtScore, unit: scoreUnit, kind: "line" };
  S._wchart = { pts: weeks };
  // Volume per session: weight × reps for loaded lifts, total reps (or seconds) otherwise; same-day entries summed
  const volByDay = {};
  for (const r of h) volByDay[r.day] = (volByDay[r.day] || 0) + entryVolume(r.e, ex);
  const vpts = Object.keys(volByDay).sort().map(day => ({ day, v: volByDay[day] }));
  const fmtVol = v => Math.round(ex.kind === "weight" && unit() === "kg" ? v / LB_PER_KG : v).toLocaleString();
  const volUnit = ex.kind === "weight" ? unit() : ex.kind === "time" ? "s" : "reps";
  const volName = ex.kind === "weight" ? "Volume per session · weight × reps, ticked sets" : ex.kind === "time" ? "Total seconds held per session" : "Total reps per session";
  const vl = vpts[vpts.length - 1], vp = vpts[vpts.length - 2];
  const volLine = vl ? `<div class="small muted">Latest <b class="num">${fmtVol(vl.v)}</b> ${volUnit}${vp && vp.v > 0 ? ` · previous ${fmtVol(vp.v)} (${vl.v >= vp.v ? "+" : "−"}${Math.abs(Math.round((vl.v / vp.v - 1) * 100))}%)` : ""} · best ${fmtVol(Math.max(...vpts.map(p => p.v)))}</div>` : "";
  S._vchart = { pts: vpts, fmt: fmtVol, unit: volUnit };
  const hist = sessions.map(([day, s]) => {
    const es = s.entries.filter(e => doneSets(e).length);
    return `<button data-act="goto" data-day="${day}"><div class="l"><div><b>${fmtDay(day)}</b></div><div class="small muted">${es.map(e => esc(exById(e.ex).name)).join(" · ")}</div></div><span class="num small muted">${es.reduce((a, e) => a + doneSets(e).length, 0)} sets</span></button>`;
  }).join("");
  const lifts = `
    <section class="block">
      <h2>Lift progress</h2>
      <select class="sel" id="progex" data-act="progex" aria-label="Exercise">${exIds.map(id => `<option value="${esc(id)}" ${id === S.progEx ? "selected" : ""}>${esc(exById(id).name)} (${doneEx[id]} sets)</option>`).join("")}</select>
      <div class="statrow">
        <div class="stat"><div class="label">Best</div><div class="v">${fmtScore(best)}<span class="small muted"> ${scoreUnit}</span></div></div>
        <div class="stat"><div class="label">Latest</div><div class="v">${fmtScore(last.score)}<span class="small muted"> ${scoreUnit}</span></div></div>
        <div class="stat"><div class="label">${ex.kind === "weight" && latestWeight(today) ? "× bodyweight" : "vs 4 wk ago"}</div><div class="v">${ex.kind === "weight" && latestWeight(today) ? `${(best / latestWeight(today).weightLb).toFixed(2)}×` : fourAgo ? `${last.score >= fourAgo.score ? "+" : "−"}${Math.abs(Math.round((last.score / fourAgo.score - 1) * 100))}%` : "—"}</div></div>
      </div>
      <div class="label">${metricName}${ex.kind === "weight" ? " · the most you could lift once, worked out from your best set each session" : ""}</div>
      <div class="chart" id="chart1"></div>
      <div class="label">${volName}</div>
      ${volLine}
      <div class="chart" id="chart-vol"></div>
    </section>
    <section class="block">
      <h2>History</h2>
      <div class="hist">${hist}</div>
    </section>`;
  const load = `
    ${renderMuscleWeeks(today)}
    ${renderMuscleBars(today)}
    ${renderJointBars(today)}
    <section class="block">
      <h2>Weekly workload</h2>
      <p class="small muted" style="margin:0">Working sets: each ticked set, with easy ones counted as half. Jumps above about 1.5× your average are where tweaks tend to happen.</p>
      <div class="statrow">
        <div class="stat"><div class="label">This week</div><div class="v">${acute.toFixed(0)}<span class="small muted"> sets</span></div></div>
        <div class="stat"><div class="label">4-wk avg</div><div class="v">${chronic.toFixed(0)}<span class="small muted"> sets</span></div></div>
        <div class="stat"><div class="label">vs average</div><div class="v">${chronic ? ratio.toFixed(1) + "×" : "—"}</div><span class="pill ${rCls}">${rTxt}</span></div>
      </div>
      <div class="label">Working sets per week · last 10 weeks</div>
      <div class="chart" id="chart2"></div>
      ${S.cardio.length ? `<div class="label">Cardio minutes per week (walks excluded)</div><div class="chart" id="chart3"></div>` : ""}
    </section>`;
  return progSeg() + (S.progView === "load" ? load : S.progView === "body" ? renderBody() : lifts);
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
  const bars = rows.map(j => {
    const r = jr[j], base = r.base;
    const cls = r.ratio > 1.5 ? "over" : r.ratio > 1.3 ? "warnf" : "";
    const tip = `${JOINT_NAMES[j]}: ${Math.round(r.acute)} points this week · ${r.basis === "usual" ? "usual week" : "normal week of your plan"} ${Math.round(base)}${r.top.length ? ` · mostly ${r.top.join(", ")}` : ""}`;
    return `<div class="bar"><span>${JOINT_NAMES[j][0].toUpperCase() + JOINT_NAMES[j].slice(1)}</span><div class="track" title="${esc(tip)}">
      ${r.acute > 0 ? `<div class="fill ${cls}" style="width:${Math.min(100, r.acute / maxV * 100)}%"></div>` : ""}
      <div class="usual" style="left:${base / maxV * 100}%"></div></div>
      <span class="v ${cls ? "hot" : ""}">${r.acute > 0 ? `${r.ratio.toFixed(1)}×` : "—"}</span></div>`;
  }).join("");
  return `
    <section class="block">
      <h2>Joint stress · last 7 days</h2>
      <p class="small muted" style="margin:0">Reps weighted by how much each exercise stresses the joint (heavier sets count more), plus runs and rows from Strava. The line marks your usual week${Object.values(jr).some(r => r.basis === "starter") ? ", or a normal week of your plan while you're still building history" : ""}. Above 1.5× is a jump your joints haven't adapted to yet.</p>
      <div class="bars">${bars}</div>
    </section>`;
}
function renderMuscleBars(today) {
  const wk = setsPerMuscle(addDays(today, -6), today), cw = cardioLoadPerMuscle(addDays(today, -6), today);
  const prior = setsPerMuscle(addDays(today, -34), addDays(today, -7));
  const usualM = m => prior[m] / 4, histOk = (firstDay() || today) <= addDays(today, -14);
  const anyCardio = Object.values(cw).some(v => v >= .05);
  const maxV = Math.max(22, ...Object.keys(wk).map(m => Math.max(wk[m] + cw[m], usualM(m))));
  const fmt = v => v.toFixed(v % 1 ? 1 : 0);
  const bars = Object.keys(MUSCLES).filter(m => MUSCLES[m].lo > 0 || wk[m] > 0 || cw[m] >= .05).map(m => {
    const M = MUSCLES[m], v = wk[m], c = cw[m] >= .05 ? cw[m] : 0;
    const tip = `${M.n}: ${fmt(v)} lifting sets${c ? ` + ${c.toFixed(1)} from cardio` : ""} · target ${M.lo}–${M.hi}`;
    return `<div class="bar"><span>${M.n}</span><div class="track" title="${tip}">
      <div class="band" style="left:${M.lo / maxV * 100}%;width:${(M.hi - M.lo) / maxV * 100}%"></div>
      ${v > 0 ? `<div class="fill ${v > M.hi ? "over" : ""}" style="width:${Math.min(100, v / maxV * 100)}%"></div>` : ""}
      ${c ? `<div class="cfill" style="left:${v / maxV * 100}%;width:${Math.min(100 - v / maxV * 100, c / maxV * 100)}%"></div>` : ""}
      ${histOk && usualM(m) > 0 ? `<div class="usual" style="left:${usualM(m) / maxV * 100}%" title="Usual week: ${fmt(usualM(m))} sets"></div>` : ""}</div>
      <span class="v">${fmt(v)}${c ? `<span class="cv">+${c.toFixed(1)}</span>` : ""}${histOk && v >= 6 && v > Math.max(usualM(m), 4) * 1.5 ? `<span class="cv hot" title="${(v / Math.max(usualM(m), 4)).toFixed(1)}× your usual week">↑</span>` : ""}</span></div>`;
  }).join("");
  return `
    <section class="block">
      <h2>Sets per muscle · last 7 days</h2>
      <p class="small muted" style="margin:0">Green band is the productive weekly range. Secondary muscles count as partial sets; easy sets count half.</p>
      <div class="legend small"><span><i class="sw lift"></i>Lifting sets</span>${anyCardio ? `<span><i class="sw cardio"></i>Cardio load (fatigue only, not counted toward the target)</span>` : ""}${histOk ? `<span><i class="sw usual"></i>Your usual week</span><span><b class="hot">↑</b> well above usual</span>` : ""}</div>
      <div class="bars">${bars}</div>
    </section>`;
}
function entryVolume(e, ex) { return doneSets(e).reduce((a, s) => a + (ex.kind === "weight" ? (s.w || 0) * s.r : s.r), 0); }
// Weekly sets per muscle over the last 8 weeks, coloured against each muscle's target range
function renderMuscleWeeks(today) {
  const start = firstDay(); if (!start) return "";
  const N = 8, weeks = [];
  for (let i = N - 1; i >= 0; i--) { const end = addDays(today, -7 * i); weeks.push({ end, sp: end >= start ? setsPerMuscle(addDays(end, -6), end) : null }); }
  const ms = Object.keys(MUSCLES).filter(m => MUSCLES[m].lo > 0 || weeks.some(w => w.sp?.[m] >= .5));
  const head = `<span></span>${weeks.map((w, i) => `<span class="h">${i === N - 1 ? "now" : i % 2 ? "" : fmtDay(w.end, { month: "numeric", day: "numeric" })}</span>`).join("")}`;
  const rows = ms.map(m => { const M = MUSCLES[m];
    return `<span class="n" title="Target ${M.lo}–${M.hi} sets a week">${M.n}</span>` + weeks.map(w => {
      if (!w.sp) return `<span class="c na"></span>`;
      const v = w.sp[m], cls = v > M.hi ? "hi" : !M.lo ? (v >= .5 ? "opt" : "") : v >= M.lo ? "ok" : "lo";
      return `<span class="c ${cls}" title="${M.n}, week to ${fmtDay(w.end, { month: "short", day: "numeric" })}: ${v.toFixed(1)} sets (target ${M.lo}–${M.hi})">${v >= .5 ? Math.round(v) : "·"}</span>`;
    }).join(""); }).join("");
  return `
    <section class="block">
      <h2>Sets per muscle · weekly trend</h2>
      <p class="small muted" style="margin:0">Each column is the 7 days ending on that date; "now" is the past 7 days. Counted the same way as the bars below. Watch for a muscle that stays amber week after week.</p>
      <div class="legend small"><span><i class="sw ok"></i>In range</span><span><i class="sw lo"></i>Below range</span><span><i class="sw hi"></i>Over the cap</span></div>
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
  const rows = ks.slice(-7).reverse().map(k => { const x = S.health[k];
    return `<tr><td>${fmtDay(k, { weekday: "short", day: "numeric" })}</td><td>${x.readiness ?? "—"}</td><td>${x.sleepScore ?? "—"}</td><td>${x.hrv ?? "—"}</td><td>${x.bodyBatteryWake ?? x.bodyBatteryHigh ?? "—"}</td><td>${x.restingHr ?? "—"}</td></tr>`; }).join("");
  return `
    <section class="block">
      <h2>Body &amp; recovery</h2>
      <div class="statrow">
        <div class="stat"><div class="label">Weight · 7d avg</div><div class="v">${w7 ? toDisp(w7) : "—"}<span class="small muted"> ${unit()}</span></div></div>
        <div class="stat"><div class="label">vs prior 4 wk</div><div class="v">${w7 && w28 ? `${w7 >= w28 ? "+" : "−"}${toDisp(Math.abs(w7 - w28))}` : "—"}</div></div>
        <div class="stat"><div class="label">Body fat${S.settings.goalFat ? ` · goal ${esc(S.settings.goalFat)}` : ""}</div><div class="v">${fat.length ? fat[fat.length - 1].v.toFixed(1) : "—"}<span class="small muted"> %</span></div></div>
      </div>
      ${renderFuel(today)}
      ${wts.length ? `<div class="label">Weight</div><div class="chart" id="chart-wt"></div>` : ""}
      ${fat.length ? `<div class="label">Body fat %</div><div class="chart" id="chart-fat"></div>` : ""}
      <div class="label">Last 7 mornings (Garmin)</div>
      <div style="overflow-x:auto"><table class="vt"><thead><tr><th>Day</th><th>Ready</th><th>Sleep</th><th>HRV</th><th>Battery</th><th>RHR</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="small muted" style="margin:0">Synced ${g.at ? new Date(g.at).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" }) : "—"}.</p>
    </section>`;
}
function renderFuel(today) {
  const F = fuel(today);
  const st = { ok: ["good", "On track"], low: ["warn", "Below target"], high: ["warn", "Above target"], unknown: ["neutral", "Need more weigh-ins"] }[F.status];
  const hist = F.N.changes.slice(-5).reverse().map(c => `<li>${fmtDay(c.day, { month: "short", day: "numeric" })}: ${c.delta > 0 ? "+" : "−"}${Math.abs(c.delta)} kcal → ~${c.kcal.toLocaleString()} (weight was ${fmtRate(c.perWk)})</li>`).join("");
  return `
      <div class="label" style="display:flex;gap:8px;align-items:center">Fuel · ${esc(F.G.n.toLowerCase())} <span class="pill ${st[0]}">${st[1]}</span></div>
      <div class="statrow">
        <div class="stat"><div class="label">Trend</div><div class="v">${F.tr.perWk != null && F.tr.n >= 3 ? fmtRate(F.tr.perWk).split(" ")[0] : "—"}<span class="small muted"> ${unit()}/wk</span></div><div class="small muted">goal ${F.G.r} lb</div></div>
        <div class="stat"><div class="label">Daily target</div><div class="v">${F.kcal.toLocaleString()}<span class="small muted"> kcal</span></div></div>
        <div class="stat"><div class="label">Protein</div><div class="v">${F.prot}<span class="small muted"> g</span></div></div>
      </div>
      <p class="small muted" style="margin:0">No food logging: the trend line through your weigh-ins${F.tr.n >= 2 ? ` (${F.tr.n} since ${fmtDay(addDays(F.tr.from, 1), { month: "short", day: "numeric" })})` : ""} shows whether you're eating enough. The calorie number is a rough guess to anchor on; the changes to it are what matter.${F.nextCheck && F.nextCheck > today ? ` Next check ${fmtDay(F.nextCheck, { weekday: "short", month: "short", day: "numeric" })}.` : ""}</p>
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
function lineChart(el, { pts, fmt, unit: u }) {
  const W = 640, H = 220, L = 44, R = 14, T = 14, B = 26;
  if (pts.length < 2) { el.innerHTML = `<p class="small muted" style="margin:8px">Log this lift on two different days to see a trend.</p>`; return; }
  const t0 = parseDay(pts[0].day).getTime(), t1 = parseDay(pts[pts.length - 1].day).getTime();
  const vals = pts.map(p => p.v), vmin = Math.min(...vals), vmax = Math.max(...vals);
  const ticks = niceTicks(vmin - (vmax - vmin) * .1 - .5, vmax + (vmax - vmin) * .1 + .5);
  const y0 = ticks[0], y1 = ticks[ticks.length - 1];
  const X = t => L + (t - t0) / Math.max(1, t1 - t0) * (W - L - R), Y = v => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
  const xy = pts.map(p => [X(parseDay(p.day).getTime()), Y(p.v)]);
  const line = xy.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
  const area = `${line}L${xy[xy.length - 1][0].toFixed(1)},${H - B}L${xy[0][0].toFixed(1)},${H - B}Z`;
  // first, middle and last dates; the middle one only when it has room (dates bunched at one end would overlap)
  const xl = [0, Math.floor((pts.length - 1) / 2), pts.length - 1].filter((v, i, a) => a.indexOf(v) === i)
    .filter((v, i, a) => i === 0 || i === a.length - 1 || (xy[v][0] - xy[a[0]][0] > 70 && xy[a[a.length - 1]][0] - xy[v][0] > 70));
  const last = xy[xy.length - 1];
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend chart">
    ${ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${Y(t) + 3}" text-anchor="end">${fmt(t)}</text>`).join("")}
    ${xl.map(i => `<text x="${xy[i][0]}" y="${H - 8}" text-anchor="${i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"}">${fmtDay(pts[i].day, { month: "short", day: "numeric" })}</text>`).join("")}
    <path d="${area}" fill="var(--accent-soft)" opacity=".7"/>
    <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>
    ${xy.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2.5" fill="var(--accent)"/>`).join("")}
    <circle cx="${last[0]}" cy="${last[1]}" r="5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>
    <line id="xh" x1="0" x2="0" y1="${T}" y2="${H - B}" stroke="var(--muted)" stroke-dasharray="3 3" visibility="hidden"/>
    <rect x="${L}" y="0" width="${W - L - R}" height="${H}" fill="transparent" id="hit"/>
  </svg><div class="tip" hidden></div>`;
  const svg = el.querySelector("svg"), tip = el.querySelector(".tip"), xh = el.querySelector("#xh");
  const move = ev => {
    const r = svg.getBoundingClientRect(), sx = (ev.clientX - r.left) / r.width * W;
    let bi = 0; xy.forEach((p, i) => { if (Math.abs(p[0] - sx) < Math.abs(xy[bi][0] - sx)) bi = i; });
    xh.setAttribute("x1", xy[bi][0]); xh.setAttribute("x2", xy[bi][0]); xh.setAttribute("visibility", "visible");
    tip.hidden = false; tip.textContent = `${fmtDay(pts[bi].day, { month: "short", day: "numeric" })} · ${fmt(pts[bi].v)} ${u}`;
    tip.style.left = (xy[bi][0] / W * r.width + 8) + "px"; tip.style.top = (xy[bi][1] / H * r.height + 8) + "px";
  };
  svg.addEventListener("pointermove", move); svg.addEventListener("pointerdown", move);
  svg.addEventListener("pointerleave", () => { tip.hidden = true; xh.setAttribute("visibility", "hidden"); });
}
function barChart(el, { pts, label = "sets" }) {
  const W = 640, H = 180, L = 34, R = 8, T = 12, B = 24;
  const ticks = niceTicks(0, Math.max(10, ...pts.map(p => p.v)));
  const y1 = ticks[ticks.length - 1], Y = v => T + (1 - v / y1) * (H - T - B);
  const bw = (W - L - R) / pts.length;
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Weekly sets">
    ${ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)"/><text x="${L - 6}" y="${Y(t) + 3}" text-anchor="end">${t}</text>`).join("")}
    ${pts.map((p, i) => { const x = L + i * bw + 3, h = Math.max(0, H - B - Y(p.v)), w = bw - 6;
      return `<g class="b" data-i="${i}"><rect x="${L + i * bw}" y="${T}" width="${bw}" height="${H - T - B}" fill="transparent"/>
      ${h > 0 ? `<path d="M${x},${H - B}V${Y(p.v) + Math.min(4, h)}q0,-4 4,-4h${w - 8}q4,0 4,4V${H - B}Z" fill="${i === pts.length - 1 ? "var(--accent)" : "var(--accent-soft)"}"/>` : ""}
      ${i % 3 === 0 || i === pts.length - 1 ? `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${i === pts.length - 1 ? "now" : fmtDay(p.end, { month: "short", day: "numeric" })}</text>` : ""}</g>`; }).join("")}
  </svg><div class="tip" hidden></div>`;
  const svg = el.querySelector("svg"), tip = el.querySelector(".tip");
  svg.querySelectorAll("g.b").forEach(g => {
    const show = () => { const i = +g.dataset.i, p = pts[i], r = svg.getBoundingClientRect();
      tip.hidden = false; tip.textContent = `Week to ${fmtDay(p.end, { month: "short", day: "numeric" })} · ${p.v.toFixed(0)} ${label}`;
      tip.style.left = ((L + (i + .5) * bw) / W * r.width) + "px"; tip.style.top = (Y(p.v) / H * r.height) + "px"; };
    g.addEventListener("pointerenter", show); g.addEventListener("pointerdown", show);
  });
  svg.addEventListener("pointerleave", () => tip.hidden = true);
}

/* ---------- Plan tab and Settings ---------- */
let draft = { name: "", pattern: "push", kind: "weight", muscles: {} };
// Plan holds what shapes your training; Exercises the map and your own lifts. Settings (gear) holds units, sync and backup
const PLAN_VIEWS = [["plan", "Your plan"], ["exercises", "Exercises"]];
try { const v = localStorage.getItem("il-plan-view"); if (PLAN_VIEWS.some(([k]) => k === v)) S.planView = v; } catch {}
function planSeg() { return `<div class="seg" role="group" aria-label="Plan view">${PLAN_VIEWS.map(([k, n]) => `<button data-act="planview" data-v="${k}" aria-pressed="${(S.planView || "plan") === k}">${n}</button>`).join("")}</div>`; }
function renderPlan() {
  const rs = Object.values(S.routines).sort((a, b) => a.name.localeCompare(b.name));
  const cs = Object.values(S.custom).sort((a, b) => a.name.localeCompare(b.name));
  const sch = S.settings.schedule;
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayDow = new Date().getDay();
  const wk = { ...WEEK_DEFAULT, ...(S.settings.week || {}) };
  const rot = (wk.rotation || Object.keys(S.routines).sort()).filter(id => S.routines[id]);
  const t = dayKey(new Date()), eq = equip();
  let liftsN = 0; for (let i = 0; i <= 6; i++) if (liftedOn(addDays(t, -i))) liftsN++;
  const cardioN = cardioOn(addDays(t, -6), t).length;
  const stepper = (key, v, lo, hi, step = 1) => `<span class="stepper" style="display:inline-flex;width:auto"><button data-act="wk" data-k="${key}" data-d="${-step}" aria-label="Fewer" ${v <= lo ? "disabled" : ""}>−</button><span class="num" style="min-width:24px;text-align:center">${v}</span><button data-act="wk" data-k="${key}" data-d="${step}" aria-label="More" ${v >= hi ? "disabled" : ""}>+</button></span>`;
  if (S.tab === "settings") return `
    <section class="block">
      <h2>Settings</h2>
      <div class="list">${(S.settings.tipsSeen || []).length ? `<div class="row"><div class="l"><b>Tips</b><div class="small muted">The short how-to notes shown the first time you use each screen.</div></div><button class="linkbtn" data-act="tipsreset">Show again</button></div>` : ""}<div class="row"><div class="l"><b>Weights in</b><div class="small muted">Only changes what you see. Your log converts either way.</div></div>
        <div class="unit-toggle" role="group" aria-label="Units">${["lb", "kg"].map(u => `<button type="button" data-act="unit" data-v="${u}" aria-pressed="${unit() === u}">${u}</button>`).join("")}</div></div></div>
    </section>
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
    </section>
    ${renderAccount()}
    <section class="block">
      <h2>Backup</h2>
      <p class="small muted" style="margin:0">${window.Sync?.state.user ? "Your log is synced to your account. A backup file is still handy as an extra copy." : "Your log is saved on this device only. Download a backup now and then, or sign in above to sync it."}</p>
      <div class="actions" style="margin-top:0"><button class="btn" data-act="export">Download backup</button><button class="btn" data-act="import">Restore from backup…</button></div>
      <input type="file" id="importfile" accept="application/json,.json" hidden>
    </section>
    <p class="small muted"><a href="privacy.html" style="color:var(--accent)">Privacy</a> · <a href="https://github.com/valerio86/iron-ledger" style="color:var(--accent)">About</a> · Not medical advice.</p>`;
  return planSeg() + (S.planView === "exercises" ? `
    ${renderExMap()}
    <section class="block">
      <h2>Your exercises</h2>
      ${cs.length ? `<div class="list">${cs.map(e => `<div class="row"><div class="l"><b>${esc(e.name)}</b><div class="small muted">${PATTERN_NAMES[e.pattern]} · ${Object.entries(e.muscles).map(([m, w]) => `${MUSCLES[m]?.n}${w < 1 ? " (½)" : ""}`).join(", ")}</div></div><button class="linkbtn" data-act="delex" data-id="${esc(e.id)}" style="color:var(--bad)">${S.confirmDel === e.id ? "Confirm delete" : "Delete"}</button></div>`).join("")}</div>` : `<p class="small muted" style="margin:0">${BUILTIN.length} common lifts are built in. Add anything else here.</p>`}
      <form class="custom" id="customform">
        <h3>New exercise</h3>
        <input type="text" id="cx-name" placeholder="Name, e.g. Landmine press" value="${esc(draft.name)}" required>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <select id="cx-pattern" aria-label="Movement pattern">${Object.entries(PATTERN_NAMES).map(([k, v]) => `<option value="${k}" ${draft.pattern === k ? "selected" : ""}>${v}</option>`).join("")}</select>
          <select id="cx-kind" aria-label="How it's measured"><option value="weight" ${draft.kind === "weight" ? "selected" : ""}>Weight × reps</option><option value="bodyweight" ${draft.kind === "bodyweight" ? "selected" : ""}>Bodyweight reps</option><option value="time" ${draft.kind === "time" ? "selected" : ""}>Timed hold</option></select>
        </div>
        <div class="label">Muscles: tap once for primary, twice for secondary</div>
        <div class="mgrid">${Object.entries(MUSCLES).map(([m, M]) => `<button type="button" data-act="cxm" data-m="${m}" data-w="${draft.muscles[m] || 0}">${M.n}</button>`).join("")}</div>
        <button class="btn primary" type="submit">Add exercise</button>
      </form>
    </section>
` : `
    <section class="block">
      <h2>Your week</h2>
      ${S.weekEdit ? `
      <p class="small muted" style="margin:0">No fixed days. Each morning the coach picks lift, cardio or rest from the last 7 days and how recovered you are. Lifting days are never back to back.</p>
      <div class="list">
        <div class="row"><div class="l"><b>Lifting sessions</b><div class="small muted">${liftsN} in the last 7 days</div></div>${stepper("lifts", wk.lifts, 2, 5)}</div>
        <div class="row"><div class="l"><b>Easy cardio sessions</b><div class="small muted">${cardioN} in the last 7 days (15+ min, walks excluded)</div></div>${stepper("cardio", wk.cardio, 0, 6)}</div>
        <div class="row"><div class="l"><b>Cardio minutes a week</b><div class="small muted">${cardioMinutes(addDays(t, -6), t)} in the last 7 days${S.settings.hrZ2 ? ` · Zone 2 is ${S.settings.hrZ2.lo}–${S.settings.hrZ2.hi} bpm (${esc(S.settings.hrZ2.source || "")})` : ""}</div></div>${stepper("cardioMin", wk.cardioMin, 30, 300, 10)}</div>
        <div class="row"><div class="l"><b>Cardio you do</b><div class="suggest" style="margin-top:6px">${Object.entries(CARDIO_TYPES).filter(([k]) => k !== "Walk").map(([k, n]) => `<button class="chipbtn ${cardioTypes().includes(k) ? "primary" : ""}" data-act="cardiotype" data-v="${k}" aria-pressed="${cardioTypes().includes(k)}">${n}</button>`).join("")}</div></div></div>
        <div class="row"><div class="l"><b>Rotation</b><div class="small muted">${rot.map((id, i) => `${i + 1}. ${esc(S.routines[id].name)}`).join(" → ")}. The coach goes in this order, but skips ahead when a routine's muscles are still tired.</div></div></div>
      </div>
      ${sch ? `<details class="fold"><summary>Original template week (reference)</summary><div style="overflow-x:auto;margin-top:8px"><table class="vt"><tbody>${[1, 2, 3, 4, 5, 6, 0].map(d => { const p = sch[d]; return p ? `<tr><td>${DOW[d]}</td><td style="text-align:left;font-family:var(--font-body)">${esc(p.label)}</td><td class="small" style="font-family:var(--font-body);color:var(--muted)">${esc(p.note || "")}</td></tr>` : ""; }).join("")}</tbody></table></div></details>` : ""}
      ${S.settings.rules ? `<details class="fold"><summary>Plan rules</summary><ul class="small" style="margin:8px 0 0;padding-left:18px">${S.settings.rules.map(r => `<li>${esc(r)}</li>`).join("")}</ul></details>` : ""}
      <div class="actions"><button class="btn primary" data-act="weekedit">Done</button></div>` : `
      <div class="weeksum">
        <div class="wmeters">${[["Lifts", liftsN, wk.lifts], ["Cardio", cardioN, wk.cardio], ["Cardio min", cardioMinutes(addDays(t, -6), t), wk.cardioMin]].map(([n, v, g]) => `
          <div class="wm"><div class="label">${n}</div><div class="num"><b>${v}</b> / ${g}</div><div class="wbar"><i style="width:${Math.min(100, g ? v / g * 100 : 0)}%"></i></div></div>`).join("")}</div>
        <div class="small muted">Last 7 days against your weekly target. No fixed days: each morning the coach picks lift, cardio or rest, and never lifts two days running.</div>
        <div class="small"><b>Cardio:</b> ${cardioTypes().filter(k => k !== "Walk").map(k => esc(CARDIO_TYPES[k] || k)).join(", ") || "none picked"} · <b>Rotation:</b> ${rot.map(id => esc(S.routines[id].name)).join(" → ") || "no routines yet"}</div>
        <div><button class="btn" data-act="weekedit">Edit week</button></div>
      </div>`}
    </section>
    <section class="block">
      <h2>Your goal</h2>
      <p class="small muted" style="margin:0">Sets the weight trend the coach steers your eating toward, using your weigh-ins. No food logging.</p>
      <div class="suggest">${Object.entries(GOALS).map(([k, g]) => `<button class="chipbtn ${nutri().goal === k ? "primary" : ""}" data-act="goal" data-v="${k}">${g.n} <span class="small">${g.r} lb/wk</span></button>`).join("")}</div>
      <div class="list"><div class="row"><div class="l"><b>Daily calories</b><div class="small muted">A starting guess the coach adjusts from your trend. Change it if you know better.</div></div>${(() => { const k = fuel(t).kcal; return `<span class="stepper" style="display:inline-flex;width:auto"><button data-act="kcal" data-d="-50" aria-label="Fewer calories">−</button><span class="num" style="min-width:52px;text-align:center">${k.toLocaleString()}</span><button data-act="kcal" data-d="50" aria-label="More calories">+</button></span>`; })()}</div></div>
    </section>
    <section class="block">
      <h2>Your equipment</h2>
      <p class="small muted" style="margin:0">Tap what you own. When you start a routine, exercises that need missing gear are swapped for the closest one you can do. At a max load, progress moves to more reps and then slower reps, instead of more weight.</p>
      <div class="mgrid">${Object.entries(EQUIP).map(([k, n]) => `<button type="button" data-act="eq" data-k="${k}" data-w="${eq.have.includes(k) ? 1 : 0}" aria-pressed="${eq.have.includes(k)}">${n}</button>`).join("")}</div>
      ${LOADABLE.filter(k => eq.have.includes(k)).map(k => `<label class="eqmax" for="eqmax-${k}"><span>${EQUIP[k]}: heaviest you can load${k === "dumbbells" || k === "kettlebell" ? " (each)" : ", bar included"}</span>
        <span class="stepper" style="display:inline-flex;width:auto"><input id="eqmax-${k}" inputmode="decimal" value="${eq.max[k] ? toDisp(eq.max[k]) : ""}" placeholder="no cap" style="width:72px"><span class="u">${unit()}</span></span></label>`).join("")}
    </section>
    <section class="block">
      <h2>Routines</h2>
      ${rs.length ? `<div class="list">${rs.map(r => `<div class="row"><div class="l"><b>${esc(r.name)}</b><div class="small muted routine-items">${r.items.map(it => `<span>${esc(exById(it.ex).name)} ${it.sets}×${it.r}${it.rHi && it.rHi !== it.r ? `–${it.rHi}` : ""} ${helpBtn(it.ex, exById(it.ex).name)}</span>`).join("")}</div></div><div class="rowbtns"><button class="linkbtn" data-act="editroutine" data-id="${esc(r.id)}">Edit</button><button class="linkbtn" data-act="delroutine" data-id="${esc(r.id)}" style="color:var(--bad)">${S.confirmDel === r.id ? "Confirm delete" : "Delete"}</button></div></div>`).join("")}</div>`
        : `<div class="empty small">No routines yet. Make one here, or log a workout and save it as a routine.</div>`}
      <div class="actions" style="margin-top:4px">
        <button class="btn primary" data-act="editroutine">+ New routine</button>
        ${S.sessions[S.day]?.entries?.length ? `<button class="btn" data-act="routinefromday">Save ${S.day === dayKey(new Date()) ? "today's workout" : fmtDay(S.day)} as a routine</button>` : ""}
      </div>
    </section>
`);
}

/* ---------- Exercise ↔ muscle map (bipartite) ---------- */
// Tap an exercise → its muscles light up; tap a muscle → the exercise list narrows to everything that trains it
function renderExMap() {
  const sel = S.libSel, pat = S.libPat || "all", today = dayKey(new Date());
  const used = {}; for (const x of allDoneSets()) used[x.ex.id] = (used[x.ex.id] || 0) + 1;
  const all = allEx(), selEx = sel?.type === "ex" ? exById(sel.id) : null, selM = sel?.type === "m" ? sel.id : null;
  const exNode = e => {
    const on = selEx?.id === e.id, lit = selM && e.muscles[selM] >= .75;
    return `<div class="exn" data-node-ex="${esc(e.id)}"><button class="node ${on ? "on" : lit ? "lit" : ""} ${selEx && !on ? "dim" : ""}" data-act="bpex" data-id="${esc(e.id)}" title="${esc(e.name)}"><span>${esc(e.name)}</span>${used[e.id] ? `<i class="used" title="You've logged this"></i>` : ""}</button>${helpBtn(e.id, e.name)}</div>`;
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
    <div class="sb">${Object.entries(PATTERN_NAMES).filter(([k]) => groups[k]).map(([k, n]) => `<div class="label grouphdr">${n}</div>` + groups[k].map(e => `
      <div class="exline"><button class="exrow" data-act="add" data-id="${esc(e.id)}"><div class="l"><div>${esc(e.name)}</div><div class="small muted">${Object.entries(e.muscles).filter(([, w]) => w >= .75).map(([m]) => MUSCLES[m]?.n).join(" · ")}</div>${why(e)}</div>${tag(e)}</button>${helpBtn(e.id, e.name)}</div>`).join("")).join("") || `<p class="muted">No match. Add it under Plan → Exercises.</p>`}</div>
  </div></div>`;
  const inp = $("#exsearch"); inp.focus(); inp.setSelectionRange(q.length, q.length);
  inp.oninput = () => openAdd(inp.value);
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

/* ---------- Exercise guide panel ---------- */
function helpBtn(exId, name) { return `<button class="help" data-act="help" data-id="${esc(exId)}" aria-label="How to do ${esc(name)}">?</button>`; }
function openHelp(exId) {
  const ex = exById(exId), g = GUIDE[exId];
  const mus = Object.entries(ex.muscles).sort((a, b) => b[1] - a[1]);
  const chips = mus.map(([m, w]) => `<span class="pill ${w >= .75 ? "good" : "neutral"}">${MUSCLES[m]?.n || m}${w >= .75 ? "" : " (assist)"}</span>`).join("");
  const h = historyFor(exId);
  const fmtS = v => ex.kind === "weight" ? `est. 1RM ${fmtW(v)}` : `${Math.round(v)}${ex.kind === "time" ? " s" : " reps"}`;
  const last = h[h.length - 1];
  const hist = h.length ? `Best ${fmtS(Math.max(...h.map(r => r.score)))} · last done ${fmtDay(last.day)} (${last.e.sets.filter(s => s.done).map(s => ex.kind === "weight" ? `${toDisp(s.w)}×${s.r}` : s.r).join(", ")})` : "You haven't logged this one yet.";
  const sec = (title, items, cls = "") => items?.length ? `<h3>${title}</h3><ul class="${cls}">${items.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : "";
  $("#help").innerHTML = `<div class="sheet-bg" data-act="closehelp"><div class="sheet guide" role="dialog" aria-modal="true" aria-labelledby="guide-title">
    <div class="sh"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2 id="guide-title">${esc(ex.name)}</h2><button class="x iconbtn" data-act="closehelp" aria-label="Close">×</button></div>
      <div class="suggest">${chips}</div></div>
    <div class="sb">
      ${g ? `${sec("Setup", g.s)}${sec("The rep", g.r, "steps")}${sec("Posture cues", g.c, "cues")}${sec("Common mistakes", g.m, "mistakes")}`
          : `<p class="muted">This is one of your own exercises, so there's no write-up for it. General rules: brace your abs before each rep, move through a full range you can control, and lower the weight more slowly than you lift it.</p>`}
      <p class="hint warn" style="margin-top:14px">${GUIDE_ALWAYS}</p>
      ${missingFor(exId).length ? `<p class="hint info">Needs ${esc(missingFor(exId).join(" and "))}, which isn't in your equipment list (Plan tab) yet.</p>` : ""}
      <p class="small muted">${hist}</p>
    </div></div></div>`;
  $("#help .x").focus();
}
function closeHelp() { $("#help").innerHTML = ""; }

/* ============================== Actions ============================== */
function newEntry(exId, day) {
  const ex = exById(exId);
  const p = progression(exId, day);
  if (p?.last) {
    const sets = p.last.e.sets.map(s => ({ w: s.w || 0, r: s.r, done: false }));
    return { id: uid(), ex: exId, sets, effort: null, ...(p.last.e.rHi ? { rLo: p.last.e.rLo, rHi: p.last.e.rHi } : {}) };
  }
  const r = ex.kind === "time" ? 30 : ex.kind === "bodyweight" ? 10 : 8;
  return { id: uid(), ex: exId, sets: Array.from({ length: 3 }, () => ({ w: 0, r, done: false })), effort: null };
}
function mutate(fn) { const s = sessionDoc(S.day); fn(s); saveDay(S.day); render(); }
function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => el.hidden = true, 2600); }

document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act, i = +b.dataset.i, j = +b.dataset.j;
  if ((act === "closesheet" || act === "closehelp") && ev.target !== b && b.classList.contains("sheet-bg")) return;
  if (act === "help") { openHelp(b.dataset.id); return; }
  if (act === "closehelp") { closeHelp(); return; }
  const E = () => sessionDoc(S.day).entries[i];
  switch (act) {
    case "prevday": S.day = addDays(S.day, -1); render(); break;
    case "nextday": S.day = addDays(S.day, 1); render(); break;
    case "swap": mutate(() => {
      const old = E(), ne = newEntry(b.dataset.id, S.day);
      if (!historyFor(b.dataset.id, S.day).length) ne.sets = old.sets.map(s => ({ w: 0, r: exById(b.dataset.id).kind === "time" ? 30 : s.r, done: false }));
      if (old.rHi && exById(b.dataset.id).kind === exById(old.ex).kind) { ne.rLo = old.rLo; ne.rHi = old.rHi; }
      sessionDoc(S.day).entries[i] = ne;
    }); toast(`Swapped to ${exById(b.dataset.id).name}`); break;
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
      S.settings = { ...S.settings, equip: { have, max: e.max } }; render(); await saveDoc("settings/main", S.settings); break;
    }
    case "bppat": S.libPat = b.dataset.v; render(); break;
    case "bpclear": S.libSel = null; render(); break;
    case "planview": S.planView = b.dataset.v; try { localStorage.setItem("il-plan-view", S.planView); } catch {} render(); break;
    case "unit": if (S.settings.unit !== b.dataset.v) { S.settings = { ...S.settings, unit: b.dataset.v }; render(); await saveDoc("settings/main", S.settings); } break;
    case "progview": S.progView = b.dataset.v; try { localStorage.setItem("il-prog-view", S.progView); } catch {} render(); break;
    case "openroutines": openRoutines(); break;
    case "closesheet": closeSheet(); break;
    case "add": if (S.addFor === "routine") { const ex = exById(b.dataset.id); S.addFor = null; S.rEdit.items.push({ ex: ex.id, sets: 3, r: ex.kind === "time" ? 30 : 8, ...(ex.kind === "time" ? {} : { rHi: 12 }), w: 0 }); openRoutineEditor(); break; }
      closeSheet(); mutate(s => { s.entries.push(newEntry(b.dataset.id, S.day)); s.finished = false; }); toast(`Added ${exById(b.dataset.id).name}`); break;
    case "routine": {
      const r = S.routines[b.dataset.id], trim = trimReason(S.day), plan = b.dataset.raw ? { items: r.items, changes: [] } : adaptRoutine(r, S.day); closeSheet();
      mutate(s => { if (trim) s.trim = trim; for (const it of plan.items) { const e = newEntry(it.ex, S.day); const p = progression(it.ex, S.day);
        const w = p?.last ? Math.max(...p.last.e.sets.map(x => x.w || 0)) : (it.w || 0);
        // carry last session's reps forward inside the range; start new lifts at the bottom
        const lastR = p?.last ? Math.max(...p.last.e.sets.map(x => x.r || 0)) : it.r;
        const r = p?.capped ? p.nextR : p?.resetReps ? it.r : Math.min(it.rHi || lastR, Math.max(it.r, lastR));
        e.sets = Array.from({ length: trim ? Math.max(1, it.sets - 1) : it.sets }, () => ({ w, r, done: false }));
        if (it.rHi) { e.rLo = it.r; e.rHi = it.rHi; }
        s.entries.push(e); } s.routine = r.id; s.finished = false; });
      toast(`Started ${r.name}${plan.changes.length ? ` with ${plan.changes.length} change${plan.changes.length > 1 ? "s" : ""} for today` : ""}${trim ? `, one set lighter (${trim})` : ""}`); break;
    }
    case "rm": mutate(s => s.entries.splice(i, 1)); break;
    case "done": mutate(() => { const st = E().sets[j]; st.done = !st.done; st.t = st.done ? (S.day === dayKey(new Date()) ? Date.now() : parseDay(S.day).getTime()) : null; }); break;
    case "w+": case "w-": mutate(() => { const st = E().sets[j]; const ex = exById(E().ex); const step = unit() === "kg" ? stepLb() : (ex.inc && ex.inc < 5 ? ex.inc : 5);
      st.w = Math.max(0, +((st.w || 0) + (act === "w+" ? step : -step)).toFixed(2)); if (act === "w+") for (let k = j + 1; k < E().sets.length; k++) if (!E().sets[k].done && E().sets[k].w < st.w) E().sets[k].w = st.w; }); break;
    case "r+": case "r-": mutate(() => { const st = E().sets[j]; const d = exById(E().ex).kind === "time" ? 5 : 1; st.r = Math.max(0, st.r + (act === "r+" ? d : -d)); }); break;
    case "effort": mutate(() => { E().effort = E().effort === b.dataset.v ? null : b.dataset.v; }); break;
    case "addset": mutate(() => { const l = E().sets[E().sets.length - 1]; E().sets.push({ w: l.w, r: l.r, done: false }); }); break;
    case "repeat": mutate(() => { const L = progression(E().ex, S.day).last; E().sets = doneSets(L.e).map(x => ({ w: x.w || 0, r: x.r, done: false })); }); toast("Loaded last time's sets"); break;
    case "weekedit": S.weekEdit = !S.weekEdit; render(); break;
    case "tipok": case "tipsreset": S.settings = { ...S.settings, tipsSeen: act === "tipsreset" ? [] : [...new Set([...(S.settings.tipsSeen || []), b.dataset.k])] }; render(); if (act === "tipsreset") toast("Tips will show again"); await saveDoc("settings/main", S.settings); break;
    case "rmset": mutate(() => { E().sets.pop(); }); break;
    case "bump": mutate(() => { const n = +b.dataset.n; E().sets.forEach(s => { if (!s.done) { s.w = Math.max(0, +((s.w || 0) + n).toFixed(2)); if (n > 0 && E().rLo) s.r = E().rLo; } }); }); break;
    case "finish": mutate(s => { s.finished = !s.finished; s.finishedAt = s.finished ? Date.now() : null; }); if (S.sessions[S.day].finished) { toast("Workout logged"); window.scrollTo(0, 0); } break;
    case "wk": {
      const k = b.dataset.k, cur = { ...WEEK_DEFAULT, ...(S.settings.week || {}) };
      cur[k] = Math.max(0, cur[k] + +b.dataset.d);
      S.settings = { ...S.settings, week: cur }; render(); await saveDoc("settings/main", S.settings); break;
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
document.querySelectorAll("nav.tabs button").forEach(b => b.addEventListener("click", () => { S.tab = b.id.slice(4); closeSheet(true); render(); window.scrollTo(0, 0); }));
$("#open-settings").addEventListener("click", () => { S.tab = "settings"; closeSheet(true); render(); window.scrollTo(0, 0); });
document.addEventListener("change", ev => {
  const t = ev.target;
  if (t.dataset.act === "w" || t.dataset.act === "r") {
    const i = +t.dataset.i, j = +t.dataset.j;
    // A typed value also fills the later unticked sets that still held the old one
    mutate(s => { const sets = s.entries[i].sets, k = t.dataset.act, old = sets[j][k];
      sets[j][k] = k === "w" ? (t.value.trim() === "" ? 0 : fromDisp(t.value)) : Math.max(0, parseInt(t.value) || 0);
      for (let n = j + 1; n < sets.length; n++) if (!sets[n].done && sets[n][k] === old) sets[n][k] = sets[j][k]; });
  }
  if (t.id === "progex") { S.progEx = t.value; render(); }
  if (t.dataset.re && S.rEdit) { const it = S.rEdit.items[+t.dataset.k], v = parseInt(t.value) || 0;
    if (t.dataset.re === "r") it.r = Math.max(1, v); else if (v > 0) it.rHi = v; else delete it.rHi; }
  if (t.id?.startsWith("eqmax-")) {
    const k = t.id.slice(6), e = equip();
    S.settings = { ...S.settings, equip: { have: e.have, max: { ...e.max, [k]: t.value.trim() === "" ? 0 : fromDisp(t.value) } } };
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
const queueLinks = () => { if (S.tab !== "plan" || linkFrame) return; linkFrame = requestAnimationFrame(() => { linkFrame = 0; drawLinks(); }); };
window.addEventListener("scroll", queueLinks, { passive: true });
window.addEventListener("resize", queueLinks);
document.fonts?.ready.then(queueLinks);
document.addEventListener("keydown", ev => { if (ev.key !== "Escape") return; if ($("#help").innerHTML) closeHelp(); else if ($("#sheet").innerHTML) closeSheet(); });

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
