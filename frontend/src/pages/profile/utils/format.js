// pages/profile/utils/format.js
/**
 * Форматирует дату/время для отображения.
 * Если дата невалидная или отсутствует — возвращает "—".
 */
export function fmtDateTime(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return Number.isNaN(d.valueOf()) ? '—' : d.toLocaleString();
}
