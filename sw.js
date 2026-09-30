const CACHE_NAME = 'gym-notes-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon.png'
];

// Εγκατάσταση και αποθήκευση αρχείων
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Όταν η εφαρμογή ζητάει αρχεία, δώσ' τα από την τοπική μνήμη αν δεν υπάρχει ίντερνετ
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});