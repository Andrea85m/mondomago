const CACHE_CORE  = 'mondomago-core-v3';
const CACHE_AUDIO = 'mondomago-audio-v3';

// Stale-while-revalidate for core; cache-first for audio MP3s
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_CORE).then(c => c.addAll(['/']).catch(() => {}))
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
  if (url.pathname.startsWith('/audio/') && url.pathname.endsWith('.mp3')) {
    e.respondWith(
      caches.open(CACHE_AUDIO).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        try {
          const res = await fetch(e.request);
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        } catch {
          return cached || new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // ── Everything else: stale-while-revalidate ────────────────────────────────
  e.respondWith(
    caches.open(CACHE_CORE).then(async cache => {
      const cached = await cache.match(e.request);
      const networkPromise = fetch(e.request).then(res => {
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(() => cached);
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
      icon:    '/favicon.svg',
      badge:   '/favicon.svg',
      vibrate: [100, 50, 100],
      data:    { url: '/' },
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
      return clients.openWindow('/');
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
        icon:    '/favicon.svg',
        badge:   '/favicon.svg',
        vibrate: [100, 50, 100],
        data:    { url: '/' },
      });
    })()
  );
});
