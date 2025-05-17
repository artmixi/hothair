// Скрипт для отображения изображений из localStorage на страницах сайта

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, на какой странице находимся
    const currentPage = window.location.pathname.split('/').pop();
    
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

// Загрузка изображений галереи на главную страницу
function loadGalleryImagesOnMainPage() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    // Получаем изображения из localStorage
    const images = JSON.parse(localStorage.getItem('hotHairImages')) || [];
    
    // Фильтруем только изображения для галереи
    const galleryImages = images.filter(img => img.category === 'gallery');
    
    // Если есть изображения в галерее
    if (galleryImages.length > 0) {
        // Очищаем текущие изображения
        galleryGrid.innerHTML = '';
        
        // Добавляем новые изображения
        galleryImages.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            const img = document.createElement('img');
            img.src = image.data;
            img.alt = image.title || 'Работа салона';
            
            galleryItem.appendChild(img);
            galleryGrid.appendChild(galleryItem);
        });
    }
}

// Загрузка изображений До/После на соответствующую страницу
function loadBeforeAfterImagesOnPage() {
    const beforeAfterGrid = document.querySelector('.before-after-grid');
    if (!beforeAfterGrid) return;
    
    // Получаем изображения из localStorage
    const images = JSON.parse(localStorage.getItem('hotHairImages')) || [];
    
    // Фильтруем только изображения До/После
    const beforeAfterImages = images.filter(img => img.category === 'before-after');
    
    // Если есть изображения До/После
    if (beforeAfterImages.length > 0) {
        // Получаем все существующие примеры
        const existingItems = beforeAfterGrid.querySelectorAll('.ba-item');
        
        // Добавляем новые изображения после существующих
        beforeAfterImages.forEach((image, index) => {
            // Проверяем, есть ли уже такое изображение (по ID)
            const existingItem = Array.from(existingItems).find(item => 
                item.dataset.imageId === image.id
            );
            
            if (!existingItem) {
                // Создаем новый элемент До/После
                const baItem = document.createElement('div');
                baItem.className = 'ba-item';
                baItem.dataset.imageId = image.id;
                
                // Добавляем изображение
                const img = document.createElement('img');
                img.src = image.data;
                img.alt = image.title || 'Пример До/После';
                
                // Добавляем подпись
                const caption = document.createElement('div');
                caption.className = 'ba-caption';
                caption.textContent = image.title || 'Преображение';
                
                baItem.appendChild(img);
                baItem.appendChild(caption);
                beforeAfterGrid.appendChild(baItem);
            }
        });
    }
}

// Загрузка услуг на главную страницу
function loadServicesOnMainPage() {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;
    
    // Получаем услуги из localStorage
    const services = JSON.parse(localStorage.getItem('hotHairServices'));
    
    // Если есть услуги
    if (services && services.length > 0) {
        // Очищаем текущие услуги
        servicesGrid.innerHTML = '';
        
        // Добавляем услуги
        services.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card';
            
            serviceCard.innerHTML = `
                <div class="service-icon">${service.icon}</div>
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                <p class="price">${service.price}</p>
            `;
            
            servicesGrid.appendChild(serviceCard);
        });
    }
}

// Загрузка фоновых изображений
function loadBackgroundImages() {
    // Получаем изображения из localStorage
    const images = JSON.parse(localStorage.getItem('hotHairImages')) || [];
    
    // Фильтруем только фоновые изображения
    const backgroundImages = images.filter(img => img.category === 'backgrounds');
    
    // Если есть фоновые изображения
    if (backgroundImages.length > 0) {
        // Получаем случайное изображение
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        const backgroundImage = backgroundImages[randomIndex];
        
        // Применяем к секции hero
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.style.backgroundImage = `url(${backgroundImage.data})`;
        }
    }
}
