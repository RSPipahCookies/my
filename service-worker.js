// Basic service worker for caching shell assets. Keep it simple and robust.
const CACHE_NAME = 'pipah-reseller-cache-v3'; // PENTING: Versi Dinaikkan ke v3 untuk memaksa Service Worker cache semula
const ASSETS = [
  '/', // The root URL is crucial for installed PWA launches
  '/index.html',
  '/reseller-manifest.json',
  
  // --- Essential HTML Pages for Offline Access ---
  '/reseller-checkout.html',
  '/gambar2reseller.html',
  
  // --- KRITIKAL: Tambahkan fail konfigurasi produk yang hilang ---
  '/pipah-product-config.js',

  // --- Images and other Assets from the original list ---
  '/images/rsheader.png',
  '/images/rs512.png',
  '/images/rs194.png',
  // common product images (if present)
  '/images/ss1.jpg','/images/ss2.jpg','/images/ss3.jpg',
  '/images/ch1.jpg','/images/ch2.jpg','/images/ch3.jpg',
  '/images/br1.jpg','/images/br2.jpg','/images/br3.jpg',
  '/images/bc1.jpg','/images/bc2.jpg','/images/bc3.jpg',
  '/images/rv1.jpg','/images/rv2.jpg','/images/rv3.jpg',
  '/images/dc1.jpg','/images/dc2.jpg','/images/dc3.jpg'
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
  const url = new URL(req.url);

  // *** NEW STRATEGY: Cache-First for the installed root page ***
  // If the request is for the main index page (which is the PWA start_url)
  // or a navigation request, try the cache first.
  if (req.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      caches.match('/index.html') // Try to match the index file immediately
        .then(cachedResponse => {
          // If we have it, serve it instantly for reliability
          if (cachedResponse) {
            console.log('[Service Worker] Serving Index (PWA Launch) from cache.');
            return cachedResponse;
          }
          
          // If not in cache, try network (shouldn't happen if install worked)
          return fetch(req);
        })
        .catch(() => {
          // Fallback if both network and cache failed (e.g., network error and cache broken)
          console.error('[Service Worker] Critical failure: Cannot load PWA shell.');
          return caches.match('/'); // Try the root entry as final fallback
        })
    );
    return;
  }
  
  // Strategy: Cache-first for all other assets (images, CSS, JS) - THIS REMAINS
  event.respondWith(
    caches.match(req).then(cached => {
      // ... (your existing cache-first logic for assets) ...
    })
  );
});
