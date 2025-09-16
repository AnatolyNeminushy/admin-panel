// utils/period.js

/**
 * Ограничивает число в заданном диапазоне.
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const clampDays = (n, min, max) => Math.max(min, Math.min(max, n));

/**
 * Текущая дата в формате YYYY-MM-DD (UTC).
 * @returns {string}
 */
const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Сдвиг ISO-даты на указанное число дней (UTC).
 * @param {string} iso - 'YYYY-MM-DD'
 * @param {number} delta - положительное или отрицательное число дней
 * @returns {string} - 'YYYY-MM-DD'
 */
const addDaysISO = (iso, delta) => {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
};

/**
 * Вычисляет безопасный период дат на основании query-параметров:
 *  - ?from=YYYY-MM-DD
 *  - ?to=YYYY-MM-DD (если не задан, берётся сегодня)
 *  - ?all=1        (игнорирует ограничение по длине диапазона)
 *
 * По умолчанию возвращает 14 дней (to и 13 дней до него).
 * Длина диапазона клампится в [1, 366].
 *
 * @param {import('express').Request} req
 * @returns {{ from: string, to: string }}
 */
exports.getRange = (req) => {
  let { from, to, all } = req.query;
  const today = todayISO();
  if (!to) to = today;

  // Режим "всё время": если from не задан — берём минимально возможную дату.
  if (all === '1') {
    if (!from) from = '1970-01-01';
    return { from, to };
    // Без клампа — фронту отдаются все доступные данные.
  }

  // Базовый период: последние 14 дней (to и 13 дней назад)
  if (!from) from = addDaysISO(to, -13);

  // Вычисляем длину периода и клампим до безопасных границ
  const diffDays = Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
  const safe = clampDays(diffDays, 1, 366);

  // Если диапазон больше безопасного — сдвигаем from ближе к to
  if (diffDays !== safe) from = addDaysISO(to, -(safe - 1));

  return { from, to };
};
