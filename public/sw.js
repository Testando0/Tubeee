/* RubiTube Service Worker v2 */
const CACHE = 'rubitube-v2';
const STATIC = [
  '/',
  '/search',
];

// Install — cache shell
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {}))
  );
});

// Activate — purge old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — stale-while-revalidate for pages, network-first for API
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin non-static
  if (request.method !== 'GET') return;

  // API routes: network first, no cache (always fresh data)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        })
      )
    );
    return;
  }

  // YouTube nocookie player — pass through
  if (url.hostname.includes('youtube-nocookie.com') || url.hostname.includes('youtube.com')) {
    return; // let browser handle
  }

  // Fonts / CDN assets — cache first
  if (url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('fonts.googleapis.com')) {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Static assets (JS, CSS, images) — cache first
  if (url.pathname.match(/\.(js|css|png|svg|ico|woff2?)$/)) {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Navigation — network first, fallback to cache
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
  }
});

// Background sync placeholder
self.addEventListener('sync', () => {});

// Push notification placeholder
self.addEventListener('push', () => {});

// Keep audio alive hint (tells browser this SW manages media)
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
