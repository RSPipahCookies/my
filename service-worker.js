const CACHE_NAME = 'reseller-portal-v1'; 
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './RSDashboard.html',
  './reseller-checkout.html',
  './admin.html',
  './reseller-manifest.json',
  './rs194.png',
  './rs512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
