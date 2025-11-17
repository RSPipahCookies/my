// Basic service worker for caching shell assets. Keep it simple and robust.
const CACHE_NAME = 'pipah-reseller-cache-v5'; // <--- VERSI DINAiKKAN untuk memaksa pembersihan cache.
const ASSETS = [
  '/', // The root URL is crucial for installed PWA launches
  '/index.html',
  '/reseller-manifest.json',
  
  // --- Essential HTML & JS Pages for Offline Access ---
  '/pipah-product-config.js', // DITAMBAH: Fail konfigurasi penting.
  '/reseller-checkout.html', 
  '/gambar2reseller.html', 
  '/RSDashboard.html',

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
      return cache.addAll(ASSETS);
    }).catch(err => {
        console.error('[Service Worker] Failed to pre-cache assets:', err);
    })
  );
  // Forces the waiting service worker to become the active service worker immediately
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
  
  // Strategy: Cache-first with Network Fallback for navigations
  if(req.mode === 'navigate'){
    event.respondWith(
      caches.match(req).then(cachedResponse => {
        // 1. CUBALAH SERVE DARI CACHE (jika ia adalah laluan yang telah disimpan)
        if(cachedResponse) return cachedResponse;
        
        // 2. JIKA TIADA DALAM CACHE LALUAN SEMASA, CUBA FETCH DARI NETWORK
        return fetch(req).catch(async ()=> { 
            console.log('[Service Worker] Navigation failed, serving offline index.html.');
            
            // 3. JIKA NETWORK GAGAL, KEMBALI KEPADA 'index.html' YANG DISIMPAN
            let response = await caches.match('/index.html');
            if (response) return response;
            
            // Fallback to the root key (just in case index.html was cached as /)
            response = await caches.match('/');
            if (response) return response;
            
            // Jika tiada juga, throw error (akan menghasilkan 404 dari SW)
            throw new Error('Offline shell not available.');
        });
      })
    );
    return;
  }

  // Strategy: Cache-first for all other assets (images, CSS, JS)
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        return cached;
      }
      return fetch(req).then(res => {
        if (res.status === 200) {
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
