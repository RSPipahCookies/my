// CHANGE THIS VERSION NUMBER whenever you update your code to force a full reset
// e.g., v1 -> v2, v2 -> v3
const CACHE_NAME = 'pipah-cache-v2'; 
const DYNAMIC_CACHE = 'pipah-images-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './images/rs194.png',
  './images/rs512.png', 
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@300;400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 1. INSTALL: Download assets & Activate immediately
self.addEventListener('install', (event) => {
  // FORCE WAIT: This forces the SW to activate immediately, not waiting for tabs to close
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. ACTIVATE: Clean up old versions (v1, v2, etc.)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // If the key is not the current version, DELETE IT
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. FETCH: The Interceptor
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // STRATEGY A: IMAGES -> Cache First, Fallback to Network
  // We keep images cached aggressively because they rarely change and take up bandwidth.
  if (req.url.includes('firebasestorage.googleapis.com') || 
      req.url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(req).then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(req, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
           return caches.match('./images/rs512.png'); // Fallback image if offline
        });
      })
    );
    return; 
  }

  // STRATEGY B: HTML/CSS/JS -> Network First (The "Auto Update" Logic)
  // 1. Try to fetch from the internet.
  // 2. If successful, put the NEW file in the cache (overwriting the old one).
  // 3. If offline/failed, ONLY THEN use the cache.
  event.respondWith(
    fetch(req).then((networkRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
            // Update the cache with the new version
            cache.put(req, networkRes.clone());
            return networkRes;
        });
    }).catch(() => {
        // If offline, return the cached version
        return caches.match(req);
    })
  );
});
