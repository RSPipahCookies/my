const CACHE_NAME = 'pipah-reseller-v2'; // CHANGE THIS NUMBER to force update (v1 -> v2)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './RSDashboard.html',
  './reseller-checkout.html',
  './admin.html',
  './reseller-manifest.json',
  // Add image paths here if you want offline images
];

// 1. INSTALL: Force "Skip Waiting" to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // <--- This forces the new SW to take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. ACTIVATE: Clean up old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // <--- Control all open clients immediately
  );
});

// 3. FETCH: Network First (Safe strategy for dynamic prices)
// It tries to get fresh data. If offline, it falls back to cache.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
      );
    })
  );
  // Take control of uncontrolled clients immediately
  return self.clients.claim();
});

// 3. Fetch Event (Serving assets from cache or network, with fallback)
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Strategy: Cache First, then fallback to Network, then fallback to index.html
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 1. Cache hit - return response immediately
        if (response) {
          console.log('[Service Worker] Fetching from cache:', event.request.url);
          return response;
        }

        // 2. No cache hit - fetch from network
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone and cache the resource for next time
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(error => {
            // 3. Network failed (user is offline or resource doesn't exist)
            console.error('[Service Worker] Network failed. Falling back to index.html:', event.request.url, error);
            
            // Fallback to the main index file for any failed request
            return caches.match('./index.html'); 
          });
      })
  );
});
