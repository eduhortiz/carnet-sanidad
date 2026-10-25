// Cachea solo la "carcasa" de la app. Las llamadas a Google (sincronización) siempre van a la red.
const CACHE = "carnet-sanidad-v1";
const SHELL = [
  "./", "index.html", "manifest.webmanifest",
  "vendor/react.production.min.js", "vendor/react-dom.production.min.js", "vendor/dc-runtime.js",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png",
  "fonts/manrope-latin.woff2", "fonts/manrope-latin-ext.woff2", "fonts/manrope-cyrillic.woff2",
  "fonts/manrope-cyrillic-ext.woff2", "fonts/manrope-greek.woff2", "fonts/manrope-vietnamese.woff2"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // red primero (para recibir actualizaciones), caché si no hay conexión
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("index.html")))
  );
});
