// Оптимизированный скрипт для отображения изображений из localStorage на страницах сайта

// Используем requestIdleCallback для неприоритетных операций или setTimeout как запасной вариант
const requestIdleCallbackPolyfill = window.requestIdleCallback || 
    function(cb) {
        return setTimeout(function() {
            const start = Date.now();
            cb({
                didTimeout: false,
                timeRemaining: function() {
                    return Math.max(0, 50 - (Date.now() - start));
                }
            });
        }, 1);
    };

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, на какой странице находимся
    const currentPage = window.location.pathname.split('/').pop();
    
    // Используем requestIdleCallback для загрузки изображений, чтобы не блокировать основной поток
    requestIdleCallbackPolyfill(() => {
        // Загружаем изображения в зависимости от страницы
        if (currentPage === 'index.html' || currentPage === '') {
            // Главная страница - загружаем изображения для галереи
            loadGalleryImagesOnMainPage();
            // Загружаем услуги
            loadServicesOnMainPage();
        } else if (currentPage === 'before-after.html') {
            // Страница До/После - загружаем изображения До/После
            loadBeforeAfterImagesOnPage();
        }
    });
});

// Оптимизированная загрузка изображений галереи на главную страницу
function loadGalleryImagesOnMainPage() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    try {
        // Получаем изображения из localStorage с обработкой ошибок
        const imagesStr = localStorage.getItem('hotHairImages');
        if (!imagesStr) return;
        
        const images = JSON.parse(imagesStr);
        if (!Array.isArray(images)) return;
        
        // Фильтруем только изображения для галереи
        const galleryImages = images.filter(img => img && img.category === 'gallery');
        
        // Если есть изображения в галерее
        if (galleryImages.length > 0) {
            // Используем DocumentFragment для оптимизации DOM-операций
            const fragment = document.createDocumentFragment();
            
            // Добавляем новые изображения
            galleryImages.forEach(image => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                
                const img = document.createElement('img');
                img.src = image.data;
                img.alt = image.title || 'Работа салона';
                img.loading = 'lazy'; // Добавляем ленивую загрузку
                img.width = 300; // Указываем размеры для предотвращения смещения макета
                img.height = 300;
                
                galleryItem.appendChild(img);
                fragment.appendChild(galleryItem);
            });
            
            // Очищаем текущие изображения и добавляем все новые за одну операцию
            galleryGrid.innerHTML = '';
            galleryGrid.appendChild(fragment);
        }
    } catch (error) {
        console.error('Ошибка при загрузке изображений галереи:', error);
    }
}

// Оптимизированная загрузка изображений До/После на соответствующую страницу
function loadBeforeAfterImagesOnPage() {
    const beforeAfterGrid = document.querySelector('.before-after-grid');
    if (!beforeAfterGrid) return;
    
    try {
        // Получаем изображения из localStorage с обработкой ошибок
        const imagesStr = localStorage.getItem('hotHairImages');
        if (!imagesStr) return;
        
        const images = JSON.parse(imagesStr);
        if (!Array.isArray(images)) return;
        
        // Фильтруем только изображения До/После
        const beforeAfterImages = images.filter(img => img && img.category === 'before-after');
        
        // Если есть изображения До/После
        if (beforeAfterImages.length > 0) {
            // Получаем все существующие примеры
            const existingItems = beforeAfterGrid.querySelectorAll('.ba-item');
            const existingIds = new Set(Array.from(existingItems).map(item => item.dataset.imageId));
            
            // Используем DocumentFragment для оптимизации DOM-операций
            const fragment = document.createDocumentFragment();
            
            // Добавляем только новые изображения
            beforeAfterImages.forEach((image, index) => {
                // Проверяем, есть ли уже такое изображение (по ID)
                if (!existingIds.has(image.id)) {
                    // Создаем новый элемент До/После
                    const baItem = document.createElement('div');
                    baItem.className = 'ba-item';
                    baItem.dataset.imageId = image.id;
                    
                    // Добавляем изображение с ленивой загрузкой
                    const img = document.createElement('img');
                    img.src = image.data;
                    img.alt = image.title || 'Пример До/После';
                    img.loading = 'lazy'; // Добавляем ленивую загрузку
                    img.width = 300; // Указываем размеры для предотвращения смещения макета
                    img.height = 300;
                    
                    // Добавляем подпись
                    const caption = document.createElement('div');
                    caption.className = 'ba-caption';
                    caption.textContent = image.title || 'Преображение';
                    
                    baItem.appendChild(img);
                    baItem.appendChild(caption);
                    fragment.appendChild(baItem);
                }
            });
            
            // Добавляем все новые элементы за одну операцию
            beforeAfterGrid.appendChild(fragment);
        }
    } catch (error) {
        console.error('Ошибка при загрузке изображений До/После:', error);
    }
}

// Оптимизированная загрузка услуг на главную страницу
function loadServicesOnMainPage() {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;
    
    try {
        // Получаем услуги из localStorage с обработкой ошибок
        const servicesStr = localStorage.getItem('hotHairServices');
        if (!servicesStr) return;
        
        const services = JSON.parse(servicesStr);
        
        // Если есть услуги
        if (services && Array.isArray(services) && services.length > 0) {
            // Используем DocumentFragment для оптимизации DOM-операций
            const fragment = document.createDocumentFragment();
            
            // Добавляем услуги
            services.forEach(service => {
                if (!service) return;
                
                const serviceCard = document.createElement('div');
                serviceCard.className = 'service-card';
                
                // Создаем элементы вместо использования innerHTML для лучшей производительности
                const iconDiv = document.createElement('div');
                iconDiv.className = 'service-icon';
                iconDiv.innerHTML = service.icon || '';
                
                const title = document.createElement('h3');
                title.textContent = service.name || '';
                
                const description = document.createElement('p');
                description.textContent = service.description || '';
                
                const price = document.createElement('p');
                price.className = 'price';
                price.textContent = service.price || '';
                
                serviceCard.appendChild(iconDiv);
                serviceCard.appendChild(title);
                serviceCard.appendChild(description);
                serviceCard.appendChild(price);
                
                fragment.appendChild(serviceCard);
            });
            
            // Очищаем текущие услуги и добавляем все новые за одну операцию
            servicesGrid.innerHTML = '';
            servicesGrid.appendChild(fragment);
        }
    } catch (error) {
        console.error('Ошибка при загрузке услуг:', error);
    }
}

// Оптимизированная загрузка фоновых изображений
function loadBackgroundImages() {
    try {
        // Получаем изображения из localStorage с обработкой ошибок
        const imagesStr = localStorage.getItem('hotHairImages');
        if (!imagesStr) return;
        
        const images = JSON.parse(imagesStr);
        if (!Array.isArray(images)) return;
        
        // Фильтруем только фоновые изображения
        const backgroundImages = images.filter(img => img && img.category === 'backgrounds');
        
        // Если есть фоновые изображения
        if (backgroundImages.length > 0) {
            // Получаем случайное изображение
            const randomIndex = Math.floor(Math.random() * backgroundImages.length);
            const backgroundImage = backgroundImages[randomIndex];
            
            // Применяем к секции hero
            const heroSection = document.querySelector('.hero');
            if (heroSection && backgroundImage && backgroundImage.data) {
                // Предварительно загружаем изображение перед установкой
                const img = new Image();
                img.onload = function() {
                    heroSection.style.backgroundImage = `url(${backgroundImage.data})`;
                    heroSection.classList.add('background-loaded'); // Добавляем класс для анимации появления
                };
                img.src = backgroundImage.data;
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке фоновых изображений:', error);
    }
}
