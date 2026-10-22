// Offline shell: precache the app so it opens without a connection.
// Bump VERSION when SHELL's file list changes.
const VERSION = "il-v3";
const SHELL = ["./", "index.html", "src/styles.css", "src/store.js", "src/app.js", "src/setup.js", "src/sync.js", "src/firebase-config.js", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png"];

self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const font = url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com";
  if (url.origin !== location.origin && !font) return;
  // App files: network first so updates show on the next open; cache when offline. Fonts never change: cache first.
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = () => c.match(req, { ignoreSearch: !font });
    if (font) { const h = await hit(); if (h) return h; }
    try { const r = await fetch(req); if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }
    catch (err) { const h = await hit(); if (h) return h; throw err; }
  }));
});
