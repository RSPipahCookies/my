const CACHE_NAME = 'pipahcookies-v1';
// List the core assets that make up the App Shell (UI)
const urlsToCache = [
  './', // Caches the index.html
  './index.html', // Explicitly cache the main file
  './css/style.css', // Assuming you have a CSS file
  './js/app.js',     // Assuming you have a main JavaScript file
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

// 3. Fetch Event (Serving assets from cache or network)
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Strategy: Cache First, then fallback to Network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('[Service Worker] Fetching from cache:', event.request.url);
          return response;
        }

        // No cache hit - fetch from network
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Important: Clone the response. A response is a stream and can only be consumed once.
            const responseToCache = networkResponse.clone();
            
            // Cache the new resource if it's not a live data request (e.g., API calls)
            // You may want to add more logic here to handle API calls if needed.
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', event.request.url, error);
            // Fallback for when both cache and network fail (optional: show an offline page)
            // For example, return caches.match('offline.html');
          });
      })
  );
});
