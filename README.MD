# Admin Panel

Админ‑панель для Telegram‑бота: управление чатами, сообщениями, заказами и бронями. Фронтенд (React/Vite) + бекенд (Node.js/Express) + PostgreSQL.

## Быстрый старт (Docker Compose)

1) Установите Docker Desktop и Docker Compose
2) Запустите

docker compose up -d

После старта:
- Фронтенд: http://localhost:3000
- API: http://localhost:5000
- База данных: localhost:5432 (см. docker-compose.yml для логинов)

Фронтенд ходит к API по относительному пути /api (Nginx внутри контейнера проксирует на ackend:5000).

## Назначение разделов

- Chats — список чатов (tg/vk)
- Messages — сообщения
- Orders — заказы
- Reservations — брони

## Примечания

- В проде и в Docker отключено кэширование ответов API, настроены SSE‑события для «живых» обновлений.
- Параметр VITE_API_URL в сборке фронта выставлен в /api через build‑args.
