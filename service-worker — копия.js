// Версия кэша, увеличивайте при обновлении ресурсов
const CACHE_VERSION = 'v1';
const CACHE_NAME = `hot-hair-salon-${CACHE_VERSION}`;

// Ресурсы для предварительного кэширования
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/before-after.html',
  '/styles.css',
  '/script.js',
  '/display-images.js',
  '/images/favicon.png',
  // Добавьте другие важные ресурсы
];

// Установка Service Worker и предварительное кэширование ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker и удаление старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('hot-hair-salon-') && cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Стратегия кэширования: сначала кэш, затем сеть с обновлением кэша
self.addEventListener('fetch', event => {
  // Пропускаем запросы не по HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;
  
  // Пропускаем запросы к внешним ресурсам
  if (!event.request.url.includes(self.location.origin) && 
      !event.request.url.includes('cdnjs.cloudflare.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Возвращаем кэшированный ответ, если он есть
        if (cachedResponse) {
          // Асинхронно обновляем кэш
          fetch(event.request)
            .then(response => {
              if (response.ok) {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, response));
              }
            })
            .catch(() => {/* Игнорируем ошибки сети */});
          
          return cachedResponse;
        }

        // Если ресурса нет в кэше, пытаемся получить его из сети
        return fetch(event.request)
          .then(response => {
            // Проверяем, что ответ валидный
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Клонируем ответ, так как он может быть использован только один раз
            const responseToCache = response.clone();

            // Кэшируем новый ресурс
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));

            return response;
          })
          .catch(error => {
            // Для изображений возвращаем заглушку при ошибке сети
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
              return caches.match('/images/placeholder.png');
            }
            
            // Для остальных ресурсов просто возвращаем ошибку
            throw error;
          });
      })
  );
});

// Обработка push-уведомлений (если потребуется в будущем)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/images/favicon.png',
      badge: '/images/badge.png',
      data: data.url
    });
  }
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});
