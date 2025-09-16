// pages/profile/api/index.js
import api from '../../../services/api';

/**
 * Получает информацию о текущем пользователе.
 * Запрос: GET /auth/me
 * Возвращает: объект user или null, если не авторизован.
 * Ошибки: пробрасываются наверх (для обработки в хуке/компоненте).
 */
export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data?.user || null;
}
