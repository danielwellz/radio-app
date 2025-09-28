const CACHE_NAME = 'waveradio-v2.1.0';

// Only cache essential files that exist
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.log('Cache addAll failed:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Don't cache API or WebSocket requests
  if (event.request.url.includes('/api/') || event.request.url.includes('/ws/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(fetchResponse => {
          // Only cache successful responses
          if (fetchResponse && fetchResponse.status === 200) {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request.url, fetchResponse.clone());
              return fetchResponse;
            });
          }
          return fetchResponse;
        }).catch(() => {
          // Return offline page or fallback
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'WaveRadio', body: 'New notification' };
  }

  const options = {
    body: data.body || 'New notification from WaveRadio',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.url ? { url: data.url } : {},
    actions: [
      {
        action: 'listen',
        title: '🎵 Listen Now'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'WaveRadio', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'listen') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});