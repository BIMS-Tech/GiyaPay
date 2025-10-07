/**
 * Service Worker for GiyaPay Blog
 * Provides offline caching and ultra-fast loading
 */

const CACHE_NAME = 'giyapay-blog-v1';
const API_CACHE_NAME = 'giyapay-api-v1';

// Resources to cache immediately
const STATIC_CACHE_URLS = [
    '/',
    '/blog.html',
    '/css/giyapay.webflow.css',
    '/css/normalize.css',
    '/css/webflow.css',
    '/js/api-config.js',
    '/js/webflow.js',
    '/js/header-manager.js',
    '/images/giyapay-logo.png',
    '/images/favicon.png'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static resources...');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Static resources cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static resources:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests with cache-first strategy
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            caches.open(API_CACHE_NAME)
                .then(cache => {
                    return cache.match(request)
                        .then(response => {
                            if (response) {
                                console.log('Serving API from cache:', url.pathname);
                                // Return cached response and update in background
                                fetch(request)
                                    .then(fetchResponse => {
                                        if (fetchResponse.ok) {
                                            cache.put(request, fetchResponse.clone());
                                        }
                                    })
                                    .catch(() => {
                                        // Ignore network errors for background updates
                                    });
                                return response;
                            } else {
                                // Not in cache, fetch from network
                                console.log('Fetching API from network:', url.pathname);
                                return fetch(request)
                                    .then(fetchResponse => {
                                        if (fetchResponse.ok) {
                                            cache.put(request, fetchResponse.clone());
                                        }
                                        return fetchResponse;
                                    });
                            }
                        });
                })
        );
        return;
    }

    // Handle static resources with cache-first strategy
    if (request.method === 'GET') {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        console.log('Serving from cache:', url.pathname);
                        return response;
                    }
                    
                    // Not in cache, fetch from network
                    console.log('Fetching from network:', url.pathname);
                    return fetch(request)
                        .then(fetchResponse => {
                            // Cache successful responses
                            if (fetchResponse.ok) {
                                const responseClone = fetchResponse.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return fetchResponse;
                        });
                })
        );
    }
});

// Message event - handle cache invalidation
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('Clearing all caches...');
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
            .then(() => {
                console.log('All caches cleared');
                event.ports[0].postMessage({ success: true });
            });
    }
});
