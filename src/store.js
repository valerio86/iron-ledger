"use strict";
/* On-device store with the same shape as the artifact db (Firestore-like), so app.js barely changes.
   Every doc lives in IndexedDB keyed by its path ("sessions/2026-10-22", "settings/main"); the whole set is read into
   memory at open, and writes update memory first, then IndexedDB.
   Sync bookkeeping lives in a second store: per path { at: last change (ms), del: deleted, synced: cloud has it },
   plus "kv:" keys for sync state. This device stays the source of truth; sync.js copies changes to and from the cloud. */
const LocalStore = (() => {
  const NAME = "iron-ledger", DOCS = "docs", META = "meta";
  const mem = new Map();        // path -> data
  const meta = new Map();       // path -> { at, del, synced } and "kv:<key>" -> value
  const subs = new Set();       // { kind: "col" | "doc", key, cb, seen }
  const hooks = new Set();      // called with a path after each local change
  let idb = null;

  const req = r => new Promise((ok, no) => { r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const done = tx => new Promise((ok, no) => { tx.oncomplete = ok; tx.onerror = () => no(tx.error); tx.onabort = () => no(tx.error); });
  const err = e => Object.assign(new Error(e?.message || "storage error"), { code: e?.name === "QuotaExceededError" ? "quota_exceeded" : "storage" });
  const colOf = p => p.split("/")[0];
  const idOf = p => p.slice(p.indexOf("/") + 1);
  /* Field-level merge for docs that hold many unrelated settings: each top-level field carries when it last changed
     (data._f = { field: ms }), so two devices changing different settings both keep their change. Other docs: newest doc wins. */
  const MERGE = new Set(["settings/main"]);
  // Equal regardless of key order (a merge rebuilds objects; comparing by order would bounce the same doc between devices forever)
  const canon = v => Array.isArray(v) ? `[${v.map(canon).join(",")}]` : v && typeof v === "object"
    ? `{${Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",")}}` : JSON.stringify(v ?? null);
  const same = (a, b) => canon(a) === canon(b);
  const fields = (...ds) => { const s = new Set(); for (const d of ds) for (const k of Object.keys(d || {})) if (k !== "_f") s.add(k); return s; };
  // A local write: stamp the fields that changed (including removed ones) with `at`
  function stamp(prev, next, at) {
    const f = { ...(prev?._f || {}) };
    for (const k of fields(prev, next)) if (!same(prev?.[k], next[k])) f[k] = at;
    const out = { ...next }; delete out._f; return { ...out, _f: f };
  }
  // A restore: every field it sets or removes counts as changed now
  const stampAll = (prev, d, at) => { const out = { ...d }; delete out._f; return { ...out, _f: Object.fromEntries([...fields(prev, d)].map(k => [k, at])) }; };
  // Each field from whichever side changed it last; unstamped fields count as 0, and a tie goes to the newer doc
  function merge(a, aAt, b, bAt) {
    const out = {}, f = {};
    for (const k of fields(a, b)) {
      const ta = a._f?.[k] ?? 0, tb = b._f?.[k] ?? 0, w = ta > tb || (ta === tb && aAt > bAt) ? a : b;
      if (k in w) out[k] = w[k];
      if (Math.max(ta, tb)) f[k] = Math.max(ta, tb);
    }
    return { ...out, _f: f };
  }
  const snapDoc = (p) => ({ id: idOf(p), exists: mem.has(p), data: () => structuredClone(mem.get(p)) });

  let opening = null;
  const open = () => opening || (opening = doOpen());   // app.js and sync.js both open; share one connection
  async function doOpen() {
    const r = indexedDB.open(NAME, 2);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains(DOCS)) db.createObjectStore(DOCS);
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META);
    };
    idb = await req(r);
    const tx = idb.transaction([DOCS, META]);
    const [keys, vals, mkeys, mvals] = await Promise.all([req(tx.objectStore(DOCS).getAllKeys()), req(tx.objectStore(DOCS).getAll()),
      req(tx.objectStore(META).getAllKeys()), req(tx.objectStore(META).getAll())]);
    keys.forEach((k, i) => mem.set(k, vals[i]));
    mkeys.forEach((k, i) => meta.set(k, mvals[i]));
    // Docs from before sync existed have no bookkeeping yet: treat them as unsynced changes
    for (const k of keys) if (!meta.has(k)) meta.set(k, { at: Date.now(), del: false, synced: false });
    // Ask the browser not to evict the log (Safari otherwise may after weeks unused, unless installed to the home screen)
    try { await navigator.storage?.persist?.(); } catch {}
    return api;
  }

  function emit(sub) {
    if (sub.kind === "doc") return sub.cb(snapDoc(sub.key));
    const paths = [...mem.keys()].filter(p => colOf(p) === sub.key);
    const changes = [];
    for (const p of paths) changes.push({ type: sub.seen.has(p) ? "modified" : "added", doc: snapDoc(p) });
    for (const p of sub.seen) if (!mem.has(p)) changes.push({ type: "removed", doc: { id: idOf(p), exists: false, data: () => undefined } });
    sub.seen = new Set(paths);
    sub.cb({ docs: paths.map(snapDoc), docChanges: () => changes });
  }
  function notify(path) { for (const s of subs) if (s.kind === "doc" ? s.key === path : s.key === colOf(path)) emit(s); }

  // Write docs and their bookkeeping in one transaction. rows: [path, data | undefined, metaRow]
  async function commit(rows) {
    for (const [p, data, m] of rows) { data === undefined ? mem.delete(p) : mem.set(p, structuredClone(data)); meta.set(p, m); }
    try {
      const tx = idb.transaction([DOCS, META], "readwrite"), d = tx.objectStore(DOCS), mt = tx.objectStore(META);
      for (const [p, data, m] of rows) { data === undefined ? d.delete(p) : d.put(mem.get(p), p); mt.put(m, p); }
      await done(tx);
    } catch (e) { throw err(e); }
  }

  async function write(path, data) {
    if (MERGE.has(path) && data !== undefined) data = stamp(mem.get(path), data, Date.now());
    await commit([[path, data, { at: Date.now(), del: data === undefined, synced: false }]]);
    notify(path);
    hooks.forEach(h => h(path));
  }

  function listen(kind, key, cb) {
    const sub = { kind, key, cb, seen: new Set() };
    subs.add(sub); queueMicrotask(() => emit(sub));
    return () => subs.delete(sub);
  }

  const api = {
    collection: name => ({ onSnapshot: (cb) => listen("col", name, cb) }),
    doc: path => ({
      onSnapshot: (cb) => listen("doc", path, cb),
      set: data => write(path, data),
      delete: () => write(path, undefined),
    }),
    // Full backup: { "sessions/2026-10-22": {...}, ... }
    dump: () => Object.fromEntries([...mem].map(([k, v]) => [k, structuredClone(v)])),
    // Replace everything with a backup. Counts as a fresh change everywhere, so it also replaces the cloud copy.
    async restore(all) {
      const at = Date.now(), paths = new Set([...mem.keys(), ...Object.keys(all)]);
      // A restore replaces: merged docs get every field stamped now, so the backup's values win the next merge too
      await commit([...paths].map(p => [p, MERGE.has(p) && all[p] ? stampAll(mem.get(p), all[p], at) : all[p], { at, del: !(p in all), synced: false }]));
      for (const p of paths) notify(p);
      paths.forEach(p => hooks.forEach(h => h(p)));
    },

    /* ---- for sync.js ---- */
    onWrite: h => hooks.add(h),
    // Changes the cloud doesn't have yet
    pending: () => [...meta].filter(([k, m]) => !k.startsWith("kv:") && !m.synced).map(([p, m]) => ({ path: p, data: mem.get(p), ...m })),
    // The cloud acknowledged this version (ignored if the doc changed again meanwhile)
    async markSynced(path, at) {
      const m = meta.get(path); if (!m || m.at !== at) return;
      const n = { ...m, synced: true }; meta.set(path, n);
      const tx = idb.transaction(META, "readwrite"); tx.objectStore(META).put(n, path); await done(tx);
    },
    // A change from another device: applied only if newer than ours
    async applyRemote(list) {
      const mergeRows = [];
      list = list.filter(r => {
        const m = meta.get(r.path), mine = mem.get(r.path);
        if (!MERGE.has(r.path) || r.del || !mine || !m || m.at === r.at || same(mine, r.data)) return true;
        const out = merge(mine, m.at, r.data, r.at);
        // The cloud's copy already has everything: take it as synced. Otherwise ours is newer in places: keep the merge and send it up
        mergeRows.push(same(out, r.data) ? [r.path, r.data, { at: r.at, del: false, synced: true }] : [r.path, out, { at: Math.max(m.at, r.at) + 1, del: false, synced: false }]);
        return false;
      });
      const rows = [...mergeRows, ...list.filter(r => !(meta.get(r.path)?.at >= r.at)).map(r => [r.path, r.del ? undefined : r.data, { at: r.at, del: r.del, synced: true }])];
      // Same version as ours: just note that the cloud has it
      for (const r of list) { const m = meta.get(r.path); if (m && m.at === r.at && !m.synced) rows.push([r.path, mem.get(r.path), { ...m, synced: true }]); }
      if (!rows.length) return 0;
      await commit(rows);
      rows.forEach(([p]) => notify(p));
      mergeRows.filter(([, , m]) => !m.synced).forEach(([p]) => hooks.forEach(h => h(p)));   // push merges that the cloud lacks
      return rows.length;
    },
    // First sign-in on this device, into an account that already has data: the account's copy replaces this device's
    // for every doc both have (rows as for commit), so a fresh setup here doesn't overwrite the account
    async adopt(rows) {
      if (!rows.length) return;
      await commit(rows);
      rows.forEach(([p]) => notify(p));
    },
    // The cloud copy was lost (account deletion stopped halfway): treat everything here as new so it goes up again
    async unsyncAll() {
      const at = Date.now();
      await commit([...mem.keys()].map(p => [p, mem.get(p), { at, del: false, synced: false }]));
    },
    peek: p => structuredClone(mem.get(p)),
    kv: k => meta.get("kv:" + k),
    async setKv(k, v) { meta.set("kv:" + k, v); const tx = idb.transaction(META, "readwrite"); tx.objectStore(META).put(v, "kv:" + k); await done(tx); },
    // Signing out: remove everything from this device
    async wipe() {
      const paths = [...mem.keys()];
      mem.clear(); meta.clear();
      const tx = idb.transaction([DOCS, META], "readwrite"); tx.objectStore(DOCS).clear(); tx.objectStore(META).clear(); await done(tx);
      paths.forEach(notify);
    },
  };
  return { open };
})();
