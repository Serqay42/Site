// --- Интерактивный Саунд-Дизайн на Web Audio API ---

let audioCtx = null;
let isMuted = localStorage.getItem('site_sound_muted') === 'true';

// Инициализация аудио-контекста при первом взаимодействии пользователя
function initAudioContext() {
  if (audioCtx) return;
  
  // Создаем аудиоконтекст (поддерживает современные браузеры)
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (AudioContextClass) {
    audioCtx = new AudioContextClass();
  }
}

// Воспроизведение звука с помощью переданного генератора
function playSound(generatorFn) {
  if (isMuted) return;
  
  initAudioContext();
  if (!audioCtx) return;
  
  // Разрешаем воспроизведение, если контекст был приостановлен политикой автоплея
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  try {
    generatorFn(audioCtx);
  } catch (error) {
    console.warn('Ошибка воспроизведения звука:', error);
  }
}

// --- Синтезаторы звуков ---

// 1. Короткий щелчок (hover tick) при наведении на элементы
function playHoverTick() {
  playSound((ctx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    
    // Частотный свип (от высокой к более низкой) за доли секунды
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.015);
    
    // Быстрый спад громкости (экспоненциальный fade-out)
    gainNode.gain.setValueAtTime(0.02, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.02);
  });
}

// 2. Футуристический клик при нажатии на кнопки
function playBtnClick() {
  playSound((ctx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Используем треугольную волну для более мягкого, округлого звука
    osc.type = 'triangle';
    
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
    
    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.06);
  });
}

// 3. Восходящий плавный звук при открытии модального окна (Swoop Up)
function playModalOpen() {
  playSound((ctx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sine';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    
    const now = ctx.currentTime;
    const duration = 0.22;
    
    // Частота плавно поднимается
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + duration);
    
    // Громкость плавно нарастает и затухает (колоколообразная форма)
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.05, now + 0.06);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + duration + 0.02);
  });
}

// 4. Нисходящий плавный звук при закрытии модального окна (Swoop Down)
function playModalClose() {
  playSound((ctx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sine';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    
    const now = ctx.currentTime;
    const duration = 0.18;
    
    // Частота плавно падает
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + duration);
    
    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + duration + 0.02);
  });
}

// 5. Мажорное цифровое арпеджио при успешном действии (покупка)
function playActionSuccess() {
  playSound((ctx) => {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // Ноты: До5, Ми5, Соль5, До6 (C-E-G-C)
    const noteDuration = 0.08;
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);
      
      const noteStart = now + index * 0.06;
      
      gainNode.gain.setValueAtTime(0.001, noteStart);
      gainNode.gain.linearRampToValueAtTime(0.04, noteStart + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDuration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(noteStart);
      osc.stop(noteStart + noteDuration + 0.01);
    });
  });
}

// --- Обработка событий и делегирование ---

let lastHoveredElement = null;

document.addEventListener('mouseover', (e) => {
  // Находим ближайший интерактивный элемент
  const target = e.target.closest('a, button, .product-card, .portfolio-item, .editor-toggle-btn, .social-btn, .modal-close-btn');
  if (target && target !== lastHoveredElement) {
    lastHoveredElement = target;
    playHoverTick();
  }
});

document.addEventListener('mouseout', (e) => {
  const target = e.target.closest('a, button, .product-card, .portfolio-item, .editor-toggle-btn, .social-btn, .modal-close-btn');
  if (target && !target.contains(e.relatedTarget)) {
    if (lastHoveredElement === target) {
      lastHoveredElement = null;
    }
  }
});

// Клик по интерактивным элементам (за исключением тех, у которых есть особые звуки)
document.addEventListener('click', (e) => {
  // При первом же клике инициализируем звук
  initAudioContext();
  
  const target = e.target.closest('a, button, .portfolio-item, .editor-toggle-btn, .social-btn, .modal-close-btn');
  if (target) {
    // Игнорируем кнопки покупки "Купить" (для них играет playActionSuccess)
    if (target.classList.contains('btn-buy-now') || target.id === 'modal-btn-buy') {
      return;
    }
    // Игнорируем сам переключатель звука, чтобы он не перебивал состояние переключения
    if (target.id === 'sound-toggle-btn') {
      return;
    }
    
    playBtnClick();
  }
});

// --- Переключатель звука Mute/Unmute ---

function updateSoundToggleButtonUI() {
  const btn = document.getElementById('sound-toggle-btn');
  if (!btn) return;
  
  if (isMuted) {
    btn.classList.add('sound-muted');
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <path d="M9 9v6a3 3 0 0 0 3 3h1.586l4.707 4.707A1 1 0 0 0 20 22V4a1 1 0 0 0-1.707-.707L13.586 8H12a3 3 0 0 0-3 3z"></path>
      </svg>
    `;
  } else {
    btn.classList.remove('sound-muted');
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
    `;
  }
}

function toggleSound() {
  initAudioContext();
  isMuted = !isMuted;
  localStorage.setItem('site_sound_muted', isMuted);
  updateSoundToggleButtonUI();
  
  // Если звук включили, воспроизведем приветственный клик
  if (!isMuted) {
    playBtnClick();
  }
}

// Запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('header nav');
  if (nav) {
    // Вставляем кнопку переключателя в навигацию
    const soundBtn = document.createElement('button');
    soundBtn.id = 'sound-toggle-btn';
    soundBtn.className = 'sound-btn';
    soundBtn.setAttribute('aria-label', 'Включить/выключить звук');
    
    nav.appendChild(soundBtn);
    
    // Привязываем событие клика
    soundBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSound();
    });
    
    updateSoundToggleButtonUI();
  }
});

// Экспортируем глобально для использования в app.js
window.soundDesign = {
  playHoverTick,
  playBtnClick,
  playModalOpen,
  playModalClose,
  playActionSuccess,
  toggleSound
};
