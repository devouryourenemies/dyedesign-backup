// MECHA TERMINAL Service Worker — static asset cache
const CACHE = 'mecha-terminal-v1';
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
  // Cache static assets: fonts, CSS, JS chunks, images, sprites
  if (
    url.origin === self.location.origin &&
    (url.pathname.match(/\.(woff2?|ttf|otf|eot|css|js|png|jpg|jpeg|gif|svg|webp|ico|mp4|wav|mp3)$/i) ||
     url.pathname.startsWith('/_next/static/') ||
     url.pathname.startsWith('/sprites/') ||
     url.pathname.startsWith('/assets/') ||
     url.pathname.startsWith('/dist/'))
  ) {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
        return res;
      }))
    );
  }
});
