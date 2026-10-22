"use strict";
/* On-device store with the same shape as the artifact db (Firestore-like), so app.js barely changes.
   Every doc lives in one IndexedDB object store keyed by its path ("sessions/2026-10-22", "settings/main").
   The whole set is read into memory at open; writes update memory first, then IndexedDB.
   A sync backend can later replace this file without touching app.js. */
const LocalStore = (() => {
  const NAME = "iron-ledger", STORE = "docs";
  const mem = new Map();        // path -> data
  const subs = new Set();       // { kind: "col" | "doc", key, cb, seen }
  let idb = null;

  const req = r => new Promise((ok, no) => { r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const err = e => Object.assign(new Error(e?.message || "storage error"), { code: e?.name === "QuotaExceededError" ? "quota_exceeded" : "storage" });
  const colOf = p => p.split("/")[0];
  const idOf = p => p.slice(p.indexOf("/") + 1);
  const snapDoc = (p) => ({ id: idOf(p), exists: mem.has(p), data: () => structuredClone(mem.get(p)) });

  async function open() {
    if (idb) return api;
    const r = indexedDB.open(NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    idb = await req(r);
    const tx = idb.transaction(STORE);
    const [keys, vals] = await Promise.all([req(tx.objectStore(STORE).getAllKeys()), req(tx.objectStore(STORE).getAll())]);
    keys.forEach((k, i) => mem.set(k, vals[i]));
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

  async function write(path, data) {
    if (data === undefined) mem.delete(path); else mem.set(path, structuredClone(data));
    try {
      const tx = idb.transaction(STORE, "readwrite"), st = tx.objectStore(STORE);
      data === undefined ? st.delete(path) : st.put(mem.get(path), path);
      await new Promise((ok, no) => { tx.oncomplete = ok; tx.onerror = () => no(tx.error); tx.onabort = () => no(tx.error); });
    } catch (e) { throw err(e); }
    notify(path);
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
    // Replace everything with a backup
    async restore(all) {
      const old = [...mem.keys()];
      const tx = idb.transaction(STORE, "readwrite"), st = tx.objectStore(STORE);
      st.clear(); mem.clear();
      for (const [k, v] of Object.entries(all)) { mem.set(k, v); st.put(v, k); }
      await new Promise((ok, no) => { tx.oncomplete = ok; tx.onerror = () => no(err(tx.error)); });
      for (const p of new Set([...old, ...mem.keys()])) notify(p);
    },
  };
  return { open };
})();
