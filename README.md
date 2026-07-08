<div align="center">
<h1>Next Kontact Web</h1>
<p align="center">Современный корпоративный веб-мессенджер. Безопасные чаты и групповые обсуждения</p>
</div>

## Начало работы

1. Клонировать репозиторий

```bash
git clone https://github.com/bogomollov/next-kontact-web
cd next-kontact-web
```

2. Установить зависимости (npm workspaces: `frontend`, `backend`, `packages/*`)

```bash
npm install
```

3. Настроить переменные окружения

Ни один из `.env*` файлов, кроме `.env.example`, не хранится в репозитории. Скопировать `.env.example` и заполнить значения перед первым запуском:

| Файл | Когда используется |
|---|---|
| `.env` | Запуск вне Docker, backend читает его из корня проекта, `DATABASE_URL`/`REDIS_URL` должны указывать на `127.0.0.1` |
| `.env.dev` | Docker, dev-режим (`docker-compose.dev.yml`) — сервисы обращаются друг к другу по именам `pgsql`/`redis`/`backend` |
| `.env.prod` | Docker, production-режим (`docker-compose.yml`) |

## Запуск проекта

### Через Docker

**Dev-режим.** Postgres, Redis, backend и frontend поднимаются в контейнерах с hot-reload (bind mount исходников), порты проброшены на хост. Nginx отключен (профиль `disabled`) — фронтенд и бэкенд доступны напрямую:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Postgres: `127.0.0.1:5432`
- Redis: `127.0.0.1:6379`

Миграции и заполнение БД тестовыми данными применяются автоматически при старте backend-контейнера.

**Production-режим.** Полный стек за nginx (единственная точка входа, порт 80) — Postgres, Redis, backend и frontend недоступны снаружи контейнерной сети:

```bash
docker compose --env-file .env.prod up --build -d
```

### Без Docker

Требуются доступные Postgres и Redis. Проще всего поднять только их через Docker, оставив само приложение на хосте:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d pgsql redis
```

Затем в `.env` в корне проекта указать `DATABASE_URL`/`REDIS_URL` на `127.0.0.1` (см. комментарии в `.env.example`), применить миграции и заполнить БД:

```bash
npx prisma migrate dev
npx prisma db seed
```

Запустить frontend и backend одновременно:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

## Работа с базой данных

_Команды запускать из главной директории проекта. Актуально при работе вне Docker — в Docker миграции и заполнение БД выполняются автоматически при старте контейнеров._

Создание и применение миграции. Команда применит миграцию и сгенерирует Prisma Client

```bash
npx prisma migrate dev
```

Применение уже существующих миграций без создания новой (production)

```bash
npx prisma migrate deploy
```

Ручная генерация Prisma Client

```bash
npx prisma generate
```

Заполнение базы данных тестовыми данными

```bash
npx prisma db seed
```

Использование Prisma Studio

```bash
npx prisma studio
```

## Стек технологий

**Frontend**
- Next.js 15 (App Router, Turbopack) + React 19
- TypeScript, Tailwind CSS 4
- SWR for client-side data fetching/caching
- zod, react-icons, emoji-picker-react
- ESLint, Prettier (prettier-plugin-tailwindcss)

**Backend**
- Express.js
- Prisma 6 ORM over PostgreSQL
- Redis
- WebSocket server
- jose, bcrypt-ts, zod
- multer + sharp, cors, cookie-parser

## Лицензия

Copyright (c) 2026-present Bogdan Bogomolov<br>

Проект распространяется под лицензией MIT. Дополнительную информацию см. в [LICENSE](LICENSE)
