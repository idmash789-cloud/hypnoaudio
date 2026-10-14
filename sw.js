/* HypnoKids service worker — cache kerangka aplikasi agar cepat dibuka.
   File audio TIDAK di-cache di sini (ukurannya besar); audio diputar streaming. */
const CACHE = 'hypnokids-shell-v1';
const SHELL = ['./', './index.html', './style.css', './app.js', './icon.svg', './manifest.webmanifest'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.json')) return; // audio & manifest: selalu jaringan
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
