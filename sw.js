const CACHE_CORE  = 'mondomago-core-v9';
const CACHE_AUDIO = 'mondomago-audio-v8';

// Assets to precache on install — relative paths so they work under any base URL
const PRECACHE_URLS = [
  './',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_CORE).then(cache =>
      // Precache critical shell; individual failures don't abort install
      Promise.allSettled(PRECACHE_URLS.map(url => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_CORE && k !== CACHE_AUDIO)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // ── Audio files: cache-first (MP3s never change after generation) ──────────
  if (url.pathname.includes('/audio/') && url.pathname.endsWith('.mp3')) {
    e.respondWith(
      caches.open(CACHE_AUDIO).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        try {
          const res = await fetch(e.request);
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        } catch {
          return new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // ── Navigation requests: stale-while-revalidate, fallback to cached '/' ────
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.open(CACHE_CORE).then(async cache => {
        const cached = await cache.match(e.request) || await cache.match('/');
        const networkPromise = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => null);
        // Serve cached immediately, revalidate in background
        return cached || networkPromise || new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // ── Static assets (JS/CSS/images): stale-while-revalidate ─────────────────
  e.respondWith(
    caches.open(CACHE_CORE).then(async cache => {
      const cached = await cache.match(e.request);
      const networkPromise = fetch(e.request).then(res => {
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(() => cached || new Response('', { status: 503 }));
      return cached || networkPromise;
    })
  );
});

// ── Push notification handler ─────────────────────────────────────────────────
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'MondoMago', body: 'Torna a giocare oggi! ⭐' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'MondoMago', {
      body:    data.body  || 'La tua avventura ti aspetta! 🧙‍♂️',
      icon:    './icon-192.png',
      badge:   './icon-192.png',
      vibrate: [100, 50, 100],
      data:    { url: './' },
      actions: [{ action: 'play', title: 'Gioca ora! 🎮' }],
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      const found = cs.find(c => c.url.includes(self.location.origin) && 'focus' in c);
      if (found) return found.focus();
      return clients.openWindow('./');
    })
  );
});

// ── Periodic background sync: daily reminder ─────────────────────────────────
self.addEventListener('periodicsync', e => {
  if (e.tag !== 'daily-reminder') return;
  e.waitUntil(
    (async () => {
      const all = await clients.matchAll({ includeUncontrolled: true });
      if (all.length > 0) return;
      self.registration.showNotification('MondoMago 🧙‍♂️', {
        body:    'La sfida del giorno ti aspetta! Puoi guadagnare 3 stelle bonus ⭐⭐⭐',
        icon:    './icon-192.png',
        badge:   './icon-192.png',
        vibrate: [100, 50, 100],
        data:    { url: './' },
      });
    })()
  );
});
