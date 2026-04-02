# Руководство по развертыванию приложений

## Обзор приложений

Проект содержит три основных приложения:

1. **pizza-admin** - Angular SSR приложение для административной панели (порт 4000)
2. **pizza-api** - NestJS REST API (порт 3000, префикс `/api`)
3. **pizza-store** - Next.js приложение для магазина (порт 3001)

## Архитектура развертывания

```
Internet → Nginx (порт 80/443)
            ├─→ /admin → pizza-admin (Node.js SSR, порт 4000)
            ├─→ /api → pizza-api (NestJS, порт 3000)
            └─→ / → pizza-store (Next.js, порт 3001)
```

---

# 1. Pizza Admin (Angular SSR)

## Архитектура развертывания

```
Internet → Nginx (порт 80/443) → Node.js сервер (порт 4000) → Angular SSR
                ↓
         Статические файлы (browser/)
```

## Шаг 1: Подготовка сервера

### 1.1 Установите зависимости на сервере

```bash
# Убедитесь, что установлены Node.js (v18+) и npm
node --version
npm --version

# Установите зависимости проекта
npm install --production
```

### 1.2 Соберите приложение

```bash
# На сервере или локально (затем загрузите dist/)
npm run build:pizza-admin:prod
```

## Шаг 2: Настройка Node.js сервера

### 2.1 Запуск через PM2 (рекомендуется)

```bash
# Установите PM2 глобально
npm install -g pm2

# Запустите приложение
cd /path/to/your/project
pm2 start dist/apps/pizza-admin/server/server.mjs --name pizza-admin

# Настройте автозапуск при перезагрузке
pm2 startup
pm2 save

# Проверьте статус
pm2 status
pm2 logs pizza-admin
```

### 2.2 Или через systemd service

Создайте файл `/etc/systemd/system/pizza-admin.service`:

```ini
[Unit]
Description=Pizza Admin Angular SSR Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/project
Environment=NODE_ENV=production
Environment=PORT=4000
ExecStart=/usr/bin/node /path/to/your/project/dist/apps/pizza-admin/server/server.mjs
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Затем:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pizza-admin
sudo systemctl start pizza-admin
sudo systemctl status pizza-admin
```

## Шаг 3: Переменные окружения

Создайте файл `.env` или установите переменные окружения:

```bash
export NODE_ENV=production
export PORT=4000
export API_URL=https://your-api-domain.com/api
```

Или через PM2 ecosystem файл (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [
    {
      name: 'pizza-admin',
      script: './dist/apps/pizza-admin/server/server.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        API_URL: 'http://localhost:3000/api',
      },
    },
  ],
};
```

## Шаг 4: Проверка работы

1. **Проверьте Node.js сервер:**

   ```bash
   curl http://localhost:4000
   ```

2. **Проверьте логи:**

   ```bash
   # Логи PM2
   pm2 logs pizza-admin

   # Логи systemd
   sudo journalctl -u pizza-admin -f
   ```

## Важные моменты

1. **Путь в nginx `root`**: Указывайте на папку `browser/`, а не на всю `dist/apps/pizza-admin/`
2. **Порт Node.js**: По умолчанию 4000, можно изменить через переменную `PORT`
3. **Статика**: Nginx должен иметь права на чтение файлов в `browser/`
4. **Firewall**: Откройте порты 80 и 443, но НЕ открывайте порт 4000 наружу (только для nginx)

---

# 2. Pizza API (NestJS)

## Архитектура развертывания

```
Internet → Nginx (порт 80/443) → NestJS сервер (порт 3000) → MongoDB
                ↓
         API endpoints (/api/*)
```

## Шаг 1: Подготовка сервера

### 1.1 Установите зависимости

```bash
# Убедитесь, что установлены Node.js (v18+) и npm
node --version
npm --version

# Установите зависимости проекта
npm install --production
```

### 1.2 Установите и настройте MongoDB

```bash
# Установите MongoDB
sudo apt update
sudo apt install -y mongodb

# Запустите MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Проверьте статус
sudo systemctl status mongodb
```

### 1.3 Соберите приложение

```bash
# Соберите API
nx build pizza-api
# или
npm run build:all
```

## Шаг 2: Настройка Node.js сервера

### 2.1 Запуск через PM2 (рекомендуется)

```bash
# Запустите приложение
cd /path/to/your/project
pm2 start dist/apps/pizza-api/main.js --name pizza-api

# Настройте автозапуск при перезагрузке
pm2 startup
pm2 save

# Проверьте статус
pm2 status
pm2 logs pizza-api
```

### 2.2 Или через systemd service

Создайте файл `/etc/systemd/system/pizza-api.service`:

```ini
[Unit]
Description=Pizza API NestJS Server
After=network.target mongodb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/project
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=MODE=PROD
ExecStart=/usr/bin/node /path/to/your/project/dist/apps/pizza-api/main.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Затем:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pizza-api
sudo systemctl start pizza-api
sudo systemctl status pizza-api
```

## Шаг 3: Переменные окружения

Создайте файл `.env` в корне проекта:

```bash
# Режим работы
MODE=PROD

# Порт сервера
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/pizza-db

# JWT секреты
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# SMTP настройки для отправки email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# URL для активации аккаунта
ACTIVATION_URL=https://yourdomain.com/activate
```

Или через PM2 ecosystem файл:

```javascript
module.exports = {
  apps: [
    {
      name: 'pizza-api',
      script: './dist/apps/pizza-api/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        MODE: 'PROD',
        MONGODB_URI: 'mongodb://localhost:27017/pizza-db',
        // ... остальные переменные
      },
    },
  ],
};
```

## Шаг 4: Проверка работы

1. **Проверьте API сервер:**

   ```bash
   curl http://localhost:3000/api
   ```

2. **Проверьте логи:**

   ```bash
   # Логи PM2
   pm2 logs pizza-api

   # Логи systemd
   sudo journalctl -u pizza-api -f
   ```

## Важные моменты

1. **Порт API**: По умолчанию 3000, можно изменить через переменную `PORT`
2. **Префикс API**: Все endpoints имеют префикс `/api`
3. **MongoDB**: Убедитесь, что MongoDB запущен и доступен
4. **CORS**: В режиме PROD CORS настроен строже, чем в DEV
5. **Firewall**: Откройте порты 80 и 443, но НЕ открывайте порт 3000 наружу (только для nginx)

---

# 3. Pizza Store (Next.js)

## Архитектура развертывания

```
Internet → Nginx (порт 80/443) → Next.js сервер (порт 3001)
                ↓
         Статические файлы (.next/static)
```

## Шаг 1: Подготовка сервера

### 1.1 Установите зависимости

```bash
# Убедитесь, что установлены Node.js (v18+) и npm
node --version
npm --version

# Установите зависимости проекта
npm install --production
```

### 1.2 Соберите приложение

```bash
# Соберите Next.js приложение
nx build pizza-store
# или
npm run build:pizza-store
```

Результат сборки будет в `dist/apps/pizza-store/.next/`

> Для запуска **только из `dist/`** используется `output: 'standalone'`.
> В этом проекте entrypoint после сборки находится здесь:
> `dist/apps/pizza-store/.next/standalone/apps/pizza-store/server.js`

## Шаг 2: Настройка Node.js сервера

### 2.1 Запуск через PM2 (рекомендуется)

```bash
# Установите PM2 (если ещё не установлен)
npm install -g pm2

# Перейдите в репозиторий на сервере
cd /var/www/html/francesco-lucania-pizza

# (обязательно) соберите standalone билд
npx nx build pizza-store

# Standalone entrypoint
STORE_STANDALONE_DIR="dist/apps/pizza-store/.next/standalone/apps/pizza-store"

# Важно: standalone сервер ожидает, что рядом будут .next/static и public
mkdir -p "$STORE_STANDALONE_DIR/.next"
cp -R dist/apps/pizza-store/.next/static "$STORE_STANDALONE_DIR/.next/" 2>/dev/null || true
cp -R apps/pizza-store/public "$STORE_STANDALONE_DIR/public" 2>/dev/null || true

# Запустите standalone сервер из dist
PORT=3001 NODE_ENV=production pm2 start node \
  --name pizza-store \
  --cwd "$STORE_STANDALONE_DIR" \
  -- server.js --update-env

# Настройте автозапуск при перезагрузке
pm2 startup
pm2 save

# Проверьте статус
pm2 status
pm2 logs pizza-store
```

### 2.2 Или через systemd service

Создайте файл `/etc/systemd/system/pizza-store.service`:

```ini
[Unit]
Description=Pizza Store Next.js Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/html/francesco-lucania-pizza
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=NEXT_PUBLIC_API_URL=http://localhost:3000/api
ExecStart=/usr/bin/node /var/www/html/francesco-lucania-pizza/dist/apps/pizza-store/.next/standalone/apps/pizza-store/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Затем:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pizza-store
sudo systemctl start pizza-store
sudo systemctl status pizza-store
```

## Шаг 3: Переменные окружения

Создайте файл `.env.local` в `apps/pizza-store/`:

```bash
# URL API бэкенда
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# или для production
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Порт Next.js сервера (опционально)
PORT=3001
```

Или через PM2 ecosystem файл:

```javascript
module.exports = {
  apps: [
    {
      name: 'pizza-store',
      script: 'npm',
      args: 'start',
      cwd: './apps/pizza-store',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
      },
    },
  ],
};
```

## Шаг 4: Проверка работы

1. **Проверьте Next.js сервер:**

   ```bash
   curl http://localhost:3001
   ```

2. **Проверьте логи:**

   ```bash
   # Логи PM2
   pm2 logs pizza-store

   # Логи systemd
   sudo journalctl -u pizza-store -f
   ```

## Важные моменты

1. **Порт Next.js**: По умолчанию 3000, но рекомендуется использовать 3001, чтобы не конфликтовать с API
2. **Директория сборки**: Результат сборки в `dist/apps/pizza-store/.next/`
3. **Standalone entrypoint**: `dist/apps/pizza-store/.next/standalone/apps/pizza-store/server.js`
4. **Статика**: Для standalone убедитесь, что существуют:
   - `dist/apps/pizza-store/.next/static/` (после сборки)
   - `dist/apps/pizza-store/.next/standalone/apps/pizza-store/.next/static/` (скопируйте из `dist/apps/pizza-store/.next/static/`)
   - `dist/apps/pizza-store/.next/standalone/apps/pizza-store/public/` (скопируйте из `apps/pizza-store/public/`)
5. **Firewall**: Откройте порты 80 и 443, но НЕ открывайте порт 3001 наружу (только для nginx)

---

# 4. Настройка Nginx

## Шаг 1: Установите nginx

```bash
sudo apt update
sudo apt install nginx
```

## Шаг 2: Создайте конфигурацию

Скопируйте `nginx.conf.example` в `/etc/nginx/sites-available/pizza`:

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/pizza
```

Отредактируйте файл:

```bash
sudo nano /etc/nginx/sites-available/pizza
```

**Важные изменения:**

- `server_name` - ваш домен
- Пути к статическим файлам
- Порты для проксирования

## Шаг 3: Активируйте сайт

```bash
# Создайте симлинк
sudo ln -s /etc/nginx/sites-available/pizza /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Перезагрузите nginx
sudo systemctl reload nginx
```

## Шаг 4: Настройка SSL (опционально, но рекомендуется)

```bash
# Установите certbot
sudo apt install certbot python3-certbot-nginx

# Получите SSL сертификат
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot автоматически обновит конфигурацию nginx
```

---

# 5. Сборка всех приложений

## Полная сборка

```bash
# Соберите все приложения
npm run build:all:prod

# Или по отдельности
npm run build:pizza-admin:prod
nx build pizza-api
nx build pizza-store
```

## Структура dist после сборки

```
dist/
├── apps/
│   ├── pizza-admin/
│   │   ├── browser/          # Статические файлы Angular
│   │   └── server/           # SSR сервер
│   ├── pizza-api/
│   │   ├── main.js           # Скомпилированный API
│   │   └── assets/
│   └── pizza-store/
│       └── .next/            # Next.js сборка
│           ├── static/
│           ├── server/
│           └── ...
```

---

# 6. Обновление приложений

## Обновление всех приложений

```bash
# 1. Остановите все приложения
pm2 stop all
# или
sudo systemctl stop pizza-admin pizza-api pizza-store

# 2. Обновите код и пересоберите
git pull
npm install
npm run build:all:prod

# 3. Запустите снова
pm2 restart all
# или
sudo systemctl start pizza-admin pizza-api pizza-store
```

## Обновление отдельного приложения

```bash
# Например, только pizza-admin
pm2 stop pizza-admin
npm run build:pizza-admin:prod
pm2 restart pizza-admin
```

---

# 7. Troubleshooting

## Pizza Admin не запускается

```bash
# Проверьте, что все зависимости установлены
cd dist/apps/pizza-admin/server
node server.mjs

# Проверьте логи
pm2 logs pizza-admin
```

## Pizza API не запускается

```bash
# Проверьте MongoDB
sudo systemctl status mongodb
mongosh --eval "db.adminCommand('ping')"

# Проверьте переменные окружения
cat .env

# Проверьте логи
pm2 logs pizza-api
```

## Pizza Store не запускается

```bash
# Проверьте, что сборка прошла успешно
ls -la dist/apps/pizza-store/.next

# Проверьте переменные окружения
cat apps/pizza-store/.env.local

# Проверьте логи
pm2 logs pizza-store
```

## Nginx возвращает 502 Bad Gateway

- Проверьте, что Node.js серверы запущены:
  ```bash
  curl http://localhost:4000  # pizza-admin
  curl http://localhost:3000/api  # pizza-api
  curl http://localhost:3001  # pizza-store
  ```
- Проверьте права доступа к файлам
- Проверьте логи nginx: `sudo tail -f /var/log/nginx/error.log`

## Статические файлы не загружаются

- Проверьте пути `root` в nginx конфигурации
- Проверьте права доступа: `sudo chown -R www-data:www-data dist/`
- Проверьте, что файлы существуют в соответствующих директориях

---

# 8. Мониторинг и логи

## Просмотр логов PM2

```bash
# Все логи
pm2 logs

# Конкретное приложение
pm2 logs pizza-admin
pm2 logs pizza-api
pm2 logs pizza-store

# Только ошибки
pm2 logs --err
```

## Просмотр логов systemd

```bash
# Конкретный сервис
sudo journalctl -u pizza-admin -f
sudo journalctl -u pizza-api -f
sudo journalctl -u pizza-store -f
```

## Просмотр логов Nginx

```bash
# Access log
sudo tail -f /var/log/nginx/pizza-access.log

# Error log
sudo tail -f /var/log/nginx/pizza-error.log

# Общий error log
sudo tail -f /var/log/nginx/error.log
```

## Мониторинг ресурсов

```bash
# PM2 мониторинг
pm2 monit

# Системные ресурсы
htop
# или
top
```
