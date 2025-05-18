// Версия кэша, увеличивайте при обновлении ресурсов
const CACHE_VERSION = 'v2';
const CACHE_NAME = `hot-hair-salon-${CACHE_VERSION}`;
const STATIC_CACHE = `${CACHE_NAME}-static`;
const IMAGES_CACHE = `${CACHE_NAME}-images`;
const FONTS_CACHE = `${CACHE_NAME}-fonts`;

// Ресурсы для предварительного кэширования
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/before-after.html',
  '/styles.css',
  '/script.js',
  '/display-images.js',
  '/service-worker.js',
  '/images/favicon.png',
  '/images/hero-bg.jpg',
  '/images/logo.svg',
  '/images/placeholder.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js'
];

// Установка Service Worker и предварительное кэширование ресурсов
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Кэшируем статические ресурсы (HTML, CSS, JS)
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(PRECACHE_URLS.filter(url => 
          url.endsWith('.html') || url.endsWith('.css') || url.endsWith('.js')
        ));
      }),
      
      // Кэшируем изображения
      caches.open(IMAGES_CACHE).then(cache => {
        return cache.addAll(PRECACHE_URLS.filter(url => 
          url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)
        ));
      }),
      
      // Кэшируем шрифты и внешние библиотеки
      caches.open(FONTS_CACHE).then(cache => {
        return cache.addAll(PRECACHE_URLS.filter(url => 
          url.includes('cdnjs.cloudflare.com') || url.match(/\.(woff|woff2|ttf|eot)$/)
        ));
      })
    ])
    .then(() => self.skipWaiting())
  );
});

// Активация Service Worker и удаление старых кэшей
self.addEventListener('activate', event => {
  const currentCaches = [STATIC_CACHE, IMAGES_CACHE, FONTS_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('hot-hair-salon-') && !currentCaches.includes(cacheName))
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Стратегия кэширования с учетом типа ресурса
self.addEventListener('fetch', event => {
  // Пропускаем запросы не по HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;
  
  const url = new URL(event.request.url);
  
  // Обрабатываем только запросы GET
  if (event.request.method !== 'GET') return;
  
  // Пропускаем запросы к внешним ресурсам, кроме CDN
  if (!url.origin.includes(self.location.origin) && 
      !url.origin.includes('cdnjs.cloudflare.com')) {
    return;
  }

  // Выбираем кэш в зависимости от типа ресурса
  let cacheName;
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    cacheName = IMAGES_CACHE;
  } else if (url.origin.includes('cdnjs.cloudflare.com') || url.pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
    cacheName = FONTS_CACHE;
  } else {
    cacheName = STATIC_CACHE;
  }

  // Для HTML документов используем стратегию Network First
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Клонируем ответ для кэширования
          const responseToCache = response.clone();
          
          // Кэшируем ответ
          caches.open(STATIC_CACHE)
            .then(cache => cache.put(event.request, responseToCache));
            
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, используем кэш
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Если в кэше нет, возвращаем оффлайн-страницу
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // Для изображений используем стратегию Cache First
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Асинхронно обновляем кэш
            fetch(event.request)
              .then(response => {
                if (response.ok) {
                  caches.open(IMAGES_CACHE)
                    .then(cache => cache.put(event.request, response));
                }
              })
              .catch(() => {/* Игнорируем ошибки сети */});
            
            return cachedResponse;
          }
          
          // Если изображения нет в кэше, загружаем из сети
          return fetch(event.request)
            .then(response => {
              // Клонируем ответ для кэширования
              const responseToCache = response.clone();
              
              // Кэшируем ответ
              caches.open(IMAGES_CACHE)
                .then(cache => cache.put(event.request, responseToCache));
                
              return response;
            })
            .catch(() => {
              // Если изображение недоступно, возвращаем заглушку
              return caches.match('/images/placeholder.png');
            });
        })
    );
    return;
  }
  
  // Для остальных ресурсов (CSS, JS, шрифты) используем стратегию Stale While Revalidate
  event.respondWith(
    caches.open(cacheName).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            throw error;
          });
          
        // Возвращаем кэшированный ответ или ждем ответ из сети
        return cachedResponse || fetchPromise;
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
