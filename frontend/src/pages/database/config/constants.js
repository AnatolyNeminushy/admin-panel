// Заголовки вкладок
export const TAB_TITLES = {
  chats: "Чаты",
  messages: "Сообщения",
  orders: "Заказы",
  reservations: "Брони",
};

// Схемы форм (ключи НЕ меняем, только подписи/типы)
export const schema = {
  chats: [
    { key: "chat_id", label: "ID чата", type: "text" },
    { key: "username", label: "Юзернейм", type: "text" },
    { key: "first_name", label: "Имя", type: "text" },
    { key: "last_name", label: "Фамилия", type: "text" },
    { key: "platform", label: "Платформа", type: "select", options: ["telegram", "vk"] },
  ],
  messages: [
    { key: "id", label: "ID", type: "number", readOnly: true },
    { key: "chat_id", label: "ID чата", type: "number", required: true },
    { key: "from_me", label: "От оператора", type: "checkbox" },
    { key: "text", label: "Сообщение", type: "textarea", required: true },
    { key: "date", label: "Дата и время", type: "datetime-local" },
  ],
  orders: [
    { key: "id", label: "ID", type: "number", readOnly: true },
    { key: "tg_username", label: "TG юзернейм", type: "text" },
    { key: "name", label: "Имя", type: "text" },
    { key: "phone", label: "Телефон", type: "text" },
    { key: "order_type", label: "Тип заказа", type: "text" },
    { key: "date", label: "Дата", type: "date" },
    { key: "time", label: "Время", type: "text" },
    { key: "address", label: "Адрес", type: "text" },
    { key: "items", label: "Состав заказа", type: "textarea" },
    { key: "total", label: "Сумма", type: "number" },
    { key: "comment", label: "Комментарий", type: "textarea" },
    { key: "platform", label: "Платформа", type: "select", options: ["telegram","vk"], required: true },
  ],
  reservations: [
    { key: "id", label: "ID", type: "number", readOnly: true },
    { key: "tg_username", label: "TG юзернейм", type: "text" },
    { key: "name", label: "Имя", type: "text" },
    { key: "phone", label: "Телефон", type: "text" },
    { key: "address", label: "Адрес", type: "text" },
    { key: "date", label: "Дата", type: "date" },
    { key: "time", label: "Время", type: "text" },
    { key: "guests", label: "Гостей", type: "number" },
    { key: "comment", label: "Комментарий", type: "textarea" },
    { key: "platform", label: "Платформа", type: "select", options: ["telegram","vk"], required: true },
  ],
};
