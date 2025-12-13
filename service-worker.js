// service-worker.js
// Network-first for navigations (index.html), cache-first for other static assets.
// Version the cache to force cleanup on deploy.

const CACHE_VERSION = 'v1'; // bump this on each deploy to invalidate old caches
const CACHE_NAME = `hotcoffe-cache-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  '/',           // allow fallback for navigation
  '/index.html',
  '/qr.js?v=1',
  '/GogetaSSJ4K.png?v=1',
  '/equipments_logo.png?v=1',
  // add other static files you want pre-cached (optional)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Let the new worker move to 'installed' state
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isNavigationRequest(request) {
  const accept = request.headers.get('accept') || '';
  return request.mode === 'navigate' || accept.includes('text/html');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Network-first for navigations so index.html is always fresh when online
  if (isNavigationRequest(req)) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          // Update cached copy for offline fallback, do not block response
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          return networkResponse;
        })
        .catch(() =>
          caches.match('/index.html').then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // For other assets (CSS/JS/images): cache-first with background update
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => null);

      if (cached) {
        // update cache in background, but return cached immediately
        networkFetch.catch(() => {});
        return cached;
      }
      return networkFetch;
    })
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'CLEAR_CACHES') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
});