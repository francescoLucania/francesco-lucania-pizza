# Дамп БД с прода → локальная MongoDB

Ручной сценарий: SSH с паролем, без ключей и без `config.sh`.

**Прод:** MongoDB в Docker (`mongo`), репозиторий `/var/www/html/francesco-lucania-pizza`, БД `pizza-db`.  
**Локально:** MongoDB на `mongodb://127.0.0.1:27017`, нужны `mongorestore` и `mongosh`.

---

## 1. Дамп на сервере

Подключитесь по SSH и выполните всё в одной сессии:

```bash
ssh user@your-server.example.com

cd /var/www/html/francesco-lucania-pizza

STAMP=$(date +%Y%m%d-%H%M%S)
REMOTE_DUMP="/tmp/pizza-dump-${STAMP}"

bash scripts/db/remote-docker-dump.sh \
  mongo \
  apps/pizza-api/.env \
  pizza-db \
  "${REMOTE_DUMP}"

echo "STAMP=${STAMP}"
echo "Дамп: ${REMOTE_DUMP}/pizza-db"

exit
```

Запомните значение `STAMP` из вывода — оно понадобится на следующих шагах.

Если контейнер MongoDB называется не `mongo`, подставьте своё имя (`docker ps`).

---

## 2. Скачать дамп на локальную машину

Из корня репозитория на **вашем компьютере** (снова введёте SSH-пароль):

```bash
STAMP=20250625-143000   # подставьте свой STAMP

mkdir -p ".db-dumps/prod-${STAMP}"
scp -r "user@your-server.example.com:/tmp/pizza-dump-${STAMP}/pizza-db" \
  ".db-dumps/prod-${STAMP}/"
```

---

## 3. Удалить временные файлы на сервере

```bash
ssh user@your-server.example.com "rm -rf /tmp/pizza-dump-${STAMP}"
```

---

## 4. Восстановить в локальную БД

**Внимание:** локальная БД `pizza-db` будет полностью перезаписана (`--drop`).

```bash
STAMP=20250625-143000   # тот же STAMP

mongorestore \
  --uri="mongodb://127.0.0.1:27017" \
  --db="pizza-db" \
  --drop \
  ".db-dumps/prod-${STAMP}/pizza-db"

mongosh "mongodb://127.0.0.1:27017/pizza-db" --eval "db.getCollectionNames()"
```

В `apps/pizza-api/.env` локально должно быть:

```bash
DATABASE_URL=mongodb://127.0.0.1:27017/pizza-db
```

Запуск API:

```bash
npm run serve backend
```

---

## Если что-то пошло не так

| Проблема                       | Решение                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `Контейнер не запущен: mongo`  | На сервере: `docker ps`, проверьте имя контейнера                                                  |
| `Нет docker-mongo-tools.mjs`   | На сервере в репозитории: `git pull`                                                               |
| Ошибка аутентификации MongoDB  | Проверьте `DATABASE_URL` или `DATABASE_LOGIN` / `DATABASE_PASS` в `apps/pizza-api/.env` на сервере |
| `Локальный MongoDB недоступен` | Запустите MongoDB локально, проверьте `mongosh --eval "db.adminCommand({ ping: 1 })"`              |
