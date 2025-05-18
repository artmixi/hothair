// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация функций для работы с изображениями
    setupImageUpload();
    setupImageEditor();
    loadGalleryImages();
    setupFilterControls();
});

// Настройка загрузки изображений
function setupImageUpload() {
    const imageFileInput = document.getElementById('image-file');
    const imagePreview = document.getElementById('image-preview');
    const uploadForm = document.getElementById('upload-form');
    
    // Предпросмотр изображения при выборе файла
    imageFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (!file) {
            imagePreview.innerHTML = '<div class="no-preview">Выберите изображение для предпросмотра</div>';
            return;
        }
        
        // Проверка, что файл является изображением
        if (!file.type.match('image.*')) {
            alert('Пожалуйста, выберите изображение');
            imageFileInput.value = '';
            return;
        }
        
        // Создаем объект FileReader для чтения файла
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Создаем изображение для предпросмотра
            imagePreview.innerHTML = `<img src="${e.target.result}" id="preview-img" alt="Предпросмотр">`;
            
            // Сохраняем оригинальное изображение для возможности сброса
            window.originalImage = e.target.result;
        };
        
        // Читаем файл как Data URL
        reader.readAsDataURL(file);
    });
    
    // Обработка отправки формы
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const imageFile = imageFileInput.files[0];
        if (!imageFile) {
            alert('Пожалуйста, выберите изображение для загрузки');
            return;
        }
        
        const category = document.getElementById('image-category').value;
        const title = document.getElementById('image-title').value || '';
        const description = document.getElementById('image-description').value || '';
        
        // Получаем отредактированное изображение из предпросмотра
        const previewImg = document.getElementById('preview-img');
        let imageData = '';
        
        if (previewImg) {
            // Создаем canvas для получения данных изображения
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = previewImg.naturalWidth;
            canvas.height = previewImg.naturalHeight;
            
            // Рисуем изображение на canvas
            ctx.drawImage(previewImg, 0, 0);
            
            // Получаем данные изображения в формате base64
            imageData = canvas.toDataURL('image/jpeg', 0.9);
        } else {
            alert('Ошибка при обработке изображения');
            return;
        }
        
        // Сохраняем изображение в localStorage
        saveImage({
            id: Date.now().toString(),
            category: category,
            title: title,
            description: description,
            data: imageData,
            date: new Date().toISOString()
        });
        
        // Очищаем форму и предпросмотр
        uploadForm.reset();
        imagePreview.innerHTML = '<div class="no-preview">Выберите изображение для предпросмотра</div>';
        
        // Обновляем галерею
        loadGalleryImages();
        
        // Показываем сообщение об успешной загрузке
        showSuccessMessage('Изображение успешно загружено!');
    });
}

// Настройка редактора изображений
function setupImageEditor() {
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    const cropImageBtn = document.getElementById('crop-image');
    const resetImageBtn = document.getElementById('reset-image');
    
    // Поворот влево
    rotateLeftBtn.addEventListener('click', function() {
        rotateImage(-90);
    });
    
    // Поворот вправо
    rotateRightBtn.addEventListener('click', function() {
        rotateImage(90);
    });
    
    // Обрезка изображения
    cropImageBtn.addEventListener('click', function() {
        // Простая реализация обрезки - обрезаем до квадрата по центру
        cropImage();
    });
    
    // Сброс изменений
    resetImageBtn.addEventListener('click', function() {
        resetImage();
    });
}

// Функция поворота изображения
function rotateImage(degrees) {
    const previewImg = document.getElementById('preview-img');
    if (!previewImg) return;
    
    // Создаем canvas для поворота изображения
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Определяем размеры с учетом поворота
    if (Math.abs(degrees) === 90 || Math.abs(degrees) === 270) {
        canvas.width = previewImg.naturalHeight;
        canvas.height = previewImg.naturalWidth;
    } else {
        canvas.width = previewImg.naturalWidth;
        canvas.height = previewImg.naturalHeight;
    }
    
    // Перемещаем центр canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Поворачиваем контекст
    ctx.rotate(degrees * Math.PI / 180);
    
    // Рисуем изображение с учетом поворота
    ctx.drawImage(
        previewImg,
        -previewImg.naturalWidth / 2,
        -previewImg.naturalHeight / 2
    );
    
    // Обновляем предпросмотр
    previewImg.src = canvas.toDataURL('image/jpeg');
}

// Функция обрезки изображения
function cropImage() {
    const previewImg = document.getElementById('preview-img');
    if (!previewImg) return;
    
    // Создаем canvas для обрезки изображения
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Определяем размер стороны квадрата (минимальная сторона изображения)
    const size = Math.min(previewImg.naturalWidth, previewImg.naturalHeight);
    
    // Устанавливаем размеры canvas
    canvas.width = size;
    canvas.height = size;
    
    // Вычисляем координаты для обрезки по центру
    const offsetX = (previewImg.naturalWidth - size) / 2;
    const offsetY = (previewImg.naturalHeight - size) / 2;
    
    // Рисуем обрезанное изображение
    ctx.drawImage(
        previewImg,
        offsetX, offsetY, // Начальные координаты исходного изображения
        size, size, // Размеры области исходного изображения
        0, 0, // Координаты на canvas
        size, size // Размеры на canvas
    );
    
    // Обновляем предпросмотр
    previewImg.src = canvas.toDataURL('image/jpeg');
}

// Функция сброса изображения
function resetImage() {
    const imagePreview = document.getElementById('image-preview');
    if (!window.originalImage) return;
    
    // Восстанавливаем оригинальное изображение
    imagePreview.innerHTML = `<img src="${window.originalImage}" id="preview-img" alt="Предпросмотр">`;
}

// Сохранение изображения в localStorage
function saveImage(imageData) {
    // Получаем текущие изображения
    let images = JSON.parse(localStorage.getItem('hotHairImages')) || [];
    
    // Добавляем новое изображение
    images.push(imageData);
    
    // Сохраняем обновленный список
    localStorage.setItem('hotHairImages', JSON.stringify(images));
}

// Загрузка изображений для галереи
function loadGalleryImages(category = 'all') {
    const imagesGrid = document.getElementById('images-grid');
    
    // Получаем сохраненные изображения
    let images = JSON.parse(localStorage.getItem('hotHairImages')) || [];
    
    // Фильтруем по категории, если указана
    if (category !== 'all') {
        images = images.filter(img => img.category === category);
    }
    
    // Если изображений нет
    if (images.length === 0) {
        imagesGrid.innerHTML = '<div class="no-images">Нет загруженных изображений</div>';
        return;
    }
    
    // Сортируем по дате (сначала новые)
    images.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Создаем HTML для каждого изображения
    imagesGrid.innerHTML = images.map(image => {
        return `
            <div class="image-item" data-id="${image.id}">
                <img src="${image.data}" alt="${image.title || 'Изображение'}">
                <div class="image-actions">
                    <button class="image-action view" title="Просмотр">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="image-action edit" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="image-action delete" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Добавляем обработчики событий для кнопок
    setupImageActions();
}

// Настройка фильтрации изображений
function setupFilterControls() {
    const filterCategory = document.getElementById('filter-category');
    
    filterCategory.addEventListener('change', function() {
        loadGalleryImages(this.value);
    });
}

// Настройка действий с изображениями (просмотр, редактирование, удаление)
function setupImageActions() {
    // Получаем все кнопки действий
    const viewButtons = document.querySelectorAll('.image-action.view');
    const editButtons = document.querySelectorAll('.image-action.edit');
    const deleteButtons = document.querySelectorAll('.image-action.delete');
    
    // Обработчики для просмотра
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const imageId = this.closest('.image-item').dataset.id;
            viewImage(imageId);
        });
    });
    
    // Обработчики для редактирования
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const imageId = this.closest('.image-item').dataset.id;
            editImage(imageId);
        });
    });
    
    // Обработчики для удаления
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const imageId = this.closest('.image-item').dataset.id;
            deleteImage(imageId);
        });
    });
}

// Функция просмотра изображения
function viewImage(imageId) {
    // Получаем изображение по ID
    const images = JSON.parse(localStorage.getItem('hotHairImages')) || [];
    const image = images.find(img => img.id === imageId);
    
    if (!image) return;
    
    // Создаем модальное окно для просмотра
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>${image.title || 'Изображение'}</h3>
            <div class="modal-image-container">
                <img src="${image.data}" alt="${image.title || 'Изображение'}">
            </div>
            <p class="image-description">${image.description || ''}</p>
            <p class="image-meta">Категория: ${getCategoryName(image.category)}</p>
            <p class="image-meta">Загружено: ${formatDate(image.date)}</p>
        </div>
    `;
    
    // Добавляем модальное окно на страницу
    document.body.appendChild(modal);
    
    // Предотвращаем прокрутку страницы
    document.body.style.overflow = 'hidden';
    
    // Обработчик для закрытия модального окна
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    });
    
    // Закрытие по клику вне содержимого
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }
    });
}

// Функция редактирования изображения
function editImage(imageId) {
    // Получаем изображение по ID
    const images = JSON.parse(localStorage.getItem('hotHairImages')) || [];
    const imageIndex = images.findIndex(img => img.id === imageId);
    
    if (imageIndex === -1) return;
    
    const image = images[imageIndex];
    
    // Заполняем форму данными изображения
    document.getElementById('image-category').value = image.category;
    document.getElementById('image-title').value = image.title || '';
    document.getElementById('image-description').value = image.description || '';
    
    // Отображаем изображение в предпросмотре
    const imagePreview = document.getElementById('image-preview');
    imagePreview.innerHTML = `<img src="${image.data}" id="preview-img" alt="Предпросмотр">`;
    
    // Сохраняем оригинальное изображение
    window.originalImage = image.data;
    
    // Сохраняем ID редактируемого изображения
    window.editingImageId = imageId;
    
    // Прокручиваем к форме
    document.getElementById('image-upload').scrollIntoView({ behavior: 'smooth' });
    
    // Изменяем текст кнопки отправки
    const submitButton = document.querySelector('#upload-form button[type="submit"]');
    submitButton.textContent = 'Обновить изображение';
    
    // Изменяем обработчик отправки формы
    const uploadForm = document.getElementById('upload-form');
    
    // Удаляем предыдущий обработчик
    const oldSubmitHandler = uploadForm.onsubmit;
    uploadForm.onsubmit = null;
    
    // Добавляем новый обработчик
    uploadForm.addEventListener('submit', function updateHandler(e) {
        e.preventDefault();
        
        // Получаем данные формы
        const category = document.getElementById('image-category').value;
        const title = document.getElementById('image-title').value || '';
        const description = document.getElementById('image-description').value || '';
        
        // Получаем отредактированное изображение
        const previewImg = document.getElementById('preview-img');
        let imageData = '';
        
        if (previewImg) {
            // Создаем canvas для получения данных изображения
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = previewImg.naturalWidth;
            canvas.height = previewImg.naturalHeight;
            
            // Рисуем изображение на canvas
            ctx.drawImage(previewImg, 0, 0);
            
            // Получаем данные изображения
            imageData = canvas.toDataURL('image/jpeg', 0.9);
        } else {
            alert('Ошибка при обработке изображения');
            return;
        }
        
        // Обновляем изображение
        images[imageIndex] = {
            ...images[imageIndex],
            category: category,
            title: title,
            description: description,
            data: imageData,
            date: new Date().toISOString()
        };
        
        // Сохраняем обновленный список
        localStorage.setItem('hotHairImages', JSON.stringify(images));
        
        // Очищаем форму и предпросмотр
        uploadForm.reset();
        imagePreview.innerHTML = '<div class="no-preview">Выберите изображение для предпросмотра</div>';
        
        // Возвращаем кнопку к исходному состоянию
        submitButton.textContent = 'Загрузить изображение';
        
        // Удаляем временные данные
        delete window.editingImageId;
        
        // Удаляем этот обработчик
        uploadForm.removeEventListener('submit', updateHandler);
        
        // Восстанавливаем исходный обработчик
        uploadForm.onsubmit = oldSubmitHandler;
        
        // Обновляем галерею
        loadGalleryImages();
        
        // Показываем сообщение об успешном обновлении
        showSuccessMessage('Изображение успешно обновлено!');
    }, { once: true });
}

// Функция удаления изображения
function deleteImage(imageId) {
    if (!confirm('Вы уверены, что хотите удалить это изображение?')) return;
    
    // Получаем текущие изображения
    let images = JSON.parse(localStorage.getItem('hotHairImages')) || [];
    
    // Удаляем изображение по ID
    images = images.filter(img => img.id !== imageId);
    
    // Сохраняем обновленный список
    localStorage.setItem('hotHairImages', JSON.stringify(images));
    
    // Обновляем галерею
    loadGalleryImages();
    
    // Показываем сообщение об успешном удалении
    showSuccessMessage('Изображение успешно удалено!');
}

// Вспомогательная функция для отображения названия категории
function getCategoryName(categoryKey) {
    const categories = {
        'gallery': 'Галерея',
        'before-after': 'До/После',
        'stylist': 'Стилист',
        'background': 'Фон'
    };
    
    return categories[categoryKey] || categoryKey;
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Показ сообщения об успешном действии
function showSuccessMessage(message) {
    // Создаем элемент сообщения
    const messageElement = document.createElement('div');
    messageElement.className = 'success-message';
    messageElement.innerHTML = `
        <div class="success-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <p>${message}</p>
    `;
    
    // Добавляем на страницу
    document.body.appendChild(messageElement);
    
    // Анимируем появление
    setTimeout(() => {
        messageElement.classList.add('show');
    }, 10);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 3000);
}

// Добавляем стили для модального окна и сообщений
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        
        .modal-content {
            background-color: var(--card-bg);
            border-radius: var(--border-radius);
            border: var(--card-border);
            box-shadow: var(--card-shadow);
            padding: 30px;
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
            position: relative;
        }
        
        .close-modal {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-color);
        }
        
        .close-modal:hover {
            color: var(--accent-color);
        }
        
        .modal-image-container {
            margin: 20px 0;
            text-align: center;
        }
        
        .modal-image-container img {
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
        }
        
        .image-description {
            margin-bottom: 15px;
            color: var(--text-color);
        }
        
        .image-meta {
            font-size: 0.9rem;
            color: var(--text-dark);
            margin-bottom: 5px;
        }
        
        .success-message {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background-color: var(--card-bg);
            border-radius: var(--border-radius);
            border: var(--card-border);
            box-shadow: var(--card-shadow);
            padding: 20px;
            display: flex;
            align-items: center;
            transform: translateY(100px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            z-index: 1500;
        }
        
        .success-message.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .success-icon {
            font-size: 24px;
            color: #4CAF50;
            margin-right: 15px;
        }
        
        .success-message p {
            margin: 0;
            color: var(--text-color);
        }
        
        @media (max-width: 768px) {
            .modal-content {
                padding: 20px;
                max-width: 95%;
            }
            
            .success-message {
                bottom: 20px;
                right: 20px;
                left: 20px;
                width: auto;
            }
        }
    `;
    document.head.appendChild(style);
});
