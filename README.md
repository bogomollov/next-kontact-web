# kontact-web-next

Описание: Современный корпоративный веб-мессенджер. Безопасные чаты и групповые обсуждения.

## Работа с базой данных

_Данные команды запускать из главной директории проекта_

### Во время разработки

Создание и применение миграции. Команда применит миграцию и сгенерирует Prisma Client

```bash
npx prisma migrate dev
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

### Перед развертыванием веб-приложения

1. Сгенерировать сертификат

```bash
(MSYS_NO_PATHCONV=1 для Git Bash) openssl req -x509 -newkey rsa:4096 -sha256 -nodes \
  -keyout nginx/key.pem \
  -out nginx/cert.pem \
  -days 365 \
  -subj "/CN=localhost"
```

2. Запустить Prisma Client в production-окружении

```bash
npx prisma generate
```

3. Применить миграции

```bash
npx prisma migrate deploy
```

4. Запуск веб-приложения

```
docker compose up
```
