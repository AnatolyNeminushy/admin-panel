// pages/database/config/constants.js
// Заголовки вкладок интерфейса (UI-лейблы для табов)
export const TAB_TITLES = Object.freeze({
  chats: 'Чаты',
  messages: 'Сообщения',
  orders: 'Заказы',
  reservations: 'Брони',
});

// Схемы полей для CRUD-форм в каждой вкладке.
// ВАЖНО: ключи (key) используются логикой/БЭКом — не меняем.
// label — подпись на форме; type — вид ввода; options — допустимые значения.
export const schema = Object.freeze({
  chats: [
    { key: 'chat_id', label: 'ID чата', type: 'text' },                 // внешний ID клиента/чата
    { key: 'username', label: 'Юзернейм', type: 'text' },               // username при наличии
    { key: 'first_name', label: 'Имя', type: 'text' },
    { key: 'last_name', label: 'Фамилия', type: 'text' },
    { key: 'platform', label: 'Платформа', type: 'select', options: ['telegram', 'vk'] },
  ],
  messages: [
    { key: 'id', label: 'ID', type: 'number', readOnly: true },         // внутренний ID сообщения
    { key: 'chat_id', label: 'ID чата', type: 'number', required: true },
    { key: 'from_me', label: 'От оператора', type: 'checkbox' },        // признак исходящего сообщения
    { key: 'text', label: 'Сообщение', type: 'textarea', required: true },
    { key: 'date', label: 'Дата и время', type: 'datetime-local' },     // UTC/локаль — на стороне UI
  ],
  orders: [
    { key: 'id', label: 'ID', type: 'number', readOnly: true },         // внутренний ID заказа
    { key: 'tg_username', label: 'TG юзернейм', type: 'text' },         // идентификатор пользователя
    { key: 'name', label: 'Имя', type: 'text' },
    { key: 'phone', label: 'Телефон', type: 'text' },                   // формат/маска — на уровне UI
    { key: 'order_type', label: 'Тип заказа', type: 'text' },           // доставка/самовывоз и т.п.
    { key: 'date', label: 'Дата', type: 'date' },                       // дата исполнения
    { key: 'time', label: 'Время', type: 'text' },                      // временной слот/окно
    { key: 'address', label: 'Адрес', type: 'text' },
    { key: 'items', label: 'Состав заказа', type: 'textarea' },         // список позиций (человекочит.)
    { key: 'total', label: 'Сумма', type: 'number' },                   // сумма в основной валюте
    { key: 'comment', label: 'Комментарий', type: 'textarea' },
    { key: 'platform', label: 'Платформа', type: 'select', options: ['telegram', 'vk'], required: true },
  ],
  reservations: [
    { key: 'id', label: 'ID', type: 'number', readOnly: true },         // внутренний ID брони
    { key: 'tg_username', label: 'TG юзернейм', type: 'text' },
    { key: 'name', label: 'Имя', type: 'text' },
    { key: 'phone', label: 'Телефон', type: 'text' },
    { key: 'address', label: 'Адрес', type: 'text' },                   // адрес площадки/гостя (если нужно)
    { key: 'date', label: 'Дата', type: 'date' },
    { key: 'time', label: 'Время', type: 'text' },
    { key: 'guests', label: 'Гостей', type: 'number' },                 // количество персон
    { key: 'comment', label: 'Комментарий', type: 'textarea' },
    { key: 'platform', label: 'Платформа', type: 'select', options: ['telegram', 'vk'], required: true },
  ],
});
