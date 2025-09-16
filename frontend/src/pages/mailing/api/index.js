// pages/mailing/api/index.js

// Базовый URL API считывается из .env (Vite): VITE_API_URL
// Пример: https://api.example.com/api
const API = import.meta.env.VITE_API_URL;

/**
 * Универсальный fetch с:
 *  - чтением текстового ответа
 *  - попыткой распарсить JSON
 *  - пробросом понятной ошибки
 */
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const raw = await res.text();

  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    // сервер вернул не-JSON — пробрасываем первые 200 символов
    throw new Error(data?.error || raw?.slice(0, 200) || 'Некорректный ответ сервера');
  }

  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

/**
 * Загрузка получателей рассылки по фильтрам.
 * @param {{ platforms: string[], filters: object, limit?: number }} params
 * @returns {Promise<any>}
 */
export async function apiLoadRecipients({ platforms, filters, limit = 500 }) {
  const params = new URLSearchParams({
    platforms: (platforms || []).join(','),
    filters: JSON.stringify(filters || {}),
    limit: String(limit),
  });

  // следим за двойными слэшами: `${API}/broadcasts/...`
  return fetchJSON(`${API}/broadcasts/recipients?${params.toString()}`);
}

/**
 * Старт рассылки.
 * @param {object} payload — тело запроса (заголовок/текст/медиа/режим/выборка)
 * @returns {Promise<any>}
 */
export async function apiStartBroadcast(payload) {
  return fetchJSON(`${API}/broadcasts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
}
