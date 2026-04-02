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
Internet → Nginx (порт 80/443) → NestJS сервер (порт из PORT, чаще 3000 или 5000) → MongoDB
                ↓
         API endpoints (/api/*)
```

Корень репозитория на сервере в примерах ниже: **`/var/www/html/francesco-lucania-pizza`**.

## Шаг 1: Подготовка сервера

### 1.1 Установите зависимости

```bash
# Убедитесь, что установлены Node.js (v18+) и npm
node --version
npm --version

# Для сборки webpack нужны devDependencies — на сервере лучше:
npm ci
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
npx nx build pizza-api
```

Артефакт: **`dist/apps/pizza-api/main.js`** (и `package.json` рядом для зависимостей при отдельном деплое).

### 1.4 Файл `.env`

`ConfigModule` в сборке читает **`dist/.env`** (путь считается от `dist/apps/pizza-api`). Удобно после каждой сборки скопировать рабочий файл:

```bash
cp apps/pizza-api/.env dist/.env
```

Либо задавайте переменные через окружение процесса (`pm2` / systemd) — они перекрывают значения из файла.

В проде выставьте **`MODE=PROD`** (иначе включится широкий CORS как в DEV).

Если фронт ходит в API **не строго с того же origin** (другая схема, `www`, поддомен) или включён **`credentials: 'include'`** и браузер ругается на CORS, добавьте в **`apps/pizza-api/.env`**:

```bash
CORS_ORIGIN=http://francescolucania.com,https://francescolucania.com,http://www.francescolucania.com,https://www.francescolucania.com
```

После правки `.env` перезапустите `pizza-api` (`pm2 restart pizza-api`).

## Шаг 2: Настройка Node.js сервера

### 2.1 Запуск через PM2 (рекомендуется)

```bash
cd /var/www/html/francesco-lucania-pizza

npx nx build pizza-api
cp apps/pizza-api/.env dist/.env

# Подхватить переменные из apps/pizza-api/.env для процесса (порт MODE и т.д.)
set -a
. ./apps/pizza-api/.env
set +a

pm2 delete pizza-api 2>/dev/null || true
pm2 start dist/apps/pizza-api/main.js --name pizza-api --cwd /var/www/html/francesco-lucania-pizza

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
WorkingDirectory=/var/www/html/francesco-lucania-pizza
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=MODE=PROD
ExecStart=/usr/bin/node /var/www/html/francesco-lucania-pizza/dist/apps/pizza-api/main.js
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

Создайте файл **`apps/pizza-api/.env`** (на сервере — только с реальными секретами). После сборки копируйте его в **`dist/.env`**, чтобы `ConfigModule` подхватил файл (см. выше), либо задайте те же переменные в окружении `pm2` / systemd.

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

1. **Проверьте API сервер** (подставьте свой `PORT` из `.env`):

   ```bash
   curl "http://localhost:3000/api"
   # или: curl "http://localhost:${PORT}/api"
   ```

2. **Проверьте логи:**

   ```bash
   # Логи PM2
   pm2 logs pizza-api

   # Логи systemd
   sudo journalctl -u pizza-api -f
   ```

## Полный чеклист: pizza-api на сервере

Выполняйте из корня репозитория. Порт в `curl` должен совпадать с **`PORT`** в `apps/pizza-api/.env` (у вас может быть `5000`).

```bash
set -e
ROOT="/var/www/html/francesco-lucania-pizza"
cd "$ROOT"

git pull
npm ci

# Сборка
npx nx build pizza-api
test -f dist/apps/pizza-api/main.js

# Конфиг: копия для пути dist/.env + переменные в процессе
cp apps/pizza-api/.env dist/.env
set -a
. ./apps/pizza-api/.env
set +a

pm2 delete pizza-api 2>/dev/null || true
pm2 start dist/apps/pizza-api/main.js --name pizza-api --cwd "$ROOT"
pm2 save

# Проверка (подставьте свой PORT, например 3000 или 5000)
curl -sS -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:${PORT:-3000}/api"
```

**Nginx:** `proxy_pass` для `location /api/` должен указывать на тот же хост и порт, где слушает Nest (например `http://127.0.0.1:5000/api/` если `PORT=5000`). Пример в `nginx.conf.example` рассчитан на `3000` — при необходимости замените.

## Важные моменты

1. **Порт API**: задаётся **`PORT`** в `.env`; nginx должен проксировать на тот же порт
2. **Префикс API**: все HTTP-маршруты приложения под префиксом **`/api`**
3. **MongoDB**: Убедитесь, что MongoDB запущен и строка подключения в `.env` актуальна
4. **Статика**: корень проекта используется для папки **`static/`** (создаётся при старте при необходимости)
5. **CORS / MODE**: в проде **`MODE=PROD`**
6. **Firewall**: снаружи обычно открыты только 80/443; порт API — только для nginx

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

# Установите зависимости проекта (для сборки нужны devDependencies)
# Рекомендуется:
npm ci
```

**Важно для `pizza-store`:** используется **Next.js 16** — для `next build` официально нужен **Node.js ≥ 20.9.0**. Если у вас уже **`node -v` вроде `v20.19.5`**, с версией интерактивной оболочки всё в порядке; тогда **не ориентируйтесь на старые советы «просто обнови Node»**.

Частая путаница:

- Раньше в цепочке команд в `project.json` при **любом** падении `next build` могло всплывать сообщение про отсутствие **`standalone/server.js`**, хотя причина была другая (в т.ч. не Node). Сейчас пост-этап — **`node scripts/post-build-standalone.mjs`** (см. `apps/pizza-store/scripts/`), он ругается на отсутствие `server.js` **только после успешного** `next build`.
- Если в SSH **`node -v` ≥ 20.9**, а сборка из **cron, systemd, CI, другого пользователя** падает — проверьте там **`which node`** и **`node -v`**: часто подтягивается **другой** бинарник (старый `/usr/bin/node`, отсутствие nvm в неинтерактивной сессии и т.д.).

На **Node 18** Next 16 при сборке обычно явно пишет о несовместимой версии Node — это не надо путать с отсутствием `standalone` от **другой** ошибки.

### 1.2 Публичные URL перед сборкой (обязательно в проде)

Переменные **`NEXT_PUBLIC_*` подставляются в клиентский JS на этапе `next build`**. Если в `apps/pizza-store/.env` для разработки указаны `http://localhost:5000/...`, после сборки **в браузере пользователя** запросы уйдут на **localhost его компьютера**, а не на сервер: не загрузятся данные API и картинки из `/static/`, хотя HTML от nginx может открываться.

**Перед `nx build pizza-store` на сервере** задайте URL для клиента. Надёжнее всего **относительные пути** — одна и та же схема (http/https), что у страницы, без расхождений `http` vs `https`:

```bash
export NEXT_PUBLIC_API_URL="/api"
export NEXT_PUBLIC_STATIC_URL="/static/"
```

Либо полные URL **с той же схемой**, что у сайта, например только `http://…` или только `https://…` + при необходимости **`CORS_ORIGIN`** в `.env` у `pizza-api` (см. раздел Pizza API).

Убедитесь, что nginx проксирует **`/api`** и **`/static`** на ваш NestJS.

### 1.3 Соберите приложение

```bash
# Соберите Next.js приложение на сервере
npx nx build pizza-store
```

Билд создаёт `apps/pizza-store/.next/`. Для **`output: 'standalone'`** рабочий процесс **сам переключает `cwd`** на каталог с `server.js` под `.next/standalone/.../apps/pizza-store` и читает статику из **`.next/static` внутри этой папки**. Next **не копирует** туда чанки автоматически, поэтому таргет `nx build pizza-store` после успешного `next build` **копирует** `.next/static` и `public` в standalone (см. `apps/pizza-store/scripts/post-build-standalone.mjs` и `project.json`).

Точка входа после сборки ищется так (у вас может быть вложенный сегмент, например `standalone/francesco-lucania-pizza/apps/pizza-store`):

`find apps/pizza-store/.next/standalone -type f -path '*/apps/pizza-store/server.js'`

## Шаг 2: Настройка Node.js сервера

### 2.1 Запуск через PM2 (рекомендуется)

```bash
# Установите PM2 (если ещё не установлен)
npm install -g pm2

# Перейдите в репозиторий на сервере
cd /var/www/html/francesco-lucania-pizza

# Соберите на сервере (см. раздел 1.2 — NEXT_PUBLIC_* до сборки)
npx nx build pizza-store

SERVER_JS="$(find /var/www/html/francesco-lucania-pizza/apps/pizza-store/.next/standalone -type f -path '*/apps/pizza-store/server.js' 2>/dev/null | head -n 1)"
test -f "$SERVER_JS" || { echo "Нет server.js — сборка не прошла; выполните npx nx build pizza-store"; exit 1; }
test -d "$(dirname "$SERVER_JS")/.next/static/chunks" || { echo "Нет .next/static в standalone — проверьте project.json (post-build copy)"; exit 1; }

pm2 delete pizza-store 2>/dev/null || true
PORT=3001 NODE_ENV=production pm2 start "$SERVER_JS" --name pizza-store

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
# WorkingDirectory = каталог, где лежит server.js (путь может содержать francesco-lucania-pizza — проверьте find)
WorkingDirectory=/var/www/html/francesco-lucania-pizza/apps/pizza-store/.next/standalone/francesco-lucania-pizza/apps/pizza-store
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=NEXT_PUBLIC_API_URL=http://localhost:3000/api
ExecStart=/usr/bin/node server.js
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

## Полный чеклист: pizza-store на сервере (`/var/www/html/francesco-lucania-pizza`)

Копируйте блок целиком и выполняйте по порядку. Домен и URL замените на свои.

```bash
set -e
ROOT="/var/www/html/francesco-lucania-pizza"
cd "$ROOT"

# 1) Код
# Если мешает локальный next-env.d.ts:
# git checkout -- apps/pizza-store/next-env.d.ts
git pull

# 2) Зависимости
npm ci

# 3) Публичные URL для клиентского бандла (до сборки!)
export NEXT_PUBLIC_API_URL="https://francescolucania.com/api"
export NEXT_PUBLIC_STATIC_URL="https://francescolucania.com/static/"

# 4) Сборка (в project.json после next build копируются .next/static и public в standalone)
npx nx build pizza-store

# 5) Проверка артефактов
SERVER_JS="$(find "$ROOT/apps/pizza-store/.next/standalone" -type f -path '*/apps/pizza-store/server.js' | head -n 1)"
test -f "$SERVER_JS"
test -d "$(dirname "$SERVER_JS")/.next/static/chunks"

# 6) PM2 (полный путь к server.js — так надёжнее, чем node + cwd)
pm2 delete pizza-store 2>/dev/null || true
PORT=3001 NODE_ENV=production pm2 start "$SERVER_JS" --name pizza-store
pm2 save

# 7) Проверки
curl -sS -o /dev/null -w "root %{http_code}\n" http://127.0.0.1:3001/
CHUNK="$(ls "$(dirname "$SERVER_JS")/.next/static/chunks" | head -n 1)"
curl -sS -o /dev/null -w "chunk %{http_code}\n" "http://127.0.0.1:3001/_next/static/chunks/$CHUNK"
```

Дальше: nginx проксирует `location /` на `http://127.0.0.1:3001` и маршруты `/api`, `/static` — на ваш `pizza-api` (см. `nginx.conf.example`).

## Важные моменты

1. **Порт Next.js**: По умолчанию 3000, но рекомендуется использовать 3001, чтобы не конфликтовать с API
2. **Директория сборки**: `apps/pizza-store/.next/`
3. **Запуск в проде**: полный путь к `server.js` из `find …/standalone/…/apps/pizza-store/server.js`; в этой же папке после сборки должны быть `.next/static/` и `public/`
4. **Иначе будет 404 на `/_next/static`**: без копирования в standalone Next не находит чанки (см. автоматику в `project.json`)
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
│   └── (pizza-store собирается в ../apps/pizza-store/.next/)
```

Фронт магазина после сборки:

```
apps/pizza-store/
├── public/                 # исходники; после build копируются в standalone
└── .next/
    ├── static/             # исходный output; после build копируется в standalone
    └── standalone/
        └── apps/
            └── pizza-store/
                ├── server.js
                ├── public/          # копия для /img/...
                └── .next/
                    └── static/      # обязательно для /_next/static/...
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
ls -la apps/pizza-store/.next/standalone/apps/pizza-store/.next/static/chunks | head

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
