// pages/database/utils/format.js
// Преобразует значение даты/времени в локализованную строку.
// Возвращает «—» для пустых или невалидных значений.
export const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  // isNaN(Date) → защита от некорректных значений (например, пустая строка)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
};
