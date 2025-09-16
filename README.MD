
---

```markdown
# Admin Panel Project

Full-stack проект: **Frontend (React + Vite + TailwindCSS)** и **Backend (Node.js + Express + PostgreSQL)**.  
Весь проект запускается одной командой в **Docker** — поднимаются база, сервер и клиент.

---

## 🚀 Стек

- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Dev Tools:** ESLint, Prettier, Docker

---

## 📂 Структура проекта

```

.
├─ frontend/                # клиентская часть (Vite + React + Tailwind)
├─ backend/                 # сервер (Express + pg)
│  └─ db/
│     └─ init/              # init-скрипты PostgreSQL (создание схемы и сиды)
│        ├─ 01\_schema.sql
│        └─ 02\_seed.sql
├─ docker-compose.yml       # описаны контейнеры (db + backend + frontend)
├─ .gitignore
├─ .prettierrc
├─ .editorconfig
├─ LICENSE
└─ README.md

````

---

## 🔧 Быстрый старт

### 1) Подготовка
- Установите **Docker Desktop**: https://www.docker.com/products/docker-desktop
- Установите **Git**: https://git-scm.com

### 2) Клонирование проекта
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
````

### 3) Запуск всех сервисов

```bash
docker compose up -d
```

Будут подняты контейнеры:

* **db** (PostgreSQL) → `localhost:5432`
* **backend** (Express API) → `http://localhost:5000`
* **frontend** (React) → `http://localhost:3000`

Скрипты в `backend/db/init/*` выполняются автоматически:

* создаются таблицы: `accounts`, `chats`, `messages`, `orders`, `reservations`
* добавляются тестовые данные

---

## 🧪 Тестовые данные

В базе уже есть:

* **accounts**: `admin@test` (роль `admin`, пароль по умолчанию admin123)
* **chats**: тестовый Telegram-чат
* **messages**: одно тестовое сообщение
* **orders**: заказ (`total = 1200`)
* **reservations**: бронь на 4 гостей

### Создание пароля для аккаунта

Сгенерируйте хэш:

```bash
docker compose exec backend node utils/make-hash.js
```

Скрипт выведет хэш для пароля (по умолчанию `"admin123"` — можно поменять внутри скрипта).

Добавьте аккаунт:

```sql
INSERT INTO accounts (email, password_hash, role)
VALUES ('admin@example.com', '$2a$10$....', 'admin');
```

⚠️ Пароли всегда хранятся только в виде хэша.

---

## 🔌 Примеры API

* **Healthcheck БД**
  `GET /api/health/db` → `{ ok: true, now: "2025-09-15T..." }`

* **Заказы**
  `GET /api/orders` → список заказов
  `GET /api/orders/:id` → один заказ
  `POST /api/orders` → создать заказ

* **Брони**
  `GET /api/reservations` → список броней
  `GET /api/reservations/:id` → одна бронь
  `POST /api/reservations` → создать бронь

---

## 🐳 Полезные Docker-команды

* Логи всех сервисов:
  `docker compose logs -f`
* Логи только БД:
  `docker compose logs -f db`
* Войти в psql:
  `docker exec -it local_pg psql -U dev_user -d dev_db`
* Полная очистка:
  `docker compose down -v && docker compose up -d`

---

## 🔐 Продакшн окружение

Файл `backend/.env.production` **не коммитится**.
Пример:

```
PGHOST=prod-host.example.com
PGUSER=prod_user
PGPASSWORD=prod_password
PGDATABASE=prod_db
PGPORT=5432
PGSSLMODE=verify-full
JWT_SECRET=very_strong_random_secret
JWT_EXPIRES=12h
```

---

## 📜 Лицензия

Проект распространяется под лицензией **MIT** — см. файл [LICENSE](./LICENSE).

