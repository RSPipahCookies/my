const CACHE_NAME = 'pipah-cache-v1';
const DYNAMIC_CACHE = 'pipah-images-v1';

// 1. Files to cache immediately (The App Shell + Offline Image)
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './images/rs194.png',
  './images/rs512.png', // <--- IMPORTANT: We cache this immediately!
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@300;400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// INSTALL: Download the basic app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell & Offline Image');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// FETCH: The "Interceptor"
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // STRATEGY 1: Handle Images (Firebase Storage or regular images)
  if (req.url.includes('firebasestorage.googleapis.com') || 
      req.url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        // A. If image is in cache, return it (Offline success!)
        if (cachedResponse) {
          return cachedResponse;
        }

        // B. If not in cache, try internet
        return fetch(req).then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(req, networkResponse.clone()); // Save for next time
            return networkResponse;
          });
        }).catch(() => {
           // C. NETWORK FAILED? Return the Offline Placeholder!
           return caches.match('./Images/offline.png');
        });
      })
    );
    return; 
  }

  // STRATEGY 2: Handle everything else (HTML, CSS, JS)
  // Network First, fallback to Cache (better for keeping data fresh)
  // OR Cache First (faster). Since you have a dynamic app, 
  // let's stick to Cache First for shell, Network for data usually handled by Firestore.
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      return cachedRes || fetch(req).catch(() => {
          // If HTML request fails, we could return a specific "Offline Page" here too
          // But usually caching index.html is enough.
      });
    })
  );
});
