// --- Конфигурация владельца сайта (будет перезаписываться из config.json) ---
let OWNER_CONFIG = {
  name: 'SERQAY',
  telegramUsername: 'serqay',
  artstation: 'https://artstation.com',
  sketchfab: 'https://sketchfab.com'
};

// --- Глобальное состояние ---
let config = {};
let products = [];
let portfolio = [];
let currentProduct = null;
let currentImageIndex = 0;
let isEditorMode = false;
let editingProductId = null;

// --- Инициализация при загрузке страницы ---
function runInitApp() {
  loadConfig().then(() => {
    loadProducts();
    loadPortfolio();
  });
  setupEventListeners();
  setupPortfolioLightbox();
  initCardTilt();
  initEditor();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInitApp);
} else {
  runInitApp();
}

// --- Загрузка config.json ---
async function loadConfig() {
  try {
    const response = await fetch('data/config.json');
    if (!response.ok) throw new Error('Ошибка загрузки config.json');
    config = await response.json();
  } catch (error) {
    console.warn('Не удалось загрузить config.json. Используем резервную конфигурацию.');
    // Резервная конфигурация на случай file:/// или отсутствия файла
    config = {
      "owner": {
        "name": "SERQAY",
        "telegram": "serqay",
        "artstation": "",
        "sketchfab": "https://sketchfab.com"
      },
      "hero": {
        "tagline": "3D Artist & Designer",
        "title": "Делаю качественный 3D-арт, модели и рендеры под заказ",
        "description": "Привет, я Serqay! Занимаюсь 3D-моделированием, созданием крутых рендеров и скинов. Могу замоделить персонажа, пропсы для твоей игры или сделать сочный арт. Заглядывай в каталог или пиши напрямую в Telegram, обсудим твою идею.",
        "avatar": "RenderСSerqay.png"
      },
      "catalog": {
        "subtitle": "Что я умею делать",
        "title": "Мои услуги и прайс"
      },
      "contact": {
        "title": "Связаться со мной",
        "subtitle": "Обсудим твой заказ?",
        "description": "Нужна качественная модель, красивый рендер или уникальный скин? Или у тебя есть крутая задумка и нужен 3D-художник? Пиши в Telegram, обсудим детали, сроки и цену. Отвечаю быстро!"
      }
    };
  }

  // Применяем конфигурацию к OWNER_CONFIG
  OWNER_CONFIG.name = config.owner.name;
  OWNER_CONFIG.telegramUsername = config.owner.telegram;
  OWNER_CONFIG.artstation = config.owner.artstation;
  OWNER_CONFIG.sketchfab = config.owner.sketchfab;

  applyConfigToDOM();
}

// --- Применение конфигурации к DOM элементам ---
function applyConfigToDOM() {
  if (!config) return;

  // Навигация
  const logo = document.getElementById('logo-text');
  if (logo) logo.textContent = config.owner.name;

  // Hero
  const tagline = document.getElementById('hero-tagline');
  if (tagline) tagline.textContent = config.hero.tagline;

  const title = document.getElementById('hero-title');
  if (title) title.textContent = config.hero.title;

  const desc = document.getElementById('hero-desc');
  if (desc) desc.textContent = config.hero.description;

  const avatar = document.getElementById('hero-avatar');
  if (avatar) avatar.src = config.hero.avatar;

  // Catalog
  const catSubtitle = document.getElementById('catalog-subtitle');
  if (catSubtitle) catSubtitle.textContent = config.catalog.subtitle;

  const catTitle = document.getElementById('catalog-title');
  if (catTitle) catTitle.textContent = config.catalog.title;

  // Contact
  const conTitle = document.getElementById('contact-title');
  if (conTitle) conTitle.textContent = config.contact.title;

  const conSubtitle = document.getElementById('contact-subtitle');
  if (conSubtitle) conSubtitle.textContent = config.contact.subtitle;

  const conDesc = document.getElementById('contact-desc');
  if (conDesc) conDesc.textContent = config.contact.description;

  // Ссылки
  const tgLink = document.getElementById('contact-telegram-link');
  if (tgLink) tgLink.href = `https://t.me/${config.owner.telegram}`;

  const asLink = document.getElementById('contact-artstation-link');
  if (asLink) {
    if (config.owner.artstation) {
      asLink.href = config.owner.artstation;
      asLink.style.display = 'inline-flex';
    } else {
      asLink.style.display = 'none';
    }
  }

  const sfLink = document.getElementById('contact-sketchfab-link');
  if (sfLink) {
    if (config.owner.sketchfab) {
      sfLink.href = config.owner.sketchfab;
      sfLink.style.display = 'inline-flex';
    } else {
      sfLink.style.display = 'none';
    }
  }

  // Подвал
  const footerCopy = document.getElementById('footer-copy-text');
  if (footerCopy) footerCopy.innerHTML = `&copy; 2026 ${config.owner.name}. Все права защищены.`;
}

// --- Загрузка товаров (с обработкой CORS при локальном открытии) ---
async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Ошибка загрузки JSON');
    products = await response.json();
  } catch (error) {
    console.warn('Не удалось загрузить products.json через fetch (возможно, локальный запуск). Используем резервные данные.');
    products = [
      {
        "id": "custom-model",
        "title": "Создание 3D-модели",
        "category": "3d-model",
        "price": "500 - 1000 ₽",
        "thumbnail": "ModelDummy.png",
        "images": [
          "ModelDummy.png"
        ],
        "modelUrl": "",
        "description": "Замоделю что угодно по твоим чертежам, концептам или референсам: от игровых пропсов до персонажей и элементов окружения. Сделаю правильную сетку, развертку и качественные PBR-текстуры (до 4K). Формат на выходе — какой скажешь.",
        "specs": {
          "polygons": "По запросу",
          "vertices": "По запросу",
          "formats": "FBX, OBJ, BLEND, GLTF",
          "textures": "Да (до 4K PBR)",
          "rigged": "По запросу",
          "animated": "По запросу"
        }
      },
      {
        "id": "custom-render",
        "title": "Художественный Рендер",
        "category": "render",
        "price": "450 ₽",
        "thumbnail": "RenderСSerqay.png",
        "images": [
          "RenderСSerqay.png"
        ],
        "modelUrl": "",
        "description": "Сделаю красивую и атмосферную визуализацию твоей сцены или модели. Поставлю свет, настрою материалы, наложу эффекты и сделаю постобработка. На выходе получишь сочную картинку в высоком разрешении (до 4K) для портфолио, соцсетей или презентации.",
        "specs": {
          "resolution": "3840x2160 (4K)",
          "renderer": "Cycles / Eevee",
          "formats": "PNG, JPEG, PSD",
          "ratio": "16:9",
          "dpi": "300"
        }
      },
      {
        "id": "custom-skin",
        "title": "Кастомный Скин",
        "category": "skin",
        "price": "300 ₽",
        "thumbnail": "skinDummy.png",
        "images": [
          "skinDummy.png"
        ],
        "modelUrl": "",
        "description": "Нарисую уникальный скин для Minecraft по твоему описанию или референсам. Детально прорисую тени, градиенты, одежду и аксессуары, чтобы твой персонаж выделялся в игре. Поддерживаю форматы 64x64 и HD.",
        "specs": {
          "resolution": "64x64 / HD",
          "formats": "PNG",
          "ratio": "1:1",
          "type": "Steve / Alex"
        }
      }
    ];
  }

  renderProducts(products);
}

// --- Отрисовка карточек товаров ---
function renderProducts(items) {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem;">Товары не найдены</div>`;
    return;
  }

  items.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card reveal-up';
    card.setAttribute('data-id', product.id);

    if (product.category === 'skin') {
      card.classList.add('minecraft-card');
    }

    let tagClass = 'tag-render';
    let tagText = 'Рендер';
    if (product.category === '3d-model') {
      tagClass = 'tag-model';
      tagText = '3D Модель';
    } else if (product.category === 'skin') {
      tagClass = 'tag-skin';
      tagText = 'Скин';
    }

    // Формируем блок изображения с красивой CSS заглушкой на случай ошибки загрузки
    const imageHTML = product.thumbnail
      ? `<img src="${product.thumbnail}" class="product-card-img" alt="${product.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
      : '';

    // Генерируем характеристики (ТТХ) для показа при наведении
    let specsHTML = `<div class="product-card-specs">`;
    for (const [key, value] of Object.entries(product.specs)) {
      const labelRus = translateSpecKey(key);
      specsHTML += `
        <div class="product-card-spec-item">
          <span class="card-spec-label">${labelRus}:</span>
          <span class="card-spec-value">${value}</span>
        </div>
      `;
    }
    specsHTML += `</div>`;

    card.innerHTML = `
      <!-- Кнопки управления карточкой в режиме редактора -->
      <div class="product-card-edit-controls">
        <button class="btn-card-control btn-card-edit-props" title="Редактировать свойства" onclick="event.stopPropagation(); openEditProductModal('${product.id}');">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button class="btn-card-control btn-card-delete" title="Удалить" onclick="event.stopPropagation(); deleteProduct('${product.id}');">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>

      <div class="product-image-container" style="cursor: pointer;">
        <span class="product-tag ${tagClass}">${tagText}</span>
        ${imageHTML}
        <div class="product-image-fallback" style="${product.thumbnail ? 'display:none;' : 'display:flex;'}">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>ИЗОБРАЖЕНИЕ</span>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-card-title" ${isEditorMode ? 'contenteditable="true"' : ''}>${product.title}</h3>
        <div class="product-footer">
          <div class="product-price" ${isEditorMode ? 'contenteditable="true"' : ''}>
            ${product.price}
          </div>
          <button class="btn btn-primary btn-card btn-buy-now">Купить</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  if (isEditorMode) {
    document.querySelectorAll('.product-card').forEach(card => {
      card.style.transform = 'none';
      card.style.pointerEvents = 'auto';
    });
  }

  // Обновляем список отслеживаемых элементов для scroll-reveal
  if (window.scrollReveal) {
    window.scrollReveal.observeNewElements();
  }
}

// --- Настройка обработчиков событий ---
function setupEventListeners() {

  // Открытие модального окна товара по клику на картинку
  const grid = document.getElementById('products-grid');
  grid.addEventListener('click', (e) => {
    if (isEditorMode) return; // Отключаем в режиме редактирования

    const imgContainer = e.target.closest('.product-image-container');
    const card = e.target.closest('.product-card');

    if (imgContainer && card) {
      const productId = card.getAttribute('data-id');
      const product = products.find(p => p.id === productId);
      if (product) openProductModal(product);
    }
  });

  // Кнопка покупки "Купить" на карточке товара
  grid.addEventListener('click', (e) => {
    const buyBtn = e.target.closest('.btn-buy-now');
    if (buyBtn) {
      e.stopPropagation(); // Предотвращаем открытие модалки
      const card = buyBtn.closest('.product-card');
      if (card) {
        const productId = card.getAttribute('data-id');
        const product = products.find(p => p.id === productId);
        if (product) {
          if (window.soundDesign) window.soundDesign.playActionSuccess();
          const messageText = encodeURIComponent(`Привет! Хочу купить "${product.title}" за ${product.price}.`);
          window.open(`https://t.me/${OWNER_CONFIG.telegramUsername}?text=${messageText}`, '_blank');
        }
      }
    }
  });

  // Закрытие модалок
  const closeBtns = document.querySelectorAll('.modal-close-btn, .modal-overlay, #github-settings-close, #edit-product-close');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) {
        if (modal.classList.contains('active')) {
          modal.classList.remove('active');
          if (window.soundDesign) window.soundDesign.playModalClose();
        }
      }
    });
  });

  // Стрелки слайдера галереи
  document.getElementById('gallery-prev').addEventListener('click', () => navigateGallery(-1));
  document.getElementById('gallery-next').addEventListener('click', () => navigateGallery(1));

  // Кнопка покупки в модалке товара - перенаправляет сразу в Telegram
  document.getElementById('modal-btn-buy').addEventListener('click', () => {
    if (currentProduct) {
      if (window.soundDesign) window.soundDesign.playActionSuccess();
      const messageText = encodeURIComponent(`Привет! Хочу купить "${currentProduct.title}" за ${currentProduct.price}.`);
      window.open(`https://t.me/${OWNER_CONFIG.telegramUsername}?text=${messageText}`, '_blank');
    }
  });

  // Клик по логотипу для перемещения вниз и вызова аниме-девочки
  const logoText = document.getElementById('logo-text');
  const animeContainer = document.getElementById('anime-girl-container');
  const animeImg = document.getElementById('anime-girl-img');

  if (logoText && animeContainer) {
    logoText.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Плавно скроллим в самый низ сайта
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });

      // Прячем логотип
      logoText.classList.add('logo-hidden');

      // Показываем контейнер аниме-девочки
      animeContainer.classList.add('active');

      // Воспроизводим аниме смех
      if (window.soundDesign && window.soundDesign.playAnimeLaughter) {
        window.soundDesign.playAnimeLaughter();
      }

      // Добавим легкий всплеск на аватарку
      animeContainer.style.animation = 'none';
      setTimeout(() => {
        animeContainer.style.animation = 'avatarBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both';
      }, 10);
    });

    // Обработка долгого тапа
    let pressTimer = null;
    let isLongPress = false;
    let isRewardState = false;

    const startPress = (e) => {
      // Игнорируем правый клик
      if (e.type === 'mousedown' && e.button !== 0) return;
      
      isLongPress = false;
      animeContainer.classList.add('pressing');

      pressTimer = setTimeout(() => {
        isLongPress = true;
        animeContainer.classList.remove('pressing');
        
        // Меняем изображение на reward
        isRewardState = !isRewardState;
        animeImg.src = isRewardState ? 'Girl/reward.png' : 'Girl/base.png';
        
        // Звуковой эффект успеха
        if (window.soundDesign && window.soundDesign.playActionSuccess) {
          window.soundDesign.playActionSuccess();
        }

        // Взрывной визуальный эффект
        animeContainer.animate([
          { transform: 'translateY(-50%) scale(1)', boxShadow: '0 0 15px rgba(191, 90, 242, 0.3)' },
          { transform: 'translateY(-50%) scale(1.3)', boxShadow: '0 0 40px rgba(191, 90, 242, 1)' },
          { transform: 'translateY(-50%) scale(1)', boxShadow: '0 0 15px rgba(191, 90, 242, 0.3)' }
        ], {
          duration: 500,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
        });
      }, 700); // 700ms для долгого тапа
    };

    const cancelPress = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
      animeContainer.classList.remove('pressing');
    };

    const clickOrRelease = (e) => {
      cancelPress();
      // Если это был короткий клик, и мы в состоянии reward, возвращаем base
      if (!isLongPress && e.type !== 'mouseleave') {
        if (isRewardState) {
          isRewardState = false;
          animeImg.src = 'Girl/base.png';
          if (window.soundDesign && window.soundDesign.playBtnClick) {
            window.soundDesign.playBtnClick();
          }
        } else {
          // Если кликнули по базовой, сделаем смешной прыжок и посмеемся
          if (window.soundDesign && window.soundDesign.playAnimeLaughter) {
            window.soundDesign.playAnimeLaughter();
          }
          animeContainer.animate([
            { transform: 'translateY(-50%) scale(1) rotate(0deg)' },
            { transform: 'translateY(-65%) scale(1.1) rotate(-15deg)' },
            { transform: 'translateY(-50%) scale(1) rotate(0deg)' }
          ], {
            duration: 400,
            easing: 'ease-out'
          });
        }
      }
    };

    // Слушатели событий мыши
    animeContainer.addEventListener('mousedown', startPress);
    animeContainer.addEventListener('mouseup', clickOrRelease);
    animeContainer.addEventListener('mouseleave', cancelPress);

    // Слушатели сенсорных событий
    animeContainer.addEventListener('touchstart', (e) => {
      startPress(e);
    }, { passive: true });
    animeContainer.addEventListener('touchend', (e) => {
      clickOrRelease(e);
    }, { passive: true });
    animeContainer.addEventListener('touchcancel', cancelPress);
  }
}

// --- Открытие модального окна деталей товара ---
function openProductModal(product) {
  currentProduct = product;
  currentImageIndex = 0;

  const modal = document.getElementById('product-details-modal');

  // Проверяем категорию для подключения Minecraft темы
  if (product.category === 'skin') {
    modal.classList.add('theme-minecraft');
  } else {
    modal.classList.remove('theme-minecraft');
  }

  // Текстовые поля
  document.getElementById('modal-title').textContent = product.title;
  document.getElementById('modal-price').innerHTML = product.price.toLowerCase() === 'free' ? '<span>FREE</span>' : product.price;
  document.getElementById('modal-desc').textContent = product.description;
  document.getElementById('modal-app-icon').src = encodeURI(product.thumbnail);

  let categoryText = 'Рендер';
  if (product.category === '3d-model') {
    categoryText = '3D Модель';
  } else if (product.category === 'skin') {
    categoryText = 'Скин';
  }
  document.getElementById('modal-app-category').textContent = categoryText;

  // Генерация технических характеристик (ТТХ)
  const specsContainer = document.getElementById('modal-specs-grid');
  specsContainer.innerHTML = '';
  for (const [key, value] of Object.entries(product.specs)) {
    const labelRus = translateSpecKey(key);
    specsContainer.innerHTML += `
      <div class="spec-item">
        <span class="spec-label">${labelRus}</span>
        <span class="spec-value">${value}</span>
      </div>
    `;
  }

  // Инициализация галереи
  updateGalleryImage();

  // Отображаем модалку
  modal.classList.add('active');
  if (window.soundDesign) window.soundDesign.playModalOpen();
}

// --- Обновление картинки в галерее ---
function updateGalleryImage() {
  const imgElement = document.getElementById('modal-gallery-img');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');

  if (currentProduct && currentProduct.images && currentProduct.images.length > 0) {
    imgElement.src = encodeURI(currentProduct.images[currentImageIndex]);
    imgElement.style.display = 'block';

    // Показываем/скрываем стрелки навигации
    if (currentProduct.images.length > 1) {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    } else {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  } else {
    imgElement.style.display = 'none';
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }
}

// --- Навигация по галерее ---
function navigateGallery(direction) {
  if (!currentProduct || !currentProduct.images) return;

  currentImageIndex += direction;

  if (currentImageIndex < 0) {
    currentImageIndex = currentProduct.images.length - 1;
  } else if (currentImageIndex >= currentProduct.images.length) {
    currentImageIndex = 0;
  }

  updateGalleryImage();
}

// --- Перевод ТТХ ключей ---
function translateSpecKey(key) {
  const dict = {
    polygons: 'Полигоны',
    vertices: 'Вершины',
    formats: 'Форматы',
    textures: 'Текстуры',
    rigged: 'Скелет (Rig)',
    animated: 'Анимация',
    resolution: 'Разрешение',
    renderer: 'Рендерер',
    ratio: 'Формат сторон',
    dpi: 'Плотность (DPI)',
    type: 'Тип'
  };
  return dict[key] || key;
}

// --- Инициализация 3D наклона карточек при наведении ---
function initCardTilt() {
  document.addEventListener('mousemove', (e) => {
    if (isEditorMode) return; // Отключаем 3D наклон в режиме редактирования для удобства выделения текста

    const card = e.target.closest('.product-card, .portfolio-item, .contact-info');
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 15; // Увеличен угол до 15 градусов
    const rotateY = ((x - centerX) / centerX) * 15;

    // Быстрый и плавный наклон при движении мыши
    card.style.transition = 'transform 0.08s ease-out';
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
  });

  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.product-card, .portfolio-item, .contact-info');
    if (!card) return;
    
    // Сбрасываем только если курсор действительно покинул карточку
    if (!e.relatedTarget || !card.contains(e.relatedTarget)) {
      // Упругий отскок (back ease out) при возврате в исходное состояние
      card.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  });
}

// --- ИНИЦИАЛИЗАЦИЯ И ЛОГИКА РЕДАКТОРА (CMS) ---

function initEditor() {
  const toggleBtn = document.getElementById('editor-toggle-btn');
  const closeBtn = document.getElementById('editor-panel-close');

  if (toggleBtn) toggleBtn.addEventListener('click', toggleEditorMode);
  if (closeBtn) closeBtn.addEventListener('click', toggleEditorMode);

  // Настройки GitHub
  const btnGithub = document.getElementById('btn-github-settings');
  if (btnGithub) {
    btnGithub.addEventListener('click', () => {
      document.getElementById('gh-token').value = localStorage.getItem('gh_token') || '';
      document.getElementById('gh-repo').value = localStorage.getItem('gh_repo') || '';
      document.getElementById('gh-branch').value = localStorage.getItem('gh_branch') || 'main';
      document.getElementById('github-settings-modal').classList.add('active');
    });
  }

  const btnSaveGithub = document.getElementById('btn-save-github-settings');
  if (btnSaveGithub) {
    btnSaveGithub.addEventListener('click', () => {
      localStorage.setItem('gh_token', document.getElementById('gh-token').value.trim());
      localStorage.setItem('gh_repo', document.getElementById('gh-repo').value.trim());
      localStorage.setItem('gh_branch', document.getElementById('gh-branch').value.trim() || 'main');
      document.getElementById('github-settings-modal').classList.remove('active');
      alert('Настройки GitHub успешно применены!');
    });
  }

  // Добавление услуги
  const btnAdd = document.getElementById('btn-add-product');
  if (btnAdd) btnAdd.addEventListener('click', addProduct);

  // Сохранение изменений
  const btnSave = document.getElementById('btn-save-config');
  if (btnSave) btnSave.addEventListener('click', saveConfigAndProducts);

  // Применение свойств товара в модалке
  const btnSaveProdDetails = document.getElementById('btn-save-product-details');
  if (btnSaveProdDetails) btnSaveProdDetails.addEventListener('click', saveProductDetails);
}

// --- Переключение режима редактирования ---
function toggleEditorMode() {
  isEditorMode = !isEditorMode;

  const panel = document.getElementById('editor-panel');
  if (panel) panel.classList.toggle('active', isEditorMode);

  document.body.classList.toggle('editor-mode-active', isEditorMode);

  // Включаем/выключаем contenteditable для блоков настраиваемой конфигурации
  const editableConfigs = document.querySelectorAll('[data-config]');
  editableConfigs.forEach(el => {
    el.setAttribute('contenteditable', isEditorMode ? 'true' : 'false');
  });

  // Перерисовываем карточки, чтобы добавить/убрать кнопки управления
  renderProducts(products);
}

// --- Добавление товара ---
function addProduct() {
  const newProduct = {
    "id": "product-" + Date.now(),
    "title": "Новая услуга",
    "category": "render",
    "price": "300 ₽",
    "thumbnail": "RenderDummy.png",
    "images": [
      "RenderDummy.png"
    ],
    "modelUrl": "",
    "description": "Краткое описание новой услуги. Кликните, чтобы отредактировать.",
    "specs": {
      "Форматы": "PNG, JPEG",
      "Разрешение": "1920x1080"
    }
  };

  products.push(newProduct);
  renderProducts(products);

  // Скроллим к каталогу
  document.getElementById('store').scrollIntoView({ behavior: 'smooth' });
}

// --- Удаление товара ---
function deleteProduct(id) {
  if (confirm('Вы уверены, что хотите удалить эту услугу?')) {
    products = products.filter(p => p.id !== id);
    renderProducts(products);
  }
}

// --- Открытие модалки редактирования свойств товара ---
function openEditProductModal(id) {
  editingProductId = id;
  const product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById('edit-prod-modal-title').textContent = `Свойства: ${product.title}`;
  document.getElementById('edit-prod-image').value = product.thumbnail || '';

  // Превращаем характеристики обратно в текст
  let specsText = '';
  for (const [key, value] of Object.entries(product.specs)) {
    specsText += `${key}: ${value}\n`;
  }
  document.getElementById('edit-prod-specs').value = specsText.trim();

  document.getElementById('edit-product-modal').classList.add('active');
}

// --- Сохранение свойств товара из модалки ---
function saveProductDetails() {
  if (!editingProductId) return;
  const product = products.find(p => p.id === editingProductId);
  if (!product) return;

  const imgPath = document.getElementById('edit-prod-image').value.trim();
  product.thumbnail = imgPath;
  product.images = [imgPath]; // Галерея по умолчанию состоит из одной картинки

  // Парсим характеристики
  const specsText = document.getElementById('edit-prod-specs').value;
  const newSpecs = {};
  const lines = specsText.split('\n');
  lines.forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      if (key && value) {
        newSpecs[key] = value;
      }
    }
  });
  product.specs = newSpecs;

  document.getElementById('edit-product-modal').classList.remove('active');
  renderProducts(products);
}

// --- Сбор измененных данных с экрана и сохранение ---
async function saveConfigAndProducts() {
  // 1. Считываем данные конфигурации с экрана
  const editableConfigs = document.querySelectorAll('[data-config]');
  editableConfigs.forEach(el => {
    const path = el.getAttribute('data-config');
    const value = el.textContent.trim();

    // Безопасно пишем по пути, например "owner.name"
    const keys = path.split('.');
    if (keys.length === 2) {
      config[keys[0]][keys[1]] = value;
    }
  });

  // Аватар берем из img.src (относительный путь)
  const avatarEl = document.getElementById('hero-avatar');
  if (avatarEl) {
    const src = avatarEl.getAttribute('src');
    config.hero.avatar = src;
  }

  // 2. Считываем данные продуктов с экрана
  const cardElements = document.querySelectorAll('.product-card');
  cardElements.forEach(card => {
    const id = card.getAttribute('data-id');
    const product = products.find(p => p.id === id);
    if (product) {
      const titleEl = card.querySelector('.product-card-title');
      const descEl = card.querySelector('.product-card-desc');
      const priceEl = card.querySelector('.product-price');

      if (titleEl) product.title = titleEl.textContent.trim();
      if (descEl) product.description = descEl.textContent.trim();
      if (priceEl) product.price = priceEl.textContent.trim();
    }
  });

  // Применяем локально обновленный конфиг
  OWNER_CONFIG.name = config.owner.name;
  OWNER_CONFIG.telegramUsername = config.owner.telegram;
  OWNER_CONFIG.artstation = config.owner.artstation;
  OWNER_CONFIG.sketchfab = config.owner.sketchfab;
  applyConfigToDOM();

  // 3. Выбор способа сохранения (GitHub API или скачивание файлов)
  const token = localStorage.getItem('gh_token');
  const repo = localStorage.getItem('gh_repo');
  const branch = localStorage.getItem('gh_branch') || 'main';

  if (token && repo) {
    if (confirm('Обнаружены настройки GitHub. Хотите опубликовать изменения на GitHub Pages в один клик?')) {
      await publishToGitHub(token, repo, branch);
      return;
    }
  }

  // Если нет настроек GitHub или пользователь отказался — скачиваем файлы
  downloadFile(JSON.stringify(config, null, 2), 'config.json');
  setTimeout(() => {
    downloadFile(JSON.stringify(products, null, 2), 'products.json');
  }, 300);

  alert('Файлы config.json и products.json успешно сгенерированы и скачаны на ваш компьютер! Замените ими файлы в вашем проекте, чтобы применить изменения.');
}

// --- Утилита для скачивания файла ---
function downloadFile(content, fileName) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Асинхронная отправка изменений в GitHub API ---
async function publishToGitHub(token, repo, branch) {
  const btnSave = document.getElementById('btn-save-config');
  const originalText = btnSave.innerHTML;
  btnSave.disabled = true;
  btnSave.innerHTML = `<span>Сохраняем...</span>`;

  try {
    // 1. Публикуем config.json
    const configContentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(config, null, 2))));
    const configSha = await getFileSha(token, repo, branch, 'config.json');
    await uploadFileToGitHub(token, repo, branch, 'config.json', configContentBase64, configSha, 'Update config.json via Web CMS');

    // 2. Публикуем products.json
    const productsContentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(products, null, 2))));
    const productsSha = await getFileSha(token, repo, branch, 'products.json');
    await uploadFileToGitHub(token, repo, branch, 'products.json', productsContentBase64, productsSha, 'Update products.json via Web CMS');

    alert('Поздравляем! Сайт успешно сохранен и обновлен на GitHub Pages. Изменения вступят в силу в течение 1-2 минут.');
    toggleEditorMode(); // Выключаем режим редактора
  } catch (error) {
    console.error('Ошибка публикации на GitHub:', error);
    alert('Не удалось опубликовать изменения на GitHub: ' + error.message + '\n\nМы предложим вам скачать файлы на компьютер.');
    // Скачиваем файлы как резерв
    downloadFile(JSON.stringify(config, null, 2), 'config.json');
    setTimeout(() => {
      downloadFile(JSON.stringify(products, null, 2), 'products.json');
    }, 300);
  } finally {
    btnSave.disabled = false;
    btnSave.innerHTML = originalText;
  }
}

// --- Получение SHA коммита файла на GitHub ---
async function getFileSha(token, repo, branch, path) {
  const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (response.status === 404) return null; // Файла нет, SHA не нужен
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ошибка получения SHA (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.sha;
}

// --- Загрузка файла на GitHub ---
async function uploadFileToGitHub(token, repo, branch, path, contentBase64, sha, commitMessage) {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  const body = {
    message: commitMessage,
    content: contentBase64,
    branch: branch
  };
  if (sha) body.sha = sha; // Добавляем SHA для обновления существующего файла

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ошибка загрузки ${path} (${response.status}): ${errText}`);
  }
}

// --- ПОРТФОЛИО ---

// Загрузка работ портфолио
async function loadPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  try {
    const response = await fetch('data/portfolio.json');
    if (!response.ok) throw new Error('Ошибка загрузки portfolio.json');
    portfolio = await response.json();
  } catch (error) {
    console.warn('Не удалось загрузить portfolio.json (возможно, локальный запуск). Используем резервные данные.');
    portfolio = [
      {
        "id": "portfolio-oketra",
        "title": "Oketra",
        "category": "3D Модель",
        "image": "assets/renders/render1.png"
      },
      {
        "id": "portfolio-serqayrend",
        "title": "serqayrend",
        "category": "Рендер",
        "image": "assets/renders/render2.png"
      },
      {
        "id": "portfolio-finalrender",
        "title": "FinalRender",
        "category": "Рендер",
        "image": "assets/renders/render3.png"
      },
      {
        "id": "portfolio-steveps",
        "title": "StevePS",
        "category": "3D Модель",
        "image": "assets/renders/render4.png"
      },
      {
        "id": "portfolio-postermimi",
        "title": "PosterMIMI",
        "category": "Рендер",
        "image": "assets/renders/render5.png"
      },
      {
        "id": "portfolio-allayfem",
        "title": "allayFem",
        "category": "3D Модель",
        "image": "assets/renders/render7.png"
      },
      {
        "id": "portfolio-homadik",
        "title": "homadikDonatikfix",
        "category": "3D Модель",
        "image": "assets/renders/render8.png"
      },
      {
        "id": "portfolio-rushhiper",
        "title": "rushhiper",
        "category": "Рендер",
        "image": "assets/renders/render9.png"
      },
      {
        "id": "portfolio-secret",
        "title": "secret render",
        "category": "Рендер",
        "image": "assets/renders/render10.png"
      },
      {
        "id": "portfolio-spice42",
        "title": "Spice42",
        "category": "3D Модель",
        "image": "assets/renders/Spice42 1.png"
      },
      {
        "id": "portfolio-gorse",
        "title": "render gorse",
        "category": "Рендер",
        "image": "assets/renders/Untitled42 1.png"
      },
      {
        "id": "portfolio-megabox",
        "title": "MegaBox",
        "category": "3D Модель",
        "image": "assets/renders/Тайна мощне сиське 1 (2).png"
      }
    ];
  }

  renderPortfolio(portfolio);
}

// Отрисовка карточек портфолио в виде бесконечного «поезда»
function renderPortfolio(items) {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!items || items.length === 0) {
    grid.innerHTML = `
      <div class="portfolio-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <h3>Скоро здесь появятся работы</h3>
        <p>Раздел портфолио наполняется. Следите за обновлениями!</p>
      </div>
    `;
    return;
  }

  // Создаем горизонтальный движущийся трек (поезд)
  const track = document.createElement('div');
  track.className = 'portfolio-track reveal-scale';
  grid.appendChild(track);

  // Вспомогательная функция создания карточки
  function createPortfolioCard(item) {
    const card = document.createElement('div');
    card.className = 'portfolio-item';
    card.setAttribute('data-portfolio-id', item.id);
    card.innerHTML = `
      <img src="${encodeURI(item.image)}" alt="${item.title}">
    `;

    // Клик — открытие лайтбокса
    card.addEventListener('click', () => {
      openPortfolioLightbox(item);
    });

    return card;
  }

  // Заполняем трек оригинальными карточками
  items.forEach(item => {
    track.appendChild(createPortfolioCard(item));
  });

  // Дублируем карточки для создания бесшовного бесконечного цикла прокрутки
  items.forEach(item => {
    track.appendChild(createPortfolioCard(item));
  });

  let position = 0;
  let targetSpeed = 0.8; // Базовая скорость (пикселей за кадр)
  let currentSpeed = 0.8;
  let stopTrainTimeout = null;
  let isMouseOver = false;

  function animate() {
    const lightbox = document.getElementById('portfolio-lightbox');
    const isLightboxActive = lightbox && lightbox.classList.contains('active');
    
    if (isLightboxActive) {
      targetSpeed = 0;
      currentSpeed = 0; // Мгновенный стоп при открытии лайтбокса
    } else if (isMouseOver) {
      // Если мышь наведена (и прошел таймаут в 350мс), targetSpeed станет 0
    } else {
      targetSpeed = 0.8;
    }

    // Плавно приближаем текущую скорость к целевой
    currentSpeed += (targetSpeed - currentSpeed) * 0.05;

    // Сдвигаем трек
    position -= currentSpeed;

    // Сбрасываем позицию при достижении половины ширины трека
    const halfWidth = track.scrollWidth / 2;
    if (halfWidth > 100) {
      if (Math.abs(position) >= halfWidth) {
        position = 0;
      }
    } else {
      position = 0; // Защита: сбрасываем в 0, если картинки еще не прогрузились
    }

    track.style.transform = `translate3d(${position}px, 0, 0)`;
    requestAnimationFrame(animate);
  }

  // Плавное замедление при наведении с задержкой
  track.addEventListener('mouseenter', () => {
    isMouseOver = true;
    const lightbox = document.getElementById('portfolio-lightbox');
    if (lightbox && lightbox.classList.contains('active')) return;

    stopTrainTimeout = setTimeout(() => {
      targetSpeed = 0;
    }, 350); // 350мс задержки перед началом замедления
  });

  track.addEventListener('mouseleave', () => {
    isMouseOver = false;
    if (stopTrainTimeout) {
      clearTimeout(stopTrainTimeout);
      stopTrainTimeout = null;
    }
    targetSpeed = 0.8;
  });

  // Запускаем цикл анимации
  animate();

  // Обновляем список отслеживаемых элементов для scroll-reveal
  if (window.scrollReveal) {
    window.scrollReveal.observeNewElements();
  }
}

// Открытие лайтбокса портфолио
function openPortfolioLightbox(item) {
  const lightbox = document.getElementById('portfolio-lightbox');
  if (!lightbox) return;

  document.getElementById('lightbox-img').src = encodeURI(item.image);
  document.getElementById('lightbox-title').textContent = item.title;
  document.getElementById('lightbox-category').textContent = item.category || '';

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (window.soundDesign) window.soundDesign.playModalOpen();

}

// Настройка лайтбокса портфолио
function setupPortfolioLightbox() {
  const lightbox = document.getElementById('portfolio-lightbox');
  if (!lightbox) return;

  // Закрытие по клику на оверлей или кнопку
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.closest('.lightbox-close')) {
      if (lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        if (window.soundDesign) window.soundDesign.playModalClose();

      }
    }
  });

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      if (window.soundDesign) window.soundDesign.playModalClose();
    }
  });
}
