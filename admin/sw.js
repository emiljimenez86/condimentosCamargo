const CACHE_NAME = 'camargo-admin-v1';
const urlsToCache = [
  './',
  './index.html',
  './admin.css',
  './admin.js',
  './manifest.json',
  '../products.js',
  '../firebase-config.js',
  '../image/logo/LogoCondimentosCamargo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('camargo-admin-') && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const host = url.hostname;
  if (
    host.includes('googleapis.com') ||
    host.includes('gstatic.com') ||
    host.includes('googleusercontent.com') ||
    host.includes('firebaseio.com')
  ) {
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
