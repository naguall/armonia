// SELF-DESTRUCT SW — borra todo y se desregistra
// La app lo detectará en su próximo chequeo y se limpiará sola

self.addEventListener("install", () => { self.skipWaiting(); });

self.addEventListener("activate", async (e) => {
  e.waitUntil((async () => {
    // Borrar TODOS los caches
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    // Tomar control de todos los clientes
    await self.clients.claim();
    // Recargar todos los clientes
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach(c => c.navigate(c.url));
  })());
});

// NO interceptar fetch — todo va directo al servidor
self.addEventListener("fetch", () => {});
