const CACHE_NAME = 'pipahcookies-v1';
// List the core assets that make up the App Shell (UI)
const urlsToCache = [
  // Cache the index file explicitly to be used as a fallback
  './', 
  './index.html', 
  './css/style.css', 
  './js/app.js',     
  './images/rs194.png',
  './images/rs512.png',
  './reseller-manifest.json'
];

// 1. Install Event (Caching the App Shell)
self.addEventListener('install', event => {
  console.log('[Service Worker] Install event: Caching App Shell');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activate Event (Cleaning up old caches)
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate event: Cleaning old caches');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
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
