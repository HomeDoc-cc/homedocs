const CACHE_NAME = 'homedocs-cache-v1';
const IMAGE_CACHE_NAME = 'homedocs-images-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// Cache duration for images (30 days)
const IMAGE_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName.startsWith('homedocs-') &&
                cacheName !== CACHE_NAME &&
                cacheName !== IMAGE_CACHE_NAME
              );
            })
            .map((cacheName) => {
              return caches.delete(cacheName);
            })
        );
      }),
      // Clean up old images
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const requests = await cache.keys();
        const now = Date.now();
        return Promise.all(
          requests.map(async (request) => {
            const response = await cache.match(request);
            if (!response) return;
            
            const cachedDate = response.headers.get('x-cached-date');
            if (cachedDate && now - new Date(cachedDate).getTime() > IMAGE_CACHE_DURATION) {
              return cache.delete(request);
            }
          })
        );
      }),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Special handling for image requests
  if (event.request.method === 'GET' && event.request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        // Try to get from cache first
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          // Check if cache is still valid
          const cachedDate = cachedResponse.headers.get('x-cached-date');
          if (cachedDate && Date.now() - new Date(cachedDate).getTime() <= IMAGE_CACHE_DURATION) {
            return cachedResponse;
          }
        }

        // If not in cache or expired, fetch new
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            // Clone the response before caching because the response body can only be used once
            const responseToCache = networkResponse.clone();
            
            // Add cache date header
            const headers = new Headers(responseToCache.headers);
            headers.append('x-cached-date', new Date().toISOString());
            
            const modifiedResponse = new Response(await responseToCache.blob(), {
              status: responseToCache.status,
              statusText: responseToCache.statusText,
              headers: headers,
            });

            cache.put(event.request, modifiedResponse);
          }
          return networkResponse;
        } catch (error) {
          // If offline and we have a cached version (even if expired), use it
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        }
      })
    );
    return;
  }

  // Default handling for non-image requests
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch new version
      return response || fetch(event.request);
    })
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 