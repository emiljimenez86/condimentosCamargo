const CACHE_NAME = 'camargo-condimentos-v3';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './products.js',
  './firebase-config.js',
  './manifest.json',
  './image/logo/LogoCondimentosCamargo.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'
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
          if (cacheName.startsWith('camargo-condimentos-') && cacheName !== CACHE_NAME) {
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
  if (url.origin === self.location.origin && (url.pathname === '/admin' || url.pathname.startsWith('/admin/'))) {
    return;
  }

  const host = url.hostname;
  if (
    host.includes('googleapis.com') ||
    host.includes('gstatic.com') ||
    host.includes('googleusercontent.com') ||
    host.includes('firebaseio.com')
  ) {
    return;
  }

  const isAppFile = url.origin === self.location.origin && (
    request.mode === 'navigate' ||
    /\.(html|js|css|json)$/.test(url.pathname)
  );

  if (isAppFile) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
