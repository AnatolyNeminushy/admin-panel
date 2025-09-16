// pages/chats/utils/chatUtils.js

/**
 * Получение времени последнего обновления диалога.
 * Проверяет разные возможные поля объекта диалога
 * (в зависимости от того, откуда пришли данные).
 *
 * @param {object} dlg - объект диалога/чата
 * @returns {number} timestamp (ms) или 0, если данных нет
 */
export const getDialogTimestamp = (dlg) => {
  const source =
    dlg?.last_ts ||
    dlg?.last_message_date ||
    dlg?.lastMessageAt ||
    dlg?.updated_at ||
    dlg?.updatedAt ||
    dlg?.last_activity ||
    dlg?.lastActivity ||
    dlg?.lastMessage?.date ||
    null;

  const timestamp = source ? new Date(source).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

/**
 * Проверка: подходит ли диалог под локальный поиск.
 * Ищет совпадение введённого терма в username, имени, фамилии или chat_id.
 *
 * @param {object} dlg - объект диалога/чата
 * @param {string} term - строка поиска
 * @returns {boolean} true, если совпадает или term пустой
 */
export const matchesLocal = (dlg, term) => {
  if (!term) return true;

  const query = term.toLowerCase();

  return (
    String(dlg.username || '').toLowerCase().includes(query) ||
    String(dlg.first_name || '').toLowerCase().includes(query) ||
    String(dlg.last_name || '').toLowerCase().includes(query) ||
    String(dlg.chat_id || '').toLowerCase().includes(query)
  );
};
