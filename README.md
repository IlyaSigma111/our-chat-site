# ⚡ OpenCode Chat & Files

Современный веб-интерфейс для связи с ИИ и обмена файлами.

**🌐 Сайт:** https://ilyasigma111.github.io/our-chat-site/
**📂 Репозиторий:** https://github.com/IlyaSigma111/our-chat-site

## 🚀 О проекте

Этот проект представляет собой веб-приложение, объединяющее:
- 💬 **Чат с ИИ** — обмен сообщениями с сохранением истории
- 📁 **Файлообменник** — загрузка, скачивание и управление файлами
- ⚙️ **Настройки** — конфигурация API и интерфейса

## 🛠 Технологии

- **Frontend:** Чистый HTML/CSS/JS (без фреймворков) — хостится на GitHub Pages
- **Backend:** Node.js + Express + MongoDB — размещается на Timeweb
- **Database:** MongoDB (Timeweb)

## 📁 Структура проекта

```
our-chat-site/
├── index.html          # Фронтенд (GitHub Pages)
├── README.md
├── .nojekyll
└── backend/           # Бэкенд (Timeweb)
    ├── server.js      # Express сервер + API
    ├── package.json
    ├── .env.example
    └── README.md      # Инструкция по деплою
```

## 🛠 Быстрый старт

### Фронтенд (уже задеплоен)
Сайт доступен по адресу: https://ilyasigma111.github.io/our-chat-site/

### Бэкенд (настройка на Timeweb)
См. инструкцию в `backend/README.md`

Кратко:
1. Залейте папку `backend` на сервер timeweb
2. Создайте БД MongoDB в панели timeweb
3. Настройте `.env` с данными БД
4. Запустите через PM2: `pm2 start server.js --name "opencode-api"`

## ⚙️ Настройка подключения

После деплоя бэкенда на timeweb:
1. Откройте сайт https://ilyasigma111.github.io/our-chat-site/
2. Перейдите в "Настройки"
3. Укажите URL вашего API: `https://your-domain.timeweb.ru`

## 📝 TODO

- [ ] Подключение к ИИ API (Anthropic/OpenAI/GPT)
- [ ] Реализация загрузки файлов на сервер (timeweb)
- [ ] Авторизация пользователей
- [ ] Rate limiting и безопасность

## 📄 Лицензия

MIT
