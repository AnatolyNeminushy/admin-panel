// utils/platform.js

/**
 * Нормализация обозначения платформы к краткому коду.
 * Примеры входа: "tg", "telegram", "t.me", "vk", "vkontakte", "вк"
 * @param {string} p
 * @returns {'tg'|'vk'|string}
 */
const normalizePlatform = (p) => {
  const s = String(p || '').trim().toLowerCase();
  if (['tg', 'telegram', 't.me'].includes(s) || s.startsWith('tg')) return 'tg';
  if (['vk', 'vkontakte', 'вк'].includes(s)) return 'vk';
  return s;
};

/**
 * Набор вариантов, которые считаем эквивалентными для конкретной платформы.
 * Удобно для SQL where ... IN (...)
 * @param {string} p
 * @returns {string[]}
 */
const variantsFor = (p) => {
  const n = normalizePlatform(p);
  if (n === 'tg') return ['tg', 'telegram'];
  if (n === 'vk') return ['vk', 'vkontakte', 'вк'];
  return [n];
};

module.exports = { normalizePlatform, variantsFor };
