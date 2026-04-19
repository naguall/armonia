// ARMONÍA — Service Worker
// Network-first for same-origin, cache-first for CDN assets only.

const CACHE = "armonia-v2.4-2026-04-18";  // ← bump cuando cambia algo importante

self.addEventListener("install", (e) => {
  self.skipWaiting(); // activate immediately
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim()) // take over all clients immediately
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  // CDN assets (Tailwind, Tone.js): cache-first (they don't change)
  if (/tailwindcss|jsdelivr|cdnjs/.test(url.host)) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((resp) => {
          if (resp && resp.status === 200) {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return resp;
        });
      })
    );
    return;
  }

  // Everything else (our HTML, JS, SVG, manifest): NETWORK-FIRST
  // This ensures updates are always picked up immediately
  e.respondWith(
    fetch(e.request).then((resp) => {
      if (resp && resp.status === 200) {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return resp;
    }).catch(() => caches.match(e.request))
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
