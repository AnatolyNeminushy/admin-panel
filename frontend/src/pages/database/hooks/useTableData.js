// pages/database/hooks/useTableData.js
import { useEffect, useMemo, useState } from 'react';
import { loadRows } from '../api/databaseApi';

// Хук для работы с данными таблицы: загрузка, вкладки, поиск, фильтры, пагинация.
export default function useTableData(initialTab = 'chats') {
  // Допустимые вкладки (контролируем внешний интерфейс)
  const tabs = ['chats', 'messages', 'orders', 'reservations'];

  // Текущая вкладка
  const [tab, setTab] = useState(initialTab);

  // Данные списка
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [refreshKey, bumpRefreshKey] = useState(0); // ключ для форс‑обновления данных

  // Пагинация и поиск
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [q, setQ] = useState({ input: '', value: '' }); // input — то, что печатает пользователь; value — применённый запрос

  // Фильтры: черновик (в UI) и применённые (в запросе)
  const [filtersDraft, setFiltersDraft] = useState({});
  const [filtersApplied, setFiltersApplied] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const refresh = () => bumpRefreshKey((key) => key + 1); // ручной триггер перезагрузки

  // Применение фильтров: фиксируем текущий черновик, сбрасываем страницу
  const applyFilters = () => {
    setFiltersApplied(filtersDraft);
    setPage(1);
    setFiltersOpen(false);
  };

  // Сброс фильтров к начальному состоянию
  const resetFilters = () => {
    setFiltersDraft({});
    setFiltersApplied({});
    setPage(1);
  };

  // Загрузка данных при изменении вкладки/страницы/запроса/фильтров
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const { items, total: totalCount } = await loadRows(tab, {
          page,
          pageSize,
          qValue: q.value,
          filters: filtersApplied,
          signal: controller.signal,
        });
        setRows(items);
        setTotal(totalCount);
      } catch (e) {
        // Прерывание запроса — норма при смене условий; остальное — логируем
        if (e.name !== 'AbortError') console.error(e);
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();

    // Отмена запроса при размонтаже/смене зависимостей
    return () => controller.abort();
  }, [tab, page, pageSize, q.value, filtersApplied, refreshKey]);

  // SSE-подписка на серверные события для текущей вкладки (реальное время)
  useEffect(() => {
    try {
      const API = import.meta.env.VITE_API_URL;
      if (!API || typeof EventSource === 'undefined') return;
      const es = new EventSource(`${API}/events?topics=${tab}`); // подписываемся на топик вкладки
      const onEvent = () => refresh(); // при любом событии этой вкладки перезагружаем данные
      es.addEventListener(tab, onEvent);
      // На случай широковещательных событий (если сервер шлёт 'all')
      es.addEventListener('all', onEvent);
      return () => {
        try {
          es.removeEventListener?.(tab, onEvent);
          es.removeEventListener?.('all', onEvent);
          es.close();
        } catch {}
      };
    } catch {}
  }, [tab]);

  // Переключение вкладки с очищением состояния поиска/фильтров
  const switchTab = (nextTab) => {
    const safeTab = tabs.includes(nextTab) ? nextTab : 'chats';
    setTab(safeTab);
    setPage(1);
    setQ({ input: '', value: '' });
    setFiltersDraft({});
    setFiltersApplied({});
    setFiltersOpen(false);
  };

  // Количество страниц для пагинации
  const pages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return {
    tabs,
    tab,
    switchTab,
    refresh,
    rows,
    loading,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    pages,
    q,
    setQ,
    filtersDraft,
    setFiltersDraft,
    filtersApplied,
    filtersOpen,
    setFiltersOpen,
    applyFilters,
    resetFilters,
  };
}
