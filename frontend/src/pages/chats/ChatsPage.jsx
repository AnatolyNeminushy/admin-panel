// pages/chats/ChatsPage.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import ChatSearch from './components/ChatSearch';
import LimitControl from './components/LimitControl';
import ChatList from './components/ChatList';
import MessagePane from './components/MessagePane';
import { getDialogTimestamp, matchesLocal } from './utils/chatUtils';

export default function ChatsPage() {
  // Список диалогов и текущий выбранный диалог
  const [dialogs, setDialogs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Флаги загрузки общего списка и сообщений в текущем диалоге
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Счётчики элементов: всего, видимых, фильтрованных
  const [totalCount, setTotalCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(50);

  // Локальный ввод в строке поиска и фактический запрос (по нажатию Enter/кнопки)
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Базовый URL API из .env фронта
  const API = import.meta.env.VITE_API_URL;

  // Признак «широкого» экрана (md и выше) — для split-layout
  const [isMdUp, setIsMdUp] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 768px)').matches
      : true,
  );

  // Подписка на изменение брейкпоинта (обновляет layout между mobile/desktop)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e) => setIsMdUp(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Сортировка диалогов по времени последнего сообщения (убывание)
  const sortedDialogs = useMemo(
    () => [...dialogs].sort((a, b) => getDialogTimestamp(b) - getDialogTimestamp(a)),
    [dialogs],
  );

  // Локальная фильтрация (клиентская) по строке поиска
  const locallyFiltered = useMemo(
    () => sortedDialogs.filter((d) => matchesLocal(d, searchInput)),
    [sortedDialogs, searchInput],
  );

  // Список, который реально показываем (учёт лимита visibleCount)
  const displayedDialogs = useMemo(() => {
    const count = Math.min(
      typeof visibleCount === 'number' ? visibleCount : totalCount,
      locallyFiltered.length,
    );
    return locallyFiltered.slice(0, count);
  }, [locallyFiltered, visibleCount, totalCount]);

  // Текущий выбранный диалог (для заголовка/аватара в правой панели)
  const selectedDialog = useMemo(
    () => dialogs.find((d) => d.chat_id === selectedId) || null,
    [dialogs, selectedId],
  );

  // Загрузка списка диалогов c сервера, с учётом серверной строки поиска (q)
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API}/chats?limit=10000&offset=0&q=${encodeURIComponent(searchQuery)}`,
          { signal: controller.signal },
        );

        // Проверяем код ответа, чтобы не падать на res.json()
        if (!res.ok) {
          setDialogs([]);
          setTotalCount(0);
          return;
        }

        const totalFromHeader = Number(res.headers.get('X-Total-Count'));
        const data = await res.json();

        // Унифицированная обработка разных форматов ответа API:
        // { items, total } | [] | { items } | { total }
        if (data && Array.isArray(data.items)) {
          setDialogs(data.items);
          const metaTotal = Number(data.total ?? data.count ?? data.totalCount);
          const fallbackTotal = data.items.length;
          setTotalCount(
            Number.isFinite(totalFromHeader) && totalFromHeader > 0
              ? totalFromHeader
              : Number.isFinite(metaTotal) && metaTotal > 0
                ? metaTotal
                : fallbackTotal,
          );
        } else if (Array.isArray(data)) {
          setDialogs(data);
          const fallbackTotal = data.length;
          setTotalCount(
            Number.isFinite(totalFromHeader) && totalFromHeader > 0
              ? totalFromHeader
              : fallbackTotal,
          );
        } else {
          setDialogs([]);
          setTotalCount(0);
        }
      } catch (e) {
        // Игнорируем отмену запроса, остальные ошибки — очищаем список
        if (e.name !== 'AbortError') {
          setDialogs([]);
          setTotalCount(0);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [searchQuery, API]);

  // Автовыбор первого диалога на широких экранах (двухколоночный режим)
  useEffect(() => {
    if (!sortedDialogs.length) return;
    if (!isMdUp) return;
    if (selectedId && sortedDialogs.some((d) => d.chat_id === selectedId)) return;
    setSelectedId(sortedDialogs[0].chat_id);
  }, [sortedDialogs, selectedId, isMdUp]);

  // Загрузка сообщений для выбранного диалога
  useEffect(() => {
    if (!selectedId) return;

    const controller = new AbortController();
    setLoadingMessages(true);

    fetch(`${API}/messages?chatId=${selectedId}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return [];
        const data = await res.json().catch(() => []);
        const arr = Array.isArray(data) ? data : [];

        // Нормализация полей сообщений под единый формат рендера
        let parsed;
        parsed = arr.map((m, idx) => {
          const role = String(
            m.role || m.sender || m.author || m.sender_name || '',
          ).toLowerCase();

          // Признак "ботовского" сообщения (несколько возможных источников правды)
          const isBot =
            role === 'bot' ||
            role === 'assistant' ||
            role === 'ai' ||
            role === 'irbi' ||
            m.is_bot === true ||
            m.is_bot === 1 ||
            m.is_bot === '1';

          // Стабильный порядок на клиенте: по дате, если есть, иначе индекс
          const ts = Number.isFinite(Date.parse(m.date)) ? Date.parse(m.date) : idx;

          return {
            ...m,
            is_bot: isBot,
            _clientOrder: ts,
          };
        });

        return parsed;
      })
      .then((mapped) => setMessages(Array.isArray(mapped) ? mapped : []))
      .catch((e) => {
        if (e.name !== 'AbortError') setMessages([]);
      })
      .finally(() => setLoadingMessages(false));

    return () => controller.abort();
  }, [selectedId, API]);

  // Отправка нового сообщения в текущий диалог (с временным «пессимистическим» ID)
  const handleSend = useCallback(
    async (text) => {
      if (!selectedId || !text || !text.trim()) return;

      const now = Date.now();
      const tempId = `tmp-${now}`;
      const tempMsg = {
        id: tempId,
        chat_id: selectedId,
        from_me: true,
        text: text.trim(),
        date: new Date(now).toISOString(),
        _pending: true,
        _clientOrder: now,
      };

      // Сразу показываем сообщение в списке
      setMessages((prev) => [...prev, tempMsg]);

      let res;
      let data;
      try {
        res = await fetch(`${API}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId: selectedId, text: text.trim() }),
        });

        if (!res.ok) {
          // Ошибка сервера — убираем временное сообщение
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          const errBody = await res.json().catch(() => null);
          // Можно заменить на UI-toast
          alert((errBody && errBody.error) || 'Не удалось отправить сообщение');
          return;
        }

        data = await res.json().catch(() => null);
        if (!data) {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          alert('Не удалось отправить сообщение');
          return;
        }
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        alert('Не удалось отправить сообщение (нет соединения).');
        return;
      }

      // Обновляем временное сообщение фактическими полями от сервера
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: data.id ?? m.id,
                chat_id: data.chat_id ?? m.chat_id,
                from_me: true,
                text: data.text ?? m.text,
                _pending: false,
              }
            : m,
        ),
      );
    },
    [API, selectedId],
  );

  // Пресеты для быстрого выбора лимита видимых диалогов
  const presets = useMemo(() => {
    const candidates = [20, 50, 100, 200, 500];
    return candidates.filter((n) => n < totalCount).concat([totalCount || 0]).filter(Boolean);
  }, [totalCount]);

  // Хэндлеры выбора/возврата (мемоизированы, чтобы не триггерить лишний ререндер)
  const handleSelectChat = useCallback((id) => setSelectedId(id), []);
  const handleBackToChats = useCallback(() => setSelectedId(null), []);

  return (
    <div className="flex h-full relative min-h-0">
      {/* ===== Desktop / Tablet (две колонки) ===== */}
      {isMdUp ? (
        <>
          {/* Sidebar: поиск, лимиты, список чатов */}
          <div
            className="
              hidden md:flex md:flex-col h-full min-h-0 overflow-y-auto p-4
              bg-white rounded-l-2xl shadow-sm border border-gray-200
              md:w-[260px] lg:w-[320px] xl:w-[360px] transition-[width] duration-200
            "
          >
            <ChatSearch
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={() => setSearchQuery(searchInput.trim())}
              onClear={() => {
                setSearchInput('');
                setSearchQuery('');
              }}
            />

            <LimitControl
              visibleCount={visibleCount}
              setVisibleCount={setVisibleCount}
              totalCount={totalCount}
              shownCount={displayedDialogs.length}
              filteredCount={locallyFiltered.length}
              showTotalNote={Boolean(searchInput)}
            />

            <div className="flex flex-wrap gap-2 mb-3">
              {presets.map((n) => (
                <button
                  key={n}
                  onClick={() => setVisibleCount(n)}
                  className={`text-xs px-2 py-1 rounded border ${
                    visibleCount === n
                      ? 'bg-[#17E1B1] text-white border-transparent'
                      : 'bg-[#f7f7f9] text-gray-700 border-gray-200'
                  }`}
                >
                  {n === totalCount ? `Все (${totalCount})` : n}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center text-gray-400">Загрузка...</div>
            ) : (
              <ChatList
                dialogs={displayedDialogs}
                selectedId={selectedId}
                onSelect={handleSelectChat}
              />
            )}
          </div>

          {/* Message pane: переписка текущего диалога */}
          <div
            className="flex-1 min-w-0 min-h-0 rounded-r-2xl border border-gray-200 md:ml-2
                       flex flex-col overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6FC0BE 0%, #A8E5C7 120%)' }}
          >
            <MessagePane
              selectedId={selectedId}
              peer={selectedDialog}                /* собеседник: заголовок/аватар */
              messages={messages}
              loading={loadingMessages}
              onSend={handleSend}
              onBack={() => {}}
              isMobile={false}
            />
          </div>
        </>
      ) : (
        // ===== Mobile: один экран за раз (чаты ИЛИ сообщения) =====
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          {!selectedId ? (
            // Экран "Чаты"
            <div className="flex-1 min-h-0 flex flex-col bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 font-semibold">Чаты</div>

              <div className="p-4">
                <ChatSearch
                  value={searchInput}
                  onChange={setSearchInput}
                  onSubmit={() => setSearchQuery(searchInput.trim())}
                  onClear={() => {
                    setSearchInput('');
                    setSearchQuery('');
                  }}
                />

                <LimitControl
                  visibleCount={visibleCount}
                  setVisibleCount={setVisibleCount}
                  totalCount={totalCount}
                  shownCount={displayedDialogs.length}
                  filteredCount={locallyFiltered.length}
                  showTotalNote={Boolean(searchInput)}
                />

                <div className="flex flex-wrap gap-2 mb-3">
                  {presets.map((n) => (
                    <button
                      key={n}
                      onClick={() => setVisibleCount(n)}
                      className={`text-xs px-2 py-1 rounded border ${
                        visibleCount === n
                          ? 'bg-[#17E1B1] text-white border-transparent'
                          : 'bg-[#f7f7f9] text-gray-700 border-gray-200'
                      }`}
                    >
                      {n === totalCount ? `Все (${totalCount})` : n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-400">Загрузка...</div>
                ) : (
                  <ChatList
                    dialogs={displayedDialogs}
                    selectedId={selectedId}
                    onSelect={handleSelectChat}
                  />
                )}
              </div>
            </div>
          ) : (
            // Экран "Сообщения"
            <div
              className="flex-1 min-h-0 flex flex-col border border-gray-200 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #6FC0BE 0%, #A8E5C7 120%)' }}
            >
              <MessagePane
                selectedId={selectedId}
                peer={selectedDialog}              /* собеседник для заголовка/аватара */
                messages={messages}
                loading={loadingMessages}
                onSend={handleSend}
                onBack={handleBackToChats}         /* кнопка ← Назад */
                isMobile                           /* мобильный хедер */
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
