-- accounts: тестовый админ
insert into accounts (email, password_hash, full_name, role, is_active)
values ('admin@test', '$2b$10$X2FTl6c.pynWr4rLtXr0OuxSFGIljunNfP6TIJEfQ5qYkPACTik/6', 'Admin User', 'admin', true)
on conflict (email) do nothing;

-- chats: тестовый чат
insert into chats (chat_id, username, first_name, last_name, platform)
values (123456789, 'demo_user', 'Demo', 'User', 'telegram')
on conflict (chat_id) do nothing;

-- messages: тестовое сообщение
insert into messages (chat_id, from_me, text)
values (123456789, false, 'Hello from seed!');

-- orders: тестовый заказ
insert into orders (tg_username, name, phone, order_type, date, time, address, items, total, comment, platform)
values ('demo_user', 'Иван Иванов', '+79998887766', 'delivery', '2025-09-15', '18:00', 'ул. Ленина, д.1',
        'Суши сет, Ролл Филадельфия', 1200, 'Без васаби', 'telegram');

-- reservations: тестовая бронь
insert into reservations (tg_username, name, phone, address, date, time, guests, comment, platform)
values ('demo_user', 'Петр Петров', '+79995554433', 'ул. Советская, д.10', '2025-09-16', '20:00', 4,
        'Хотим столик у окна', 'telegram');
