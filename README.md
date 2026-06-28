# Сайт-портфолио и 3D магазин Serqay

Современный статический веб-сайт для демонстрации и продажи 3D-моделей и рендеров, полностью адаптированный для бесплатного хостинга на **GitHub Pages**.

---

## Особенности проекта
*   **Интерактивный 3D-просмотр**: Клиенты могут вращать, приближать и осматривать 3D-модели в формате `.glb` прямо на сайте с помощью встроенного вьюера Google `<model-viewer>`.
*   **Премиальный UI**: Темная тема, эффекты стекломорфизма (glassmorphism), плавные CSS-анимации, пульсация кнопок и неоновые акценты.
*   **Адаптивная верстка**: Сайт отлично выглядит на мобильных устройствах, планшетах и компьютерах.
*   **Гибкое управление**: Контент загружается динамически из простого файла `products.json`.
*   **Быстрый заказ**: Прямая ссылка для связи в Telegram (автоматическое составление ссылки на диалог с текстом заказа).

---

## Как настроить контакты под себя

Откройте файл [app.js](file:///d:/SerqayFil/Doc/MySite/app.js) и настройте блок `OWNER_CONFIG` на самых первых строчках:

```javascript
const OWNER_CONFIG = {
  telegramUsername: 'serqay' // Ваш ник в Telegram (без @)
};
```

---

## Как добавлять и редактировать товары

Вся база данных товаров находится в файле [products.json](file:///d:/SerqayFil/Doc/MySite/products.json). Чтобы добавить новую модель или рендер, просто добавьте объект в массив:

### Пример объекта 3D-модели:
```json
{
  "id": "my-cool-car",
  "title": "Спорткар Cyberpunk Car",
  "category": "3d-model",
  "price": "$50",
  "thumbnail": "assets/renders/car_thumb.jpg",
  "images": [
    "assets/renders/car_thumb.jpg",
    "assets/renders/car_detail1.jpg"
  ],
  "modelUrl": "assets/models/car.glb",
  "description": "Описание вашей модели спорткара...",
  "specs": {
    "polygons": "45,000",
    "vertices": "42,000",
    "formats": "FBX, OBJ, BLEND",
    "textures": "Да (4K PBR)",
    "rigged": "Нет",
    "animated": "Нет"
  }
}
```

### Форматы файлов:
1.  **3D-модели для вьюера**: Загружайте файлы в формате `.glb` или `.glb` в папку `assets/models/`. Вьюер на сайте поддерживает отображение только этого формата (он оптимизирован для веба).
2.  **Изображения**: Скриншоты и финальные рендеры загружайте в папку `assets/renders/`.

---

## Как опубликовать сайт на GitHub Pages

1.  Создайте репозиторий на вашем GitHub (вы уже указали адрес `https://github.com/poploldanil-jpg/Site`).
2.  Инициализируйте Git в локальной папке проекта и отправьте все файлы в репозиторий:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/poploldanil-jpg/Site.git
    git push -u origin main
    ```
3.  Зайдите в настройки вашего репозитория на GitHub (вкладка **Settings**).
4.  В левом меню выберите раздел **Pages**.
5.  В блоке **Build and deployment** -> **Branch** выберите ветку `main` (или `master`) и папку `/ (root)`.
6.  Нажмите кнопку **Save**.
7.  В течение пары минут ваш сайт станет доступен по адресу:  
    `https://poploldanil-jpg.github.io/Site/`
