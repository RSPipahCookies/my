// Basic service worker for caching shell assets. Keep it simple and robust.
const CACHE_NAME = 'pipah-reseller-cache-v7'; // PENTING: Versi Dinaikkan ke v4 untuk memaksa Service Worker cache semula
const ASSETS = [
  './', // The root URL is crucial for installed PWA launches
  './index.html',
  './reseller-manifest.json',
  
  // --- Essential HTML Pages for Offline Access ---
  './reseller-checkout.html',
  './gambar2reseller.html',
  
  // --- KRITIKAL: Tambahkan fail konfigurasi produk yang hilang ---
  './pipah-product-config.js',

  // --- Images and other Assets from the original list ---
  './images/rsheader.png',
  './images/rs512.png',
  './images/rs194.png',
  // common product images (if present)
  './images/ss1.jpg','./images/ss2.jpg','./images/ss3.jpg',
  './images/ch1.jpg','./images/ch2.jpg','./images/ch3.jpg',
  './images/br1.jpg','./images/br2.jpg','./images/br3.jpg',
  './images/bc1.jpg','./images/bc2.jpg','./images/bc3.jpg',
  './images/rv1.jpg','./images/rv2.jpg','./images/rv3.jpg',
  './images/dc1.jpg','./images/dc2.jpg','./images/dc3.jpg'
];

// 1. Install Event: Cache all the defined assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event: Caching static assets.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch((err) => console.error('[Service Worker] Caching failed:', err))
  );
  // Forces the waiting service worker to become the active service worker
  self.skipWaiting();
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event: Cleaning old caches.');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      // Delete old caches that do not match the current CACHE_NAME
      if(k !== CACHE_NAME) {
        console.log(`[Service Worker] Deleting old cache: ${k}`);
        return caches.delete(k);
      }
    })))
  );
  // Takes control of the pages as soon as possible
  self.clients.claim();
});

// 3. Fetch Event: Handle network requests (Core PWA requirement)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
// Install: precache
self.addEventListener('install', event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(err=>console.warn('SW precache failed', err)))
  );
});

// Activate: cleanup old caches
self.addEventListener('activate', event=>{
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })
    )).then(()=> self.clients.claim())
  );
});

// Fetch: cache-first, then network and update cache
self.addEventListener('fetch', event=>{
  const req = event.request;
  const url = new URL(req.url);

  // For navigation (HTML), prefer network fallback to cache
  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req).then(r => { 
        // update cache
        caches.open(CACHE_NAME).then(cache => cache.put(req, r.clone()));
        return r;
      }).catch(()=> caches.match('./index.html'))
    );
    return;
  }

  // For other requests: cache-first, then network
  event.respondWith(
    caches.match(req).then(cached => {
      if(cached) {
        // Update cache in background
        fetch(req).then(resp => {
          if(resp && resp.ok && req.method === 'GET' && req.url.startsWith(self.location.origin)){
            caches.open(CACHE_NAME).then(cache => cache.put(req, resp.clone()));
          }
        }).catch(()=>{});
        return cached;
      }
      return fetch(req).then(resp => {
        if(resp && resp.ok && req.method === 'GET' && req.url.startsWith(self.location.origin)){
          caches.open(CACHE_NAME).then(cache => cache.put(req, resp.clone()));
        }
        return resp;
      }).catch(()=> {
        // final fallback: if image requested return a simple 1x1 transparent PNG (optional)
        if(req.destination === 'image') return new Response('', {status: 204});
        return new Response('', {status: 504});
      });
    })
  );
});

// Listen for skip waiting (update flow)
self.addEventListener('message', (event)=>{
  if(event.data === 'skipWaiting') self.skipWaiting();
});
