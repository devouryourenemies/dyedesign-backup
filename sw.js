// MECHA TERMINAL Service Worker — v2 with network-first for HTML/JS
const CACHE = 'mecha-terminal-v2';
const ASSETS = [
  '/',
  '/favicon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML and JS (ensures fresh content)
  if (url.pathname.endsWith('.html') || url.pathname === '/' ||
      url.pathname.endsWith('.js') || url.pathname.startsWith('/_next/static/chunks/')) {
    e.respondWith(
      fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
        return res;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for stable assets (fonts, images, sprites)
  if (url.pathname.match(/\.(woff2?|ttf|otf|eot|css|png|jpg|jpeg|gif|svg|webp|ico|mp4|wav|mp3)$/i) ||
      url.pathname.startsWith('/sprites/') ||
      url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
        return res;
      }))
    );
  }
});
