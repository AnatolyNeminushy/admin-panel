// services/api.js
/**
 * Axios-инстанс для HTTP-запросов к бэкенду.
 * Базовый URL берётся из VITE_API_URL.
 * Если в localStorage есть токен — добавляет Authorization: Bearer <token>.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (!token) return config;

  // Возвращаем новый объект headers, не перетирая существующие поля
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };
});

export default api;
