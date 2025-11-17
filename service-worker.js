// Basic service worker for caching shell assets. Keep it simple and robust.
const CACHE_NAME = 'pipah-reseller-cache-v4'; // PENTING: Versi Dinaikkan ke v4 untuk memaksa Service Worker cache semula
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
  
  // *** PWA FIX: Strategy: Cache-first for navigations ***
  // This ensures the installed PWA shell loads instantly, even offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(req) // Try to match the URL directly
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log(`[Service Worker] Serving ${req.url} from cache (Navigation).`);
            return cachedResponse;
          }
          
          // If not in cache, fetch from network (for online users)
          return fetch(req)
            .catch(() => {
                // If network fails (i.e., user is offline), serve the main shell
                console.log('[Service Worker] Network failed, serving index shell.');
                return caches.match('/index.html');
            });
        })
    );
    return;
  }

  // Strategy: Cache-first for all other assets (images, CSS, JS)
  event.respondWith(
    caches.match(req).then(cached => {
      // If cached, serve immediately
      if (cached) {
        return cached;
      }

      // If not cached, fetch from network and dynamically cache
      return fetch(req).then(res => {
        // Only cache successful network responses (status 200)
        if (res.status === 200) {
          // Clone the response because a response body can only be consumed once
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => { 
            cache.put(req, resClone);
          });
        }
        return res;
      });
    })
  );
});
