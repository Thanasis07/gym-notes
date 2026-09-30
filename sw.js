const CACHE_NAME = 'gym-notes-cache-v3'; // Πήγαμε στο v3 για να σβήσει το χαλασμένο v2

// ΒΑΛΕ ΜΟΝΟ ΤΑ ΑΡΧΕΙΑ ΠΟΥ ΕΙΣΑΙ 100% ΣΙΓΟΥΡΟΣ ΟΤΙ ΥΠΑΡΧΟΥΝ!
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './app.js'
    // Αν έχεις αρχείο style.css βγάλε τα // από την από κάτω γραμμή
    // , './style.css' 
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
    // 1. Αγνόησε οτιδήποτε δεν είναι GET (π.χ. αιτήματα εγγραφής/διαγραφής του Firebase)
    if (event.request.method !== 'GET') return;

    // 2. Αγνόησε τα αιτήματα προς άλλους servers (π.χ. Google Authentication)
    if (!event.request.url.startsWith(self.location.origin)) return;

    // 3. Network-First: Προσπάθησε να πάρεις το αρχείο από το ίντερνετ. 
    // Αν πέσει το ίντερνετ (catch), τότε και ΜΟΝΟ τότε, δώσε αυτό που έχεις αποθηκεύσει.
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});