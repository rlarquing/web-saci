// Minimal service worker: offline fallback for navigations + immutable asset cache.
// Bump CACHE_VERSION to invalidate everything the previous worker stored.
const CACHE_VERSION = 'sacp-v1';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_VERSION)
            .then((cache) => cache.add(OFFLINE_URL))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    // Navigations: always prefer fresh content, fall back to the offline page.
    if (request.mode === 'navigate') {
        event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
        return;
    }

    // Build output is content-hashed, so a cache hit can never be stale.
    if (new URL(request.url).pathname.startsWith('/_next/static/')) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((response) => {
                        const copy = response.clone();
                        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
                        return response;
                    }),
            ),
        );
        return;
    }

    // Everything else (API calls included) goes straight to the network.
});
