// Dinner Swipe service worker, version 20261111100654
// Pages and code: network first (so updates arrive), falling back to the saved copy when offline.
// Photos and fonts: saved copy first (they never change), fetched once and kept.
// Only same-site GET requests are handled; nothing is ever sent anywhere else.
const CORE_CACHE = 'ds-core-20261111100654';
const MEDIA_CACHE = 'ds-media-v1';
const CORE = ['./', './index.html', './app.css?v=20261111100654', './app.js?v=20261111100654', './manifest.webmanifest', './icons/icon-192.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CORE_CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('ds-core-') && k !== CORE_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/photos/') || url.pathname.includes('/fonts/')) {
    e.respondWith(caches.open(MEDIA_CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CORE_CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: false }).then(hit => hit || caches.match('./index.html'))));
});
