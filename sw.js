// ARMONÍA — Service Worker
// Cache-first para los recursos del shell de la app, network-first para audio externo y otros fetches.

const CACHE = "armonia-v2.1-2026-04-18b";  // ← bump cuando cambia algo importante
const SHELL = [
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.svg",
  "./icon-512.svg",
  "https://cdn.tailwindcss.com",
  "https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.js"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(SHELL.map((u) => cache.add(u).catch(() => {})))
    )
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Solo GET
  if (e.request.method !== "GET") return;

  // Navegación (páginas): network-first con fallback al shell
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match("./index.html")
      )
    );
    return;
  }

  // Cache-first para el resto
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((resp) => {
          // Cachear respuestas OK del mismo origen o CDNs conocidos
          if (resp && resp.status === 200 && (url.origin === self.location.origin || /tailwindcss|jsdelivr/.test(url.host))) {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return resp;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
