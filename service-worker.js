// Basic service worker for caching shell assets. Keep it simple and robust.
const CACHE_NAME = 'pipah-reseller-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/reseller-manifest.json',
  '/images/rsheader.png',
  '/images/rs512.png', 
  '/images/rs194.png', // Tambah ikon PWA ke aset cache
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
  self.skipWaiting();
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event: Cleaning old caches.');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if(k !== CACHE_NAME) {
        console.log(`[Service Worker] Deleting old cache: ${k}`);
        return caches.delete(k);
      }
    })))
  );
  self.clients.claim();
});

// 3. Fetch Event: Handle network requests (Core PWA requirement)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  console.log(`[Service Worker] Fetching: ${req.url}`);
  
  // Strategy: Network-first for navigations, fallback to cache
  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req).catch(()=> {
        console.log('[Service Worker] Navigation failed, serving offline page.');
        // Fallback to the main HTML page for offline navigation
        return caches.match('/index.html'); 
      })
    );
    return;
  }

  // Strategy: Cache-first for all other assets
  event.respondWith(
    caches.match(req).then(cached => {
      // If cached, serve immediately
      if (cached) {
        console.log('[Service Worker] Serving from cache:', req.url);
        return cached;
      }

      // If not cached, fetch from network
      return fetch(req).then(res => {
        // Only cache successful network responses (status 200)
        if (res.status === 200) {
          return caches.open(CACHE_NAME).then(cache => { 
            // Cache the response clone and return the original response
            cache.put(req, res.clone()); 
            console.log('[Service Worker] Fetched and cached:', req.url);
            return res; 
          });
        }
        return res; // Return non-200 responses without caching
      });
    }).catch(err => {
      console.error('[Service Worker] Fetch error for:', req.url, err);
      // Optional: Add a general offline fallback image/message here
    })
  );
});
