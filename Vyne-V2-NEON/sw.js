const CACHE = 'vyne-v2-shell';
const ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  event.respondWith(fetch(event.request).then(r => { const copy=r.clone(); caches.open(CACHE).then(c=>c.put(event.request,copy)); return r; }).catch(() => caches.match(event.request).then(r=>r || caches.match('/index.html'))));
});
