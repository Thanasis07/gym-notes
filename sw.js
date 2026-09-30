const CACHE_NAME = 'gym-notes-cache-v4';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './app.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(async () => {
                // 1. Δες αν υπάρχει αποθηκευμένο το αρχείο στη μνήμη
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                // 2. Η διόρθωση: Αν είναι εκτός σύνδεσης και ζητάει σελίδα, δώστωνας το index.html αντί για μαύρη οθόνη!
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            })
    );
});