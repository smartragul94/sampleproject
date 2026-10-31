const VERSION = 'v2';
const SHELL_CACHE = `vedanthika-shell-${VERSION}`;
const ASSET_CACHE = `vedanthika-assets-${VERSION}`;
const SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never touch Supabase / any other origin: auth and clinic data must always hit the network.
  if (url.origin !== self.location.origin) return;

  // Page loads: network first so updates arrive immediately, cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(() =>
          caches.match('/').then(
            (cached) =>
              cached ??
              new Response('You are offline. Please reconnect and reopen the app.', {
                status: 503,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
              }),
          ),
        ),
    );
    return;
  }

  // Built files in /assets/ have content hashes in their names, so cache-first is safe.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(ASSET_CACHE).then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ??
            fetch(request).then((response) => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            }),
        ),
      ),
    );
    return;
  }

  // Icons, manifest and everything else: serve cached copy, refresh in the background.
  event.respondWith(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached ?? network;
      }),
    ),
  );
});
