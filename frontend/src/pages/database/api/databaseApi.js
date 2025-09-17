// pages/database/api/databaseApi.js

// Базовый URL API берётся из ENV (Vite: VITE_API_URL).
// Ошибаемся раннее, если не настроен.
const API = import.meta.env.VITE_API_URL;
if (!API) {
  throw new Error('VITE_API_URL is not defined');
}

// Допустимые вкладки данных (таблицы)
export const TABS = Object.freeze({
  CHATS: 'chats',
  MESSAGES: 'messages',
  ORDERS: 'orders',
  RESERVATIONS: 'reservations',
});

/**
 * Собирает URL для списка (пагинация, поиск, фильтры).
 * @param {"chats"|"messages"|"orders"|"reservations"} tab
 * @param {{ page:number, pageSize:number, qValue?:string, filters?:object }} opts
 * @returns {string}
 */
export function buildListUrl(tab, { page, pageSize, qValue, filters }) {
  const offset = (page - 1) * pageSize;
  const params = new URLSearchParams({ limit: String(pageSize), offset: String(offset) });
  if (qValue) params.set('q', qValue);

  const f = filters || {};
  let path = '/chats';

  if (tab === TABS.MESSAGES) {
    path = '/messages';
    params.set('table', '1');
  } else if (tab === TABS.ORDERS) {
    path = '/orders';
    params.set('table', '1');
    if (f.platform) params.set('platform', f.platform);
    if (f.order_type) params.set('order_type', f.order_type);
    if (f.date_from) params.set('date_from', f.date_from);
    if (f.date_to) params.set('date_to', f.date_to);
    if (f.min_total !== '' && f.min_total !== null && f.min_total !== undefined) {
      params.set('min_total', String(f.min_total));
    }
    if (f.max_total !== '' && f.max_total !== null && f.max_total !== undefined) {
      params.set('max_total', String(f.max_total));
    }
  } else if (tab === TABS.RESERVATIONS) {
    path = '/reserves';
    params.set('table', '1');
    if (f.date_from) params.set('date_from', f.date_from);
    if (f.date_to) params.set('date_to', f.date_to);
    if (f.min_guests !== '' && f.min_guests !== null && f.min_guests !== undefined) {
      params.set('min_guests', String(f.min_guests));
    }
    if (f.max_guests !== '' && f.max_guests !== null && f.max_guests !== undefined) {
      params.set('max_guests', String(f.max_guests));
    }
  }

  return `${API}${path}?${params.toString()}`;
}

/**
 * Загружает строки списка с пагинацией.
 * Возвращает { items, total }, где total берётся из заголовка X-Total-Count или тела.
 */
export async function loadRows(tab, { page, pageSize, qValue, filters, signal }) {
  const url = buildListUrl(tab, { page, pageSize, qValue, filters });
  const res = await fetch(url, { signal, cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  const total = Number(res.headers.get('X-Total-Count') || data.total || 0);
  return { items: Array.isArray(data.items) ? data.items : [], total };
}

/**
 * Создаёт/обновляет запись.
 * tab управляет ресурсом, mode — "add" | "edit".
 * body — сериализуется в JSON.
 */
export async function saveRow(tab, mode, form, body, { signal } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const method = mode === 'add' ? 'POST' : 'PUT';
  let url = '';

  if (tab === TABS.CHATS) {
    url = mode === 'add' ? `${API}/chats` : `${API}/chats/${body.chat_id}`;
  } else if (tab === TABS.MESSAGES) {
    // добавление «сырого» сообщения — через /messages-raw
    url = mode === 'add' ? `${API}/messages-raw` : `${API}/messages/${form.id}`;
  } else if (tab === TABS.ORDERS) {
    url = mode === 'add' ? `${API}/orders` : `${API}/orders/${form.id}`;
  } else {
    // RESERVATIONS
    url = mode === 'add' ? `${API}/reserves` : `${API}/reserves/${form.id}`;
  }

  const res = await fetch(url, { method, headers, body: JSON.stringify(body), signal });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Save error (${res.status}): ${text || res.statusText}`);
  }
}

/**
 * Удаляет запись соответствующей таблицы.
 */
export async function deleteRow(tab, row, { signal } = {}) {
  let url = '';
  if (tab === TABS.CHATS) url = `${API}/chats/${row.chat_id}`;
  else if (tab === TABS.MESSAGES) url = `${API}/messages/${row.id}`;
  else if (tab === TABS.ORDERS) url = `${API}/orders/${row.id}`;
  else url = `${API}/reserves/${row.id}`;

  const res = await fetch(url, { method: 'DELETE', signal });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Delete error (${res.status}): ${text || res.statusText}`);
  }
}
