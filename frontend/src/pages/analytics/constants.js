// pages/analytics/constants.js
// Пресеты периодов для фильтров/графиков.
// days: число суток от "сегодня" назад; null — спец.режим.
export const PRESETS = [
  { key: '1d', label: '1д', days: 1 },
  { key: '2d', label: '2д', days: 2 },
  { key: '7d', label: '7д', days: 7 },
  { key: '30d', label: '30д', days: 30 },
  { key: '90d', label: '90д', days: 90 },
  { key: 'all', label: 'Все', days: null },
  { key: 'custom', label: 'Период…', days: null },
];
