// pages/analytics/utils/sort.js
// Универсальная сортировка массива объектов по полям:
// - guest_name: строка, без учета регистра
// - total_amount: число
// - date: дата (ISO строка или Date)
export const sortItems = (arr, { by, dir }) => {
  const mult = dir === 'asc' ? 1 : -1;

  return arr.slice().sort((a, b) => {
    let av;
    let bv;

    if (by === 'guest_name') {
      av = String(a.guest_name || '').toLowerCase();
      bv = String(b.guest_name || '').toLowerCase();
      if (av < bv) return -1 * mult;
      if (av > bv) return 1 * mult;
      return 0;
    }

    if (by === 'total_amount') {
      av = Number(a.total_amount || 0);
      bv = Number(b.total_amount || 0);
      return (av - bv) * mult;
    }

    // По умолчанию сортируем по дате.
    const ad = a.date ? new Date(a.date).getTime() : 0;
    const bd = b.date ? new Date(b.date).getTime() : 0;
    return (ad - bd) * mult;
  });
};
