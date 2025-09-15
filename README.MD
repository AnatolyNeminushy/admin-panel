Вот обновлённый README с добавлением про создание хэша пароля для аккаунта. Я вставил это в раздел с тестовыми данными, чтобы сразу было понятно, где и как работать с таблицей `accounts`.

---

```markdown
# Admin Panel Project

Full-stack проект: **Frontend (React + Vite + TailwindCSS)** и **Backend (Node.js + Express + PostgreSQL)**.  
Для быстрого запуска есть локальная база данных в **Docker** с тестовыми таблицами и сид-данными.

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
├─ docker-compose.yml       # локальная БД через Docker
├─ .gitignore
├─ .prettierrc
├─ .editorconfig
├─ LICENSE
└─ README.md

````

---

## 🔧 Быстрый старт (локально)

### 1) Подготовка
- Установите **Node.js LTS**: https://nodejs.org
- Установите **Docker Desktop**: https://www.docker.com/products/docker-desktop

### 2) Клонирование
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
````

### 3) Запуск базы данных (Docker)

```bash
docker compose up -d db
```

Это поднимет PostgreSQL на `localhost:5432` и автоматически выполнит скрипты из `backend/db/init/*`:

* создаст таблицы: `accounts`, `chats`, `messages`, `orders`, `reservations`
* зальёт тестовые данные (сиды)

### 4) Настройка переменных окружения (backend)

```bash
cd backend
cp .env.example .env
```

В `.env.example` уже прописаны значения для локальной БД:

```
PGHOST=localhost
PGUSER=dev_user
PGPASSWORD=dev_password
PGDATABASE=dev_db
PGPORT=5432
PGSSLMODE=disable
```

### 5) Запуск backend

```bash
cd backend
npm install
npm run dev
```

Backend по умолчанию поднимется на: `http://localhost:5000`

### 6) Запуск frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend по умолчанию будет доступен на: `http://localhost:3000`

---

## 🧪 Тестовые данные (сиды)

В локальной БД уже есть:

* **accounts**: `admin@example.com` (роль `admin`, пароль нужно задать вручную)
* **chats**: `chat_id = 123456789`, `username = demo_user`, `platform = telegram`
* **messages**: одно тестовое сообщение
* **orders**: один тестовый заказ (`total = 1200`)
* **reservations**: одно тестовое бронирование (`guests = 4`)

Добавление аккаунта с паролем

Сгенерируйте хэш с помощью встроенного скрипта:

node backend/utils/make-hash.js


Он выведет хэш для пароля (по умолчанию "admin123", можешь заменить внутри скрипта на свой пароль).

**Вставьте результат в таблицу accounts:**
`INSERT INTO accounts (email, password_hash, role)`
`VALUES ('admin@example.com', '$2a$10$....', 'admin');`


⚠️ Пароли никогда не хранятся в открытом виде, только в виде хэша.
---

## 🔌 Примеры API (backend)

* **Healthcheck БД**:
  `GET /api/health/db` → `{ ok: true, now: "2025-09-15T..." }`

* **Заказы**:
  `GET /api/orders` → список заказов
  `GET /api/orders/:id` → один заказ
  `POST /api/orders` → создать заказ

* **Брони**:
  `GET /api/reservations` → список броней
  `GET /api/reservations/:id` → одна бронь
  `POST /api/reservations` → создать бронь

---

## 🧰 Инструменты разработчика

* **Prettier** — автоформатирование
* **EditorConfig** — единый стиль редактора
* **ESLint** — линтинг кода

---

## 🐳 Docker подсказки

* Логи БД: `docker compose logs -f db`
* Войти в psql:
  `docker exec -it local_pg psql -U dev_user -d dev_db`
* Полная очистка:
  `docker compose down -v && docker compose up -d db`

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

```

---

Хочешь, я ещё добавлю отдельный блок «🔑 Управление аккаунтами» с инструкциями для добавления, смены и удаления пользователей (SQL + примеры команд)?
```
