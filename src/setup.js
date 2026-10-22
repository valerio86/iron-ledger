"use strict";
/* First-run setup, starter routines, and manual cardio / weigh-ins (what Strava and Garmin supplied in the artifact).
   Loaded after app.js (its boot() awaits IndexedDB, so this file runs before the first real render). */

/* ============================== Manual log: body/<day> { weightLb?, cardio: [{ id, sport, mins, effort, re? }] } (re: imported Strava relative effort) ============================== */
const CARDIO_TYPES = { Run: "Run", Ride: "Bike", Rowing: "Row", Swim: "Swim", Hike: "Hike", Elliptical: "Elliptical", StairStepper: "Stairs", NordicSki: "Ski", Walk: "Walk" };
const LOW_IMPACT = ["Ride", "Rowing", "Swim", "Elliptical"];
// Relative-effort points per minute, roughly what Strava gives for each effort (30 min easy ≈ 25)
const CARDIO_EFFORT = { easy: { label: "Easy", re: .85 }, moderate: { label: "Moderate", re: 1.4 }, hard: { label: "Hard", re: 2.2 } };

S.body = {}; S.extCardio = []; S.extHealth = {};
// S.cardio / S.health are what the coach reads: connector data plus what you logged by hand
function rebuildDerived() {
  const manual = [];
  const health = structuredClone(S.extHealth);
  for (const [day, b] of Object.entries(S.body)) {
    if (b.weightLb) health[day] = { ...(health[day] || {}), weightLb: b.weightLb };
    (b.cardio || []).forEach((c, i) => manual.push({ id: c.id, name: CARDIO_TYPES[c.sport] || c.sport, sport: c.sport, day,
      t: parseDay(day).getTime() + (6 + i) * 36e5, mins: c.mins, km: 0, re: c.re ?? Math.round(c.mins * (CARDIO_EFFORT[c.effort]?.re || 1)), muscles: CARDIO[c.sport] || {}, manual: true }));
  }
  S.cardio = [...S.extCardio, ...manual];
  S.health = health;
}
function bodyDoc(day) { return S.body[day] || { cardio: [] }; }
async function saveBody(day, b) {
  const empty = !b.weightLb && !(b.cardio || []).length;
  if (empty) delete S.body[day]; else S.body[day] = b;
  rebuildDerived(); render();
  await saveDoc("body/" + day, empty ? null : b);
}

// The cardio you do, in your words: "run or bike"
function cardioTypes() { const t = S.settings.cardioTypes; return t?.length ? t : ["Rowing", "Run"]; }
function cardioWords(list = cardioTypes(), n = 2) { const w = list.slice(0, n).map(t => (CARDIO_TYPES[t] || t).toLowerCase()); return w.length > 1 ? `${w.slice(0, -1).join(", ")} or ${w[w.length - 1]}` : w[0] || "cardio"; }
function lowImpactWords() { const l = cardioTypes().filter(t => LOW_IMPACT.includes(t)); return l.length ? cardioWords(l) : "bike or swim"; }

function openCardio() {
  const day = S.day, b = bodyDoc(day), d = S.clDraft || (S.clDraft = { sport: cardioTypes()[0], mins: 30, effort: "easy" });
  const types = [...new Set([...cardioTypes(), ...Object.keys(CARDIO_TYPES)])];
  $("#sheet").innerHTML = `<div class="sheet-bg" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Log cardio">
    <div class="sh"><div style="display:flex;justify-content:space-between;align-items:center"><h2>Cardio · ${day === dayKey(new Date()) ? "today" : fmtDay(day)}</h2><button class="x iconbtn" data-act="closesheet" aria-label="Close">×</button></div></div>
    <div class="sb" style="display:grid;gap:14px;padding-top:12px">
      ${(b.cardio || []).length ? `<div class="list">${b.cardio.map(c => `<div class="row"><div class="l"><b>${esc(CARDIO_TYPES[c.sport] || c.sport)}</b> <span class="small muted">${c.mins} min · ${CARDIO_EFFORT[c.effort]?.label || ""}</span></div><button class="linkbtn" data-act="cl-del" data-id="${esc(c.id)}" style="color:var(--bad)">Remove</button></div>`).join("")}</div>` : ""}
      <div class="label">What</div>
      <div class="suggest">${types.map(t => `<button class="chipbtn ${d.sport === t ? "primary" : ""}" data-act="cl-sport" data-v="${t}">${CARDIO_TYPES[t] || t}</button>`).join("")}</div>
      <div class="eqmax"><span>Minutes</span><span class="stepper" style="display:inline-flex;width:auto"><button data-act="cl-mins" data-d="-5" aria-label="Fewer minutes">−</button><span class="num" style="min-width:40px;text-align:center">${d.mins}</span><button data-act="cl-mins" data-d="5" aria-label="More minutes">+</button></span></div>
      <div class="label">How hard</div>
      <div class="effort" style="justify-self:start">${Object.entries(CARDIO_EFFORT).map(([k, e]) => `<button data-act="cl-effort" data-v="${k}" aria-pressed="${d.effort === k}">${e.label}</button>`).join("")}</div>
      <p class="small muted" style="margin:0">Easy: you could hold a conversation. Hard: intervals or racing.</p>
      <button class="btn primary" data-act="cl-save">Save cardio</button>
    </div></div></div>`;
}
function openWeight() {
  const day = S.day, b = bodyDoc(day), lw = latestWeight(day);
  $("#sheet").innerHTML = `<div class="sheet-bg" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Weigh-in">
    <div class="sh"><div style="display:flex;justify-content:space-between;align-items:center"><h2>Weigh-in · ${day === dayKey(new Date()) ? "today" : fmtDay(day)}</h2><button class="x iconbtn" data-act="closesheet" aria-label="Close">×</button></div></div>
    <div class="sb" style="display:grid;gap:12px;padding-top:12px">
      <label class="eqmax" for="wt-in"><span>Bodyweight</span><span class="stepper" style="display:inline-flex;width:auto"><input id="wt-in" inputmode="decimal" value="${b.weightLb ? toDisp(b.weightLb) : ""}" placeholder="${lw ? toDisp(lw.weightLb) : ""}" style="width:80px"><span class="u">${unit()}</span></span></label>
      <p class="small muted" style="margin:0">Weigh in the morning, after the bathroom, before eating. A few times a week is enough: the coach follows the trend, not single days.</p>
      <div class="actions" style="margin-top:0"><button class="btn primary" data-act="wt-save">Save</button>${b.weightLb ? `<button class="btn ghost" data-act="wt-del">Remove</button>` : ""}</div>
    </div></div></div>`;
  setTimeout(() => $("#wt-in")?.focus(), 50);
}

/* ============================== Starter routines ============================== */
// Each slot lists exercises best-first; the first one your equipment allows is used.
const SLOTS = {
  squat: ["squat", "front_squat", "goblet", "split_squat"],
  single: ["split_squat", "lunge"],
  hinge: ["rdl", "deadlift", "hip_thrust", "sl_rdl", "glute_bridge"],
  hpush: ["bench", "db_bench", "floor_press", "pushup"],
  vpush: ["ohp", "db_ohp", "pike_pushup"],
  incline: ["incline_db", "pushup"],
  hpull: ["db_row", "bb_row", "inv_row", "rev_fly"],
  vpull: ["pullup", "chinup", "pulldown"],
  rear: ["face_pull", "rev_fly"],
  biceps: ["db_curl", "bb_curl", "hammer"],
  triceps: ["tri_oh", "skull", "pushdown", "dip"],
  side: ["lateral"],
  calves: ["calf"],
  core: ["plank", "leg_raise", "ab_wheel", "crunch"],
};
const TEMPLATES = {
  full2: { n: "Full body A/B", days: 2, routines: [["Full body A", ["squat", "hpush", "hpull", "side", "core"]], ["Full body B", ["hinge", "vpush", "vpull", "biceps", "triceps"]]] },
  full3: { n: "Full body A/B/C", days: 3, routines: [["Full body A", ["squat", "hpush", "hpull", "core"]], ["Full body B", ["hinge", "vpush", "vpull", "biceps"]], ["Full body C", ["single", "incline", "hpull", "rear", "triceps"]]] },
  ul4: { n: "Upper / lower", days: 4, routines: [["Upper A", ["hpush", "hpull", "vpush", "vpull", "biceps"]], ["Lower A", ["squat", "hinge", "calves", "core"]], ["Upper B", ["vpush", "vpull", "incline", "hpull", "triceps"]], ["Lower B", ["hinge", "single", "calves", "core"]]] },
};
function slotPick(slot, used) { return SLOTS[slot].find(id => canDo(id) && !used.has(id)); }
function buildRoutines(tplKey) {
  const out = {};
  TEMPLATES[tplKey].routines.forEach(([name, slots], i) => {
    const used = new Set(), items = [];
    for (const s of slots) {
      const id = slotPick(s, used); if (!id) continue;
      used.add(id);
      const k = exById(id).kind, main = ["squat", "hinge", "hpush", "vpush", "hpull", "vpull", "single"].includes(s);
      items.push({ ex: id, sets: 3, r: k === "time" ? 30 : main ? 6 : 10, rHi: k === "time" ? 45 : main ? 10 : 15, w: 0 });
    }
    if (items.length) out[`${tplKey}-${i + 1}`] = { name, items };
  });
  return out;
}

/* ============================== First-run setup ============================== */
const EQUIP_PRESETS = {
  none: { n: "Nothing yet", have: [] },
  home: { n: "Home basics", have: ["dumbbells", "bench", "pullupBar", "bands"] },
  gym: { n: "A full gym", have: Object.keys(EQUIP) },
};
function needsSetup() { return S.mode === "live" && !S.settings.setup && !Object.keys(S.sessions).length && !Object.keys(S.routines).length; }
function obDraft() {
  return S.ob || (S.ob = { unit: S.settings.unit || "lb", bw: "", goal: "maintain", have: [], lifts: 3, tpl: "full3", cardio: ["Run"], cardioN: 2, cardioMin: 60 });
}
function renderSetup() {
  const d = obDraft(), u = d.unit;
  const tpls = Object.entries(TEMPLATES);
  const q = (n, title, hint, body) => `<section class="block" style="margin-block:14px 22px"><div class="label">${n}</div><h2>${title}</h2>${hint ? `<p class="small muted" style="margin:0">${hint}</p>` : ""}${body}</section>`;
  const chip = (act, v, on, label) => `<button type="button" class="chipbtn ${on ? "primary" : ""}" data-act="${act}" data-v="${v}" aria-pressed="${on}">${label}</button>`;
  const preview = d.tpl !== "own" ? (() => {
    const saved = S.settings; S.settings = { ...S.settings, equip: { have: d.have, max: {} } };
    const rs = buildRoutines(d.tpl); S.settings = saved;
    return `<div class="list">${Object.values(rs).map(r => `<div class="row"><div class="l"><b>${esc(r.name)}</b><div class="small muted">${r.items.map(it => esc(exById(it.ex).name)).join(" · ")}</div></div></div>`).join("")}</div>`;
  })() : `<p class="small muted" style="margin:0">Log a session on the Today tab, then save it as a routine in Library.</p>`;
  return `
    <p style="margin:4px 0 0;max-width:52ch">A lifting log with a coach that watches your weekly volume, recovery and joints, and picks what to do each day. A few questions to set it up. You can change all of it later in Library.</p>
    ${q("1 of 6", "Units", "", `<div class="suggest">${chip("ob-unit", "lb", u === "lb", "Pounds (lb)")}${chip("ob-unit", "kg", u === "kg", "Kilograms (kg)")}</div>`)}
    ${q("2 of 6", "Bodyweight", "Used for bodyweight exercises and calorie targets. Log weigh-ins later from the Today tab.",
      `<label class="eqmax" for="ob-bw"><span>Today</span><span class="stepper" style="display:inline-flex;width:auto"><input id="ob-bw" inputmode="decimal" value="${esc(d.bw)}" placeholder="${u === "kg" ? "70" : "155"}" style="width:80px"><span class="u">${u}</span></span></label>`)}
    ${q("3 of 6", "Goal", "The coach steers your eating toward this weight trend. No food logging.",
      `<div class="suggest">${chip("ob-goal", "cut", d.goal === "cut", "Lose fat")}${chip("ob-goal", "maintain", d.goal === "maintain", "Get stronger, same weight")}${chip("ob-goal", "bulk", d.goal === "bulk", "Build muscle (lean bulk)")}</div>`)}
    ${q("4 of 6", "Equipment", "What you can train with. Exercises that need gear you don't have are swapped out.",
      `<div class="suggest">${Object.entries(EQUIP_PRESETS).map(([k, p]) => `<button type="button" class="chipbtn" data-act="ob-preset" data-v="${k}">${p.n}</button>`).join("")}</div>
       <div class="mgrid">${Object.entries(EQUIP).map(([k, n]) => `<button type="button" data-act="ob-eq" data-v="${k}" data-w="${d.have.includes(k) ? 1 : 0}" aria-pressed="${d.have.includes(k)}">${n}</button>`).join("")}</div>`)}
    ${q("5 of 6", "Lifting", "How many days a week you'll lift, and a starter plan. Starter weights are blank: pick something you can do for the low end of the reps with good form.",
      `<div class="suggest">${[2, 3, 4].map(n => chip("ob-lifts", n, d.lifts === n, `${n} days`)).join("")}</div>
       <div class="suggest">${tpls.map(([k, t]) => chip("ob-tpl", k, d.tpl === k, t.n)).join("")}${chip("ob-tpl", "own", d.tpl === "own", "I'll build my own")}</div>
       ${preview}`)}
    ${q("6 of 6", "Cardio", "What you do, and how much a week. Log it from the Today tab; it counts toward fatigue and joint load.",
      `<div class="suggest">${Object.entries(CARDIO_TYPES).filter(([k]) => k !== "Walk").map(([k, n]) => chip("ob-cardio", k, d.cardio.includes(k), n)).join("")}</div>
       <div class="list">
         <div class="row"><div class="l"><b>Sessions a week</b></div><span class="stepper" style="display:inline-flex;width:auto"><button data-act="ob-cn" data-d="-1" aria-label="Fewer">−</button><span class="num" style="min-width:24px;text-align:center">${d.cardioN}</span><button data-act="ob-cn" data-d="1" aria-label="More">+</button></span></div>
         <div class="row"><div class="l"><b>Minutes a week</b></div><span class="stepper" style="display:inline-flex;width:auto"><button data-act="ob-cm" data-d="-10" aria-label="Fewer">−</button><span class="num" style="min-width:36px;text-align:center">${d.cardioMin}</span><button data-act="ob-cm" data-d="10" aria-label="More">+</button></span></div>
       </div>`)}
    <div class="actions"><button class="btn primary" data-act="ob-done">Start training</button>${window.Sync?.state.configured ? `<button class="btn ghost" data-act="ac-open">I have an account</button>` : ""}<button class="btn ghost" data-act="import">Restore a backup instead</button></div>
    <p class="small muted">Everything stays on this device unless you sign in to sync. Not medical advice: stop if something hurts, and check with a doctor if you have an injury or condition.</p>`;
}
async function finishSetup() {
  const d = obDraft(), today = dayKey(new Date());
  const bwRaw = parseFloat(d.bw), bwLbV = isFinite(bwRaw) && bwRaw > 0 ? +(d.unit === "kg" ? bwRaw * LB_PER_KG : bwRaw).toFixed(1) : null;
  if (!bwLbV) { toast("Add your bodyweight first"); $("#ob-bw")?.focus(); return; }
  S.settings = { ...S.settings, unit: d.unit, setup: { done: today, tpl: d.tpl },
    equip: { have: d.have, max: {} }, cardioTypes: d.cardio,
    week: { lifts: d.lifts, cardio: d.cardio.length ? d.cardioN : 0, cardioMin: d.cardio.length ? d.cardioMin : 0 },
    nutrition: { goal: d.goal, perLb: 15.5, changes: [] } };
  const routines = d.tpl === "own" ? {} : buildRoutines(d.tpl);
  for (const [id, r] of Object.entries(routines)) { S.routines[id] = { ...r, id }; await saveDoc("routines/" + id, r); }
  await saveBody(today, { ...bodyDoc(today), weightLb: bwLbV });
  await saveDoc("settings/main", S.settings);
  S.ob = null; S.tab = "today"; render(); window.scrollTo(0, 0);
}

document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act, v = b.dataset.v;
  if (act.startsWith("ob-")) {
    const d = obDraft(), bwEl = $("#ob-bw"); if (bwEl) d.bw = bwEl.value;
    switch (act) {
      case "ob-unit": if (d.unit !== v && parseFloat(d.bw)) d.bw = String(Math.round(v === "kg" ? d.bw / LB_PER_KG : d.bw * LB_PER_KG)); d.unit = v; break;
      case "ob-goal": d.goal = v; break;
      case "ob-preset": d.have = [...EQUIP_PRESETS[v].have]; break;
      case "ob-eq": d.have = d.have.includes(v) ? d.have.filter(x => x !== v) : [...d.have, v]; break;
      case "ob-lifts": d.lifts = +v; d.tpl = { 2: "full2", 3: "full3", 4: "ul4" }[v]; break;
      case "ob-tpl": d.tpl = v; break;
      case "ob-cardio": d.cardio = d.cardio.includes(v) ? d.cardio.filter(x => x !== v) : [...d.cardio, v]; break;
      case "ob-cn": d.cardioN = Math.min(6, Math.max(0, d.cardioN + +b.dataset.d)); break;
      case "ob-cm": d.cardioMin = Math.min(300, Math.max(0, d.cardioMin + +b.dataset.d)); break;
      case "ob-done": return finishSetup();
    }
    const y = window.scrollY; render(); window.scrollTo(0, y); return;
  }
  const d = S.clDraft;
  switch (act) {
    case "cl-open": S.clDraft = null; openCardio(); break;
    case "cl-sport": d.sport = v; openCardio(); break;
    case "cl-mins": d.mins = Math.min(300, Math.max(5, d.mins + +b.dataset.d)); openCardio(); break;
    case "cl-effort": d.effort = v; openCardio(); break;
    case "cl-save": { const day = S.day, bd = bodyDoc(day);
      await saveBody(day, { ...bd, cardio: [...(bd.cardio || []), { id: uid(), sport: d.sport, mins: d.mins, effort: d.effort }] });
      closeSheet(); toast(`Logged ${d.mins} min ${(CARDIO_TYPES[d.sport] || d.sport).toLowerCase()}`); break; }
    case "cl-del": { const day = S.day, bd = bodyDoc(day); await saveBody(day, { ...bd, cardio: bd.cardio.filter(c => c.id !== b.dataset.id) }); openCardio(); break; }
    case "cardiotype": { const cur = cardioTypes(), next = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v];
      if (!next.length) { toast("Keep at least one, or set cardio sessions to 0"); return; }
      S.settings = { ...S.settings, cardioTypes: next }; render(); await saveDoc("settings/main", S.settings); break; }
    case "wt-open": openWeight(); break;
    case "wt-save": { const n = parseFloat($("#wt-in").value);
      if (!isFinite(n) || n <= 0) { toast("Enter a weight"); return; }
      await saveBody(S.day, { ...bodyDoc(S.day), weightLb: fromDisp(n) }); closeSheet(); toast("Weigh-in saved"); break; }
    case "wt-del": { const bd = { ...bodyDoc(S.day) }; delete bd.weightLb; await saveBody(S.day, bd); closeSheet(); break; }
  }
});

/* ============================== Account (sync.js does the work) ============================== */
const SYNC_TXT = { off: "", syncing: "Syncing…", saving: "Saving…", synced: "Synced", error: "Sync problem" };
function renderAccount() {
  const st = window.Sync?.state; if (!st?.configured) return "";
  const u = st.user;
  return `<section class="block">
    <h2>Account</h2>
    ${u ? `<div class="list"><div class="row"><div class="l"><b>${esc(u.name || u.email)}</b><div class="small muted">${esc(u.name ? u.email : "")}${st.msg ? ` · ${esc(st.msg)}` : ""}</div></div>
        <span class="pill ${st.status === "error" ? "bad" : st.status === "synced" ? "good" : "neutral"}">${SYNC_TXT[st.status] || ""}</span></div></div>
      <div class="actions" style="margin-top:0"><button class="btn" data-act="ac-out">Sign out</button><button class="btn ghost" data-act="ac-del" style="color:var(--bad)">${S.confirmDel === "account" ? "Tap again to delete everything" : "Delete account"}</button></div>
      <p class="small muted" style="margin:0">Signing out removes the log from this device. It stays in your account. Deleting the account erases it everywhere.</p>`
    : `<p class="small muted" style="margin:0">Sign in to keep your log in sync across your phone and computer, and safe if you lose a device. Without an account it stays on this device only.</p>
      <div class="actions" style="margin-top:0"><button class="btn primary" data-act="ac-open">Sign in or create account</button></div>`}
  </section>`;
}
function openAccount(mode = "in", msg = "") {
  const email = $("#ac-email")?.value || "";
  $("#sheet").innerHTML = `<div class="sheet-bg" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Account">
    <div class="sh"><div style="display:flex;justify-content:space-between;align-items:center"><h2>${mode === "up" ? "Create account" : mode === "reset" ? "Reset password" : "Sign in"}</h2><button class="x iconbtn" data-act="closesheet" aria-label="Close">×</button></div></div>
    <form class="sb" id="ac-form" data-mode="${mode}" style="display:grid;gap:10px;padding-top:12px">
      ${mode !== "reset" ? `<button type="button" class="btn" data-act="ac-google">Continue with Google</button><div class="small muted" style="text-align:center">or with email</div>` : ""}
      <input class="search" id="ac-email" type="email" autocomplete="email" placeholder="Email" value="${esc(email)}" required>
      ${mode !== "reset" ? `<input class="search" id="ac-pw" type="password" autocomplete="${mode === "up" ? "new-password" : "current-password"}" placeholder="Password${mode === "up" ? " (6+ characters)" : ""}" required>` : ""}
      ${msg ? `<div class="hint ${/sent/i.test(msg) ? "info" : "bad"}">${esc(msg)}</div>` : ""}
      <button class="btn primary" type="submit">${mode === "up" ? "Create account" : mode === "reset" ? "Send reset email" : "Sign in"}</button>
      <div class="small" style="display:flex;gap:16px;flex-wrap:wrap">
        ${mode !== "in" ? `<button type="button" class="linkbtn" data-act="ac-mode" data-v="in">I have an account</button>` : `<button type="button" class="linkbtn" data-act="ac-mode" data-v="up">Create an account</button>`}
        ${mode !== "reset" ? `<button type="button" class="linkbtn" data-act="ac-mode" data-v="reset">Forgot password</button>` : ""}
      </div>
      <p class="small muted" style="margin:0">Your current log on this device is added to the account.</p>
    </form></div></div>`;
}
document.addEventListener("submit", async ev => {
  if (ev.target.id !== "ac-form") return;
  ev.preventDefault();
  const mode = ev.target.dataset.mode, email = $("#ac-email").value.trim(), pw = $("#ac-pw")?.value;
  try {
    if (mode === "reset") { await Sync.reset(email); openAccount("in", "Reset email sent. Check your inbox."); return; }
    await (mode === "up" ? Sync.signUp(email, pw) : Sync.signIn(email, pw));
    closeSheet(); toast("Signed in. Syncing your log.");
  } catch (msg) { openAccount(mode, String(msg)); }
});
document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-act]"); if (!b || !b.dataset.act.startsWith("ac-")) return;
  switch (b.dataset.act) {
    case "ac-open": openAccount(); break;
    case "ac-mode": openAccount(b.dataset.v); break;
    case "ac-google": try { await Sync.google(); closeSheet(); toast("Signed in. Syncing your log."); } catch (msg) { openAccount("in", String(msg)); } break;
    case "ac-out": {
      const left = (await LocalStore.open()).pending().length;
      if (left && !confirm("Some changes haven't reached your account yet (no connection?). Sign out anyway and lose them?")) return;
      await Sync.signOut(); location.reload(); break;
    }
    case "ac-del":
      if (S.confirmDel !== "account") { S.confirmDel = "account"; render(); return; }
      try { await Sync.deleteAccount(); location.reload(); } catch (msg) { S.confirmDel = null; toast(String(msg)); render(); }
      break;
  }
});

/* ============================== Script connectors ============================== */
// A script on your own computer (e.g. iron-ledger-sync/garmin_pull.py) writes connectors/<name> into your account:
// { source, updated, days: { "YYYY-MM-DD": { readiness, sleepScore, hrv, weightLb, ... } } }. Same shape as the Drive file.
S.connectors = {};
function applyConnectors() {
  const g = S.connectors.garmin;
  if (g?.days) {
    S.extHealth = g.days; rebuildDerived();
    S.conn.garmin = { st: "ok", at: Date.parse(g.updated) || Date.now(), n: Object.keys(g.days).length, msg: `Updated ${new Date(Date.parse(g.updated)).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })} by your sync script.` };
  } else {
    S.extHealth = {}; rebuildDerived();
    S.conn.garmin = { st: "soon", msg: "Needs a sync script on your computer, and an account (see Connect a script)." };
  }
}
function renderConnectorKey() {
  if (!window.Sync?.state.user) return "";
  return `<details class="fold" style="margin-top:4px"><summary>Connect a script (advanced)</summary>
    <div style="display:grid;gap:8px;margin-top:8px">
      <p class="small muted" style="margin:0">For a sync script on your own computer, like the Garmin one. The key lets the script write to your log as you, so keep it on your computer and never share it. Signing out doesn't cancel it.</p>
      <div class="actions" style="margin-top:0"><button class="btn" data-act="ac-key">Copy connector key</button></div>
      <p class="small muted" style="margin:0">Then in Terminal on your Mac: <code class="mono">pbpaste &gt; ~/.iron-ledger-key &amp;&amp; chmod 600 ~/.iron-ledger-key</code></p>
    </div></details>`;
}
document.addEventListener("click", async ev => {
  const b = ev.target.closest("[data-act=ac-key]"); if (!b) return;
  try { await navigator.clipboard.writeText(JSON.stringify(await Sync.connectorKey())); toast("Key copied. Paste it into the file, then clear your clipboard."); }
  catch { toast("Couldn't copy. Try again."); }
});
