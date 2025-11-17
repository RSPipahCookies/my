// Basic service worker for caching shell assets. Keep it simple and robust.
const CACHE_NAME = 'pipah-reseller-cache-v3'; // <--- VERSI DINAikkan untuk mematikan cache lama
const ASSETS = [
  '/', // The root URL is crucial for installed PWA launches
  '/index.html',
  '/reseller-manifest.json',
  
  // --- Essential HTML Pages for Offline Access ---
  // Ensure the filenames here match your live files:
  '/reseller-checkout.html', 
  '/gambar2reseller.html', 
  '/RSDashboard.html',
  '/pipah-product-config.js',
  // Memastikan pautan ke dashboard juga di-cache

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
  console.log('[Service Worker] Install Event: Caching assets...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching all assets.');
      // Add all ASSETS to the cache
      return cache.addAll(ASSETS);
    }).catch(err => {
        console.error('[Service Worker] Failed to pre-cache assets:', err);
    })
  );
  // Forces the waiting service worker to become the active service worker
  self.skipWaiting(); 
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event: Cleaning old caches...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Serve assets from cache or network
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Strategy: Network-first for navigations, fallback to cache
  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req).catch(async ()=> { 
        console.log('[Service Worker] Navigation failed, serving offline page.');
        
        // CUBALAH cari /index.html dalam cache.
        // Ini adalah langkah kritikal untuk memperbaiki 404 pada PWA yang dipasang.
        let response = await caches.match('/index.html');
        if (response) return response;
        
        // Fallback to the root key (which should also contain index.html)
        response = await caches.match('/');
        if (response) return response;
        
        // Final fallback if neither is found
        throw new Error('Offline shell not available.');
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
      }).catch(err => {
        console.log('[Service Worker] Fetch failed and no cache available.');
      });
    })
  );
});
