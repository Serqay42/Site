// --- Scroll Reveal с использованием Intersection Observer API ---

let revealObserver = null;

// Настройка наблюдателя
function initScrollReveal() {
  const options = {
    root: null, // Использовать вьюпорт браузера
    rootMargin: '0px 0px -100px 0px', // Начинать анимацию чуть раньше, чем элемент достигнет низа экрана
    threshold: 0.05 // Срабатывать, когда видно хотя бы 5% элемента
  };

  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Добавляем класс revealed для запуска CSS перехода
        entry.target.classList.add('revealed');
        
        // Прекращаем наблюдение за этим элементом, так как анимация одноразовая
        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Находим все статические элементы с классами раскрытия
  observeNewElements();
}

// Функция для подписки новых элементов (полезно при динамической генерации карточек)
function observeNewElements() {
  if (!revealObserver) return;

  const elementsToReveal = document.querySelectorAll(
    '.reveal-up:not(.revealed), .reveal-left:not(.revealed), .reveal-right:not(.revealed), .reveal-scale:not(.revealed)'
  );

  elementsToReveal.forEach(el => {
    revealObserver.observe(el);
  });
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  // Немного задержим инициализацию, чтобы стили успели примениться корректно
  setTimeout(initScrollReveal, 100);
});

// Экспортируем глобально
window.scrollReveal = {
  observeNewElements
};
