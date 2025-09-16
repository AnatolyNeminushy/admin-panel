// pages/analytics/utils/date.js
// Возвращает дату в формате ISO YYYY-MM-DD.
// При неверном значении — бросает ошибку, чтобы раньше поймать баги.
export const fmtISO = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) {
    throw new Error('fmtISO: invalid date');
  }
  return date.toISOString().slice(0, 10);
};

// Возвращает новую дату, сдвинутую на delta дней относительно исходной.
// Исходный объект Date не мутируется.
export const addDays = (date, delta) => {
  const base = date instanceof Date ? new Date(date.getTime()) : new Date(date);
  if (Number.isNaN(base.getTime())) {
    throw new Error('addDays: invalid date');
  }
  base.setDate(base.getDate() + Number(delta || 0));
  return base;
};
