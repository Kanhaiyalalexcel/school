// sw.js

const CACHE_NAME = 'springfield-academy-cache-v1'; // Change version to update cache
const urlsToCache = [
    '/',
    '/index.html',
    '/about.html',
    '/gallery.html',
    '/results.html',
    '/notice.html',
    '/educators.html',
    '/offline.html', // Important: An offline fallback page
    '/css/style.css',
    '/css/notice.css',
    '/css/results.css',
    '/css/gallery.css',
    '/css/mobile-nav.css',
    '/js/script.js',
    '/js/notice.js',
    '/js/results.js',
    '/js/gallery.js',
    '/images/logo.png',
    '/images/favicon.ico',
    '/images/hero-bg.jpg', // Add other critical static images
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' // External resources
    // Add paths to your app icons here if you want them cached immediately
    // e.g., '/images/icons/icon-192x192.png',
    // Be mindful not to cache too many large images initially
];

// Install service worker and cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: App shell cached successfully');
                return self.skipWaiting(); // Activate new service worker immediately
            })
            .catch(error => {
                console.error('Service Worker: Caching failed', error);
            })
    );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activated successfully');
            return self.clients.claim(); // Take control of all open clients
        })
    );
});

// Fetch event: Serve cached content when offline (Cache falling back to network)
self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Cache hit - return response
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Not in cache - fetch from network
                return fetch(event.request).then(
                    networkResponse => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                            return networkResponse;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Don't cache API responses like .json data files here with this strategy
                                // as they might become stale. Handle them separately if needed.
                                if (!event.request.url.includes('/data/')) {
                                     cache.put(event.request, responseToCache);
                                }
                            });

                        return networkResponse;
                    }
                ).catch(error => {
                    // Network request failed, try to serve offline.html
                    console.log('Service Worker: Fetch failed; returning offline page instead.', error);
                    return caches.match('/offline.html');
                });
            })
    );
});