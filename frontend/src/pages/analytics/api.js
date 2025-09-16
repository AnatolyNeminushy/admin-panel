// pages/analytics/api.js
// Базовый URL API из .env (VITE_API_URL)
const API = import.meta.env.VITE_API_URL;

/**
 * Получает агрегированные данные для графика по активной вкладке (orders/reserves и т.д.)
 * Параметры периода: from, to (YYYY-MM-DD) или preset === "all".
 */
export async function fetchChart(activeTab, { from, to, preset }) {
  const qs = new URLSearchParams();
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  if (preset === 'all') qs.set('all', '1');

  const res = await fetch(`${API}/stat/${encodeURIComponent(activeTab)}-by-day?${qs}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Возвращает глобальные показатели дашборда:
 * - количество заказов и бронирований
 * - сумма заказов
 * - средний чек и максимум за день
 */
export async function fetchGlobalStats() {
  const [orders, reserves, ordersSum, extra] = await Promise.all([
    fetch(`${API}/stat/orders`).then((r) => r.json()),
    fetch(`${API}/stat/reserves`).then((r) => r.json()),
    fetch(`${API}/stat/orders-sum`).then((r) => r.json()),
    fetch(`${API}/stat/orders-extra`).then((r) => r.json()),
  ]);

  return {
    orders: Number(orders?.count || 0),
    reserves: Number(reserves?.count || 0),
    ordersSum: Number(ordersSum?.sum || 0),
    avg: Number(extra?.avg || 0),
    maxDay: Number(extra?.maxDay || 0),
  };
}

/**
 * Возвращает список заказов (ограничение limit).
 * Ответ нормализуется в массив: [] по умолчанию.
 */
export async function fetchOrders(limit = 1000) {
  const res = await fetch(`${API}/orders?limit=${encodeURIComponent(String(limit))}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data?.items) ? data.items : [];
}

/**
 * Возвращает список бронирований (ограничение limit).
 * Ответ нормализуется в массив: [] по умолчанию.
 */
export async function fetchReserves(limit = 1000) {
  const res = await fetch(`${API}/reserves?limit=${encodeURIComponent(String(limit))}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data?.items) ? data.items : [];
}
