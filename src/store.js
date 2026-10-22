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
      await commit([...paths].map(p => [p, all[p], { at, del: !(p in all), synced: false }]));
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
      const rows = list.filter(r => !(meta.get(r.path)?.at >= r.at)).map(r => [r.path, r.del ? undefined : r.data, { at: r.at, del: r.del, synced: true }]);
      // Same version as ours: just note that the cloud has it
      for (const r of list) { const m = meta.get(r.path); if (m && m.at === r.at && !m.synced) rows.push([r.path, mem.get(r.path), { ...m, synced: true }]); }
      if (!rows.length) return 0;
      await commit(rows);
      rows.forEach(([p]) => notify(p));
      return rows.length;
    },
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
