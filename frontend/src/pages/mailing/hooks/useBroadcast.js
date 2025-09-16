// pages/mailing/hooks/useBroadcast.js
import { useState, useCallback } from 'react';
import { apiStartBroadcast } from '../api';

/**
 * Хук для запуска рассылки и отслеживания прогресса.
 * Возвращает:
 *  - isSending: boolean — идёт ли отправка сейчас
 *  - progress: объект статуса (total/sent/failed/items/error)
 *  - setProgress: ручное обновление прогресса (например, для сброса)
 *  - handleSend(payload): запускает рассылку через API
 */
export function useBroadcast() {
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(null);

  const handleSend = useCallback(async (payload) => {
    setIsSending(true);
    // Начальное состояние прогресса на время запроса
    setProgress({ total: 0, sent: 0, failed: 0, items: [] });

    try {
      // Запуск рассылки; сервер возвращает актуальный прогресс
      const data = await apiStartBroadcast(payload);
      setProgress(data);
    } catch (e) {
      // Сообщение об ошибке в том же объекте прогресса
      setProgress((p) => ({ ...(p || {}), error: e?.message || 'Ошибка сети' }));
    } finally {
      setIsSending(false);
    }
  }, []);

  return { isSending, progress, setProgress, handleSend };
}
