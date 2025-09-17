Админ‑панель создана для Telegram‑бота (управление чатами, сообщениями, заказами и бронями).


---

```markdown
# Admin Panel Project

Full-stack РїСЂРѕРµРєС‚: **Frontend (React + Vite + TailwindCSS)** Рё **Backend (Node.js + Express + PostgreSQL)**.  
Р’РµСЃСЊ РїСЂРѕРµРєС‚ Р·Р°РїСѓСЃРєР°РµС‚СЃСЏ РѕРґРЅРѕР№ РєРѕРјР°РЅРґРѕР№ РІ **Docker** вЂ” РїРѕРґРЅРёРјР°СЋС‚СЃСЏ Р±Р°Р·Р°, СЃРµСЂРІРµСЂ Рё РєР»РёРµРЅС‚.

---

## рџљЂ РЎС‚РµРє

- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Dev Tools:** ESLint, Prettier, Docker

---

## рџ“‚ РЎС‚СЂСѓРєС‚СѓСЂР° РїСЂРѕРµРєС‚Р°

```

.
в”њв”Ђ frontend/                # РєР»РёРµРЅС‚СЃРєР°СЏ С‡Р°СЃС‚СЊ (Vite + React + Tailwind)
в”њв”Ђ backend/                 # СЃРµСЂРІРµСЂ (Express + pg)
в”‚  в””в”Ђ db/
в”‚     в””в”Ђ init/              # init-СЃРєСЂРёРїС‚С‹ PostgreSQL (СЃРѕР·РґР°РЅРёРµ СЃС…РµРјС‹ Рё СЃРёРґС‹)
в”‚        в”њв”Ђ 01\_schema.sql
в”‚        в””в”Ђ 02\_seed.sql
в”њв”Ђ docker-compose.yml       # РѕРїРёСЃР°РЅС‹ РєРѕРЅС‚РµР№РЅРµСЂС‹ (db + backend + frontend)
в”њв”Ђ .gitignore
в”њв”Ђ .prettierrc
в”њв”Ђ .editorconfig
в”њв”Ђ LICENSE
в””в”Ђ README.md

````

---

## рџ”§ Р‘С‹СЃС‚СЂС‹Р№ СЃС‚Р°СЂС‚

### 1) РџРѕРґРіРѕС‚РѕРІРєР°
- РЈСЃС‚Р°РЅРѕРІРёС‚Рµ **Docker Desktop**: https://www.docker.com/products/docker-desktop
- РЈСЃС‚Р°РЅРѕРІРёС‚Рµ **Git**: https://git-scm.com

### 2) РљР»РѕРЅРёСЂРѕРІР°РЅРёРµ РїСЂРѕРµРєС‚Р°
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
````

### 3) Р—Р°РїСѓСЃРє РІСЃРµС… СЃРµСЂРІРёСЃРѕРІ

```bash
docker compose up -d
```

Р‘СѓРґСѓС‚ РїРѕРґРЅСЏС‚С‹ РєРѕРЅС‚РµР№РЅРµСЂС‹:

* **db** (PostgreSQL) в†’ `localhost:5432`
* **backend** (Express API) в†’ `http://localhost:5000`
* **frontend** (React) в†’ `http://localhost:3000`

РЎРєСЂРёРїС‚С‹ РІ `backend/db/init/*` РІС‹РїРѕР»РЅСЏСЋС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё:

* СЃРѕР·РґР°СЋС‚СЃСЏ С‚Р°Р±Р»РёС†С‹: `accounts`, `chats`, `messages`, `orders`, `reservations`
* РґРѕР±Р°РІР»СЏСЋС‚СЃСЏ С‚РµСЃС‚РѕРІС‹Рµ РґР°РЅРЅС‹Рµ

---

## рџ§Є РўРµСЃС‚РѕРІС‹Рµ РґР°РЅРЅС‹Рµ

Р’ Р±Р°Р·Рµ СѓР¶Рµ РµСЃС‚СЊ:

* **accounts**: `admin@test` (СЂРѕР»СЊ `admin`, РїР°СЂРѕР»СЊ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ `admin123`)
* **chats**: С‚РµСЃС‚РѕРІС‹Р№ Telegram-С‡Р°С‚
* **messages**: РѕРґРЅРѕ С‚РµСЃС‚РѕРІРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ
* **orders**: Р·Р°РєР°Р· (`total = 1200`)
* **reservations**: Р±СЂРѕРЅСЊ РЅР° 4 РіРѕСЃС‚РµР№

### РЎРѕР·РґР°РЅРёРµ РїР°СЂРѕР»СЏ РґР»СЏ Р°РєРєР°СѓРЅС‚Р°

РЎРіРµРЅРµСЂРёСЂСѓР№С‚Рµ С…СЌС€:

```bash
docker compose exec backend node utils/make-hash.js
```

РЎРєСЂРёРїС‚ РІС‹РІРµРґРµС‚ С…СЌС€ РґР»СЏ РїР°СЂРѕР»СЏ (РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ `"admin123"` вЂ” РјРѕР¶РЅРѕ РїРѕРјРµРЅСЏС‚СЊ РІРЅСѓС‚СЂРё СЃРєСЂРёРїС‚Р°).

Р”РѕР±Р°РІСЊС‚Рµ Р°РєРєР°СѓРЅС‚:

```sql
INSERT INTO accounts (email, password_hash, role)
VALUES ('admin@example.com', '$2a$10$....', 'admin');
```

вљ пёЏ РџР°СЂРѕР»Рё РІСЃРµРіРґР° С…СЂР°РЅСЏС‚СЃСЏ С‚РѕР»СЊРєРѕ РІ РІРёРґРµ С…СЌС€Р°.

---

## рџ”Њ РџСЂРёРјРµСЂС‹ API

* **Healthcheck Р‘Р”**
  `GET /api/health/db` в†’ `{ ok: true, now: "2025-09-15T..." }`

* **Р—Р°РєР°Р·С‹**
  `GET /api/orders` в†’ СЃРїРёСЃРѕРє Р·Р°РєР°Р·РѕРІ
  `GET /api/orders/:id` в†’ РѕРґРёРЅ Р·Р°РєР°Р·
  `POST /api/orders` в†’ СЃРѕР·РґР°С‚СЊ Р·Р°РєР°Р·

* **Р‘СЂРѕРЅРё**
  `GET /api/reservations` в†’ СЃРїРёСЃРѕРє Р±СЂРѕРЅРµР№
  `GET /api/reservations/:id` в†’ РѕРґРЅР° Р±СЂРѕРЅСЊ
  `POST /api/reservations` в†’ СЃРѕР·РґР°С‚СЊ Р±СЂРѕРЅСЊ

---

## рџђі РџРѕР»РµР·РЅС‹Рµ Docker-РєРѕРјР°РЅРґС‹

* Р›РѕРіРё РІСЃРµС… СЃРµСЂРІРёСЃРѕРІ:
  `docker compose logs -f`
* Р›РѕРіРё С‚РѕР»СЊРєРѕ Р‘Р”:
  `docker compose logs -f db`
* Р’РѕР№С‚Рё РІ psql:
  `docker exec -it local_pg psql -U dev_user -d dev_db`
* РџРѕР»РЅР°СЏ РѕС‡РёСЃС‚РєР°:
  `docker compose down -v && docker compose up -d`

---

## рџ”ђ РџСЂРѕРґР°РєС€РЅ РѕРєСЂСѓР¶РµРЅРёРµ

Р¤Р°Р№Р» `backend/.env.production` **РЅРµ РєРѕРјРјРёС‚РёС‚СЃСЏ**.
РџСЂРёРјРµСЂ:

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

## рџ“њ Р›РёС†РµРЅР·РёСЏ

РџСЂРѕРµРєС‚ СЂР°СЃРїСЂРѕСЃС‚СЂР°РЅСЏРµС‚СЃСЏ РїРѕРґ Р»РёС†РµРЅР·РёРµР№ **MIT** вЂ” СЃРј. С„Р°Р№Р» [LICENSE](./LICENSE).


