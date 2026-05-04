# Backend API для OpenCode Chat & Files

Node.js + Express + MongoDB API для обработки сообщений и файлов.

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
cd backend
npm install
```

### 2. Настройка окружения
Скопируйте `.env.example` в `.env` и заполните:
```bash
cp .env.example .env
```

Обязательные параметры:
- `MONGODB_URI` — строка подключения к MongoDB (с timeweb)
- `JWT_SECRET` — секретный ключ для токенов
- `PORT` — порт (по умолчанию 3000)

### 3. Запуск
```bash
# Production
npm start

# Development (с hot-reload)
npm run dev
```

## 📡 API Endpoints

### Чат
- `GET /api/messages` — получить все сообщения
- `POST /api/messages` — отправить сообщение
  ```json
  {
    "role": "user",
    "content": "Привет!",
    "userId": "optional"
  }
  ```

### Файлы
- `POST /api/files/upload` — загрузить файл (multipart/form-data)
- `GET /api/files` — список всех файлов
- `GET /api/files/download/:id` — скачать файл
- `DELETE /api/files/:id` — удалить файл

### Проверка
- `GET /api/health` — статус API и подключения к БД

## 🛠 Деплой на Timeweb

1. Залейте код на сервер (через Git или SFTP)
2. Установите Node.js и npm на сервере
3. Создайте базу MongoDB в панели timeweb
4. Настройте `.env` с вашими данными
5. Запустите через PM2:
```bash
npm install -g pm2
pm2 start server.js --name "opencode-api"
pm2 save
pm2 startup
```

## 🔗 Подключение фронтенда

В настройках сайта (GitHub Pages) укажите:
```
Backend URL: https://your-timeweb-domain.ru
```

## 📝 TODO

- [ ] Подключить реальный ИИ API (OpenAI/Anthropic)
- [ ] Добавить авторизацию
- [ ] Rate limiting
- [ ] Логирование
