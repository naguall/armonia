// ARMONÍA — Service Worker v2.5
const CACHE = "armonia-v2.5";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then((resp) => { if (resp && resp.status === 200) { const copy = resp.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return resp; }).catch(() => caches.match(e.request)));
});
self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });