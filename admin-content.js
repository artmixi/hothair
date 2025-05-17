// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация функций
    setupTabs();
    setupImageUpload();
    setupImageEditor();
    loadImages();
    setupServicesManagement();
});

// Настройка вкладок
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Удаляем активный класс у всех кнопок
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Получаем ID вкладки
            const tabId = this.dataset.tab;
            
            // Скрываем все вкладки
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Показываем выбранную вкладку
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
}

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
        loadImages();
        
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
