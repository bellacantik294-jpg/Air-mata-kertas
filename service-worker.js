
const CACHE_NAME = "air-mata-kertas-v1";
const urlsToCache = [
  "/Air-mata-kertas/",
  "/Air-mata-kertas/index.html",
  "/Air-mata-kertas/style.css",
  "/Air-mata-kertas/pro-script.js",
  "/Air-mata-kertas/daftar-cerpen.html",
  "/Air-mata-kertas/read.html",
  "/Air-mata-kertas/kategori.html",
  "/Air-mata-kertas/tentang.html",
  "/Air-mata-kertas/admin.html",
  "/Air-mata-kertas/assets/favicon.svg",
  "/Air-mata-kertas/data/cerpen-data.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
