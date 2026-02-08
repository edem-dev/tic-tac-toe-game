
const CACHE_NAME = 'ticky-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.css',
  'https://cdn-icons-png.flaticon.com/512/1021/1021264.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
