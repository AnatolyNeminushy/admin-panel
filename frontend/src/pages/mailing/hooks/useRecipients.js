// pages/mailing/hooks/useRecipients.js
import { useState, useCallback } from 'react';
import { apiLoadRecipients } from '../api';

/**
 * Хук загрузки списка получателей рассылки.
 * Возвращает:
 *  - recipients: массив получателей
 *  - loadingRecipients: boolean — идёт ли загрузка
 *  - loadError: строка ошибки для UI
 *  - loadRecipients({ platformsObj, filters, limit }): загрузка по фильтрам
 *  - setRecipients: прямое обновление списка (например, после ручного выбора)
 */
export function useRecipients() {
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadRecipients = useCallback(
    async ({ platformsObj = {}, filters = {}, limit }) => {
      setLoadingRecipients(true);
      setLoadError('');

      try {
        // Преобразуем объект чекбоксов платформ в массив ключей (['tg', 'vk'])
        const platforms = Object.entries(platformsObj)
          .filter(([, v]) => v)
          .map(([k]) => k);

        if (platforms.length === 0) {
          setRecipients([]);
          setLoadError('Выберите хотя бы одну платформу (Telegram/VK).');
          return;
        }

        const data = await apiLoadRecipients({ platforms, filters, limit });
        setRecipients(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        setRecipients([]);
        setLoadError(e?.message || 'Ошибка загрузки списка');
      } finally {
        setLoadingRecipients(false);
      }
    },
    [],
  );

  return {
    recipients,
    setRecipients,
    loadingRecipients,
    loadError,
    loadRecipients,
  };
}
