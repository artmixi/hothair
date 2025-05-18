// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Анимация логотипа с GSAP
    animateLogo();
    
    // Плавная прокрутка для навигации
    setupSmoothScroll();
    
    // Анимация карточек услуг при прокрутке
    animateOnScroll('.service-card');
    
    // Анимация галереи при прокрутке
    animateOnScroll('.gallery-item');
    
    // Обработка формы
    setupForm();
    
    // Добавляем анимацию для элементов при прокрутке
    setupScrollAnimations();
    
    // Добавляем эффекты при наведении для кнопок
    setupHoverEffects();
    
    // Настройка плавного исчезновения шапки при прокрутке
    setupHeaderFade();
});

// Анимация логотипа
function animateLogo() {
    // Анимация логотипа с GSAP
    gsap.to('.logo-accent', {
        scale: 1.2,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    });
    
    // Анимация линии логотипа
    gsap.fromTo('.logo-design', 
        { strokeDashoffset: 100 },
        { 
            strokeDashoffset: 0, 
            duration: 3,
            repeat: -1,
            ease: "power2.inOut"
        }
    );
}

// Настройка плавной прокрутки
function setupSmoothScroll() {
    // Получаем все ссылки навигации
    const navLinks = document.querySelectorAll('nav a, .footer-links a, a.btn');
    
    // Добавляем обработчик события для каждой ссылки
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Проверяем, что ссылка ведет на якорь на этой же странице
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Плавная прокрутка к элементу
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Учитываем высоту шапки
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Анимация элементов при прокрутке
function animateOnScroll(selector) {
    const elements = document.querySelectorAll(selector);
    
    // Создаем наблюдатель за пересечением
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Если элемент виден, добавляем класс для анимации
                entry.target.classList.add('animate');
                // Прекращаем наблюдение за этим элементом
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Элемент считается видимым, когда 10% его видно
    });
    
    // Начинаем наблюдение за всеми элементами
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Настройка формы
function setupForm() {
    const form = document.getElementById('appointment-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Получаем данные формы
            const formData = new FormData(form);
            const formObject = {};
            
            // Преобразуем FormData в объект
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Отправляем данные на email через Email.js
            // Для реальной отправки нужно зарегистрироваться на emailjs.com
            // и настроить шаблон письма
            sendEmail(formObject);
            
            // Показываем сообщение об успешной отправке
            showSuccessMessage(form);
        });
    }
}

// Отправка данных формы на email
function sendEmail(data) {
    // В реальном проекте здесь должен быть код для отправки данных на сервер
    // Например, с использованием EmailJS или другого сервиса
    
    console.log('Данные для отправки:', data);
    
    // Пример использования EmailJS (требуется подключение библиотеки)
    // emailjs.send('service_id', 'template_id', data, 'user_id')
    //     .then(function(response) {
    //         console.log('Успешно отправлено!', response.status, response.text);
    //     }, function(error) {
    //         console.log('Ошибка отправки:', error);
    //     });
    
    // Для демонстрации можно использовать локальное хранилище
    // чтобы сохранить данные записи
    saveAppointmentToLocalStorage(data);
}

// Сохранение данных записи в localStorage
function saveAppointmentToLocalStorage(data) {
    // Получаем существующие записи или создаем новый массив
    let appointments = JSON.parse(localStorage.getItem('hotHairAppointments')) || [];
    
    // Добавляем новую запись с датой создания
    data.createdAt = new Date().toISOString();
    appointments.push(data);
    
    // Сохраняем обновленный массив записей
    localStorage.setItem('hotHairAppointments', JSON.stringify(appointments));
    
    console.log('Запись сохранена в localStorage');
}

// Показываем сообщение об успешной отправке формы
function showSuccessMessage(form) {
    // Скрываем форму
    form.style.opacity = '0';
    
    // Создаем элемент сообщения
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <div class="success-icon">✓</div>
        <h3>Спасибо за вашу заявку!</h3>
        <p>Мы свяжемся с вами в ближайшее время для подтверждения записи.</p>
        <p>Вы также можете связаться с нами напрямую через Telegram или WhatsApp.</p>
    `;
    
    // Вставляем сообщение после формы
    form.parentNode.insertBefore(successMessage, form.nextSibling);
    
    // Анимируем появление сообщения
    gsap.fromTo(successMessage, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
    );
    
    // Через 5 секунд возвращаем форму
    setTimeout(() => {
        // Сбрасываем форму
        form.reset();
        
        // Анимируем исчезновение сообщения
        gsap.to(successMessage, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                // Удаляем сообщение
                successMessage.remove();
                // Показываем форму снова
                form.style.opacity = '1';
            }
        });
    }, 5000);
}

// Настройка анимаций при прокрутке
function setupScrollAnimations() {
    // Добавляем класс fade-in для всех элементов, которые нужно анимировать
    const elementsToAnimate = document.querySelectorAll('h2, .contact-item, .contact-social, .stylist-card');
    
    elementsToAnimate.forEach(element => {
        element.classList.add('fade-in');
    });
    
    // Создаем наблюдатель за пересечением
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Если элемент виден, добавляем класс для анимации
                entry.target.classList.add('visible');
                // Прекращаем наблюдение за этим элементом
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Элемент считается видимым, когда 10% его видно
    });
    
    // Начинаем наблюдение за всеми элементами
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// Настройка эффектов при наведении
function setupHoverEffects() {
    // Добавляем эффект свечения для социальных кнопок
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            gsap.to(this, {
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.4), 0 0 15px ' + getComputedStyle(this).backgroundColor,
                duration: 0.3
            });
        });
        
        button.addEventListener('mouseleave', function() {
            gsap.to(this, {
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                duration: 0.3
            });
        });
    });
}

// Настройка плавного исчезновения шапки при прокрутке
function setupHeaderFade() {
    const header = document.getElementById('siteHeader');
    let lastScrollTop = 0;
    let ticking = false;
    
    // Начальное состояние шапки
    header.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (!ticking) {
            window.requestAnimationFrame(function() {
                // Если прокрутка больше 100px и направление вниз
                if (scrollTop > 100 && scrollTop > lastScrollTop) {
                    // Плавно скрываем шапку
                    header.style.opacity = '0';
                    header.style.transform = 'translateY(-100%)';
                } else {
                    // Плавно показываем шапку
                    header.style.opacity = '1';
                    header.style.transform = 'translateY(0)';
                }
                
                lastScrollTop = scrollTop;
                ticking = false;
            });
            
            ticking = true;
        }
    });
}

// Добавляем стили для анимации при прокрутке
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .service-card, .gallery-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .service-card.animate, .gallery-item.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .success-message {
            background-color: var(--card-bg);
            border-radius: var(--border-radius);
            padding: 30px;
            text-align: center;
            border: var(--card-border);
            box-shadow: var(--card-shadow);
        }
        
        .success-icon {
            font-size: 3rem;
            color: var(--secondary-color);
            margin-bottom: 20px;
        }
    `;
    document.head.appendChild(style);
});