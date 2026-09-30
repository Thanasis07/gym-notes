const CACHE_NAME = 'gym-notes-cache-v2'; // <-- Αλλάξαμε την έκδοση σε v2!
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon.png'
];

// 1. Εγκατάσταση και αποθήκευση νέων αρχείων
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // <-- Λέει στον browser να πάρει το update ΑΜΕΣΩΣ
});

// 2. Ενεργοποίηση και ΣΒΗΣΙΜΟ της παλιάς μνήμης (του v1)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("Διαγραφή παλιάς μνήμης:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // <-- Αναλαμβάνει τον έλεγχο χωρίς να χρειάζεται επανεκκίνηση
});

// 3. Όταν ζητάει αρχεία, δώσ' τα από την τοπική μνήμη
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});