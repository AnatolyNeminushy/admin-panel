// pages/chats/components/MessagePane.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import platformIcon from "../../../assets/avatar.png";
import botAvatar from "../../../assets/tg.jpg";

/**
 * Панель сообщений: шапка диалога, лента с дозагрузкой вверх,
 * “липкий” скролл к низу и композер отправки.
 */
export default function MessagePane({
  selectedId,
  messages,
  loading,
  onLoadMore,
  onSend,
  onBack, // если передан — показываем кнопку ← на мобильных
}) {
  const scRef = useRef(null);
  const atBottomRef = useRef(true);
  const prevHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);

  const [text, setText] = useState("");

  // Порог догрузки и липкости прокрутки
  const PRELOAD_EDGE = 60;
  const STICKY_EDGE = 80;
  const GROUP_MS = 5 * 60 * 1000;

  /**
   * Парсер времени Postgres "YYYY-MM-DD HH:mm:ss.ffffff" → timestamp (ms).
   * Безопасно возвращает -Infinity при нераспознанных значениях.
   */
  const ts = (d) => {
    if (!d) return -Infinity;
    if (d instanceof Date) return d.getTime();
    if (typeof d === "string") {
      const [datePart, timePartRaw] = d.split(" ");
      if (!timePartRaw) return -Infinity;
      const [hms, fracRaw = ""] = timePartRaw.split(".");
      const frac3 = fracRaw.slice(0, 3).padEnd(3, "0");
      const iso = `${datePart}T${hms}.${frac3}`;
      const t = Date.parse(iso);
      return Number.isFinite(t) ? t : -Infinity;
    }
    return -Infinity;
  };

  /**
   * Стабильная сортировка: по дате, потом по id, затем по локальному порядку.
   * Важно для корректного построения группы и последовательности.
   */
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const ta = ts(a.date);
      const tb = ts(b.date);
      if (ta !== tb) return ta - tb; // 1) дата ASC
      const ia = typeof a.id === "number" ? a.id : Number.MAX_SAFE_INTEGER;
      const ib = typeof b.id === "number" ? b.id : Number.MAX_SAFE_INTEGER;
      if (ia !== ib) return ia - ib; // 2) id ASC
      const ca = a._clientOrder ?? 0;
      const cb = b._clientOrder ?? 0;
      return ca - cb; // 3) локовый порядок
    });
  }, [messages]);

  const computeAtBottom = () => {
    const el = scRef.current;
    if (!el) return true;
    const delta = el.scrollHeight - el.scrollTop - el.clientHeight;
    return delta <= STICKY_EDGE;
  };

  const scrollToBottom = () => {
    const el = scRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  // === ДАННЫЕ ДЛЯ ШАПКИ ДИАЛОГА ===
  const peerMsg = useMemo(() => {
    if (!messages?.length) return null;
    const inbound = [...messages].find((m) => !m.from_me);
    return inbound || messages[messages.length - 1];
  }, [messages]);

  const isBotHeader =
    peerMsg?.is_bot === true ||
    String(peerMsg?.sender || "").toLowerCase() === "bot" ||
    String(peerMsg?.author || "").toLowerCase() === "bot";

  const avatarSrc = isBotHeader ? botAvatar : platformIcon;

  const displayName =
    peerMsg?.display_name ||
    peerMsg?.name ||
    peerMsg?.sender_name ||
    peerMsg?.author ||
    peerMsg?.sender ||
    peerMsg?.username ||
    peerMsg?.from ||
    (selectedId ? `ID: ${selectedId}` : "Чат");

  const subtitle = peerMsg?.platform
    ? String(peerMsg.platform).toUpperCase()
    : "Диалог";

  // При смене чата — перейти в конец и очистить ввод
  useEffect(() => {
    if (!selectedId) return;
    requestAnimationFrame(scrollToBottom);
    setText("");
  }, [selectedId]);

  // Новые сообщения — держим скролл у низа, если пользователь не прокрутил вверх
  useEffect(() => {
    if (!scRef.current) return;
    if (atBottomRef.current) requestAnimationFrame(scrollToBottom);
  }, [sortedMessages]);

  const onScroll = async () => {
    const el = scRef.current;
    if (!el) return;

    atBottomRef.current = computeAtBottom();

    // Догрузка вверх, когда подходим к началу
    if (onLoadMore && el.scrollTop <= PRELOAD_EDGE && !loading) {
      prevHeightRef.current = el.scrollHeight;
      prevScrollTopRef.current = el.scrollTop;
      try {
        const loaded = await onLoadMore(); // true, если получены старые сообщения
        if (loaded) {
          requestAnimationFrame(() => {
            const now = scRef.current;
            if (!now) return;
            const diff = now.scrollHeight - prevHeightRef.current;
            now.scrollTop = prevScrollTopRef.current + diff; // сохраняем позицию
          });
        }
      } catch {
        /* ignore */
      }
    }
  };

  // Отправка сообщения из композера
  const doSend = () => {
    const value = text.trim();
    if (!value || !selectedId) return;
    onSend?.(value);
    setText("");
    requestAnimationFrame(scrollToBottom);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  if (!selectedId) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/50">
        Выберите чат
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Шапка диалога: аватар, имя, платформа */}
      <div className="sticky top-0 z-20">
        <div className="flex items-center gap-3 px-3 py-2 bg-white/90 backdrop-blur border-b border-gray-200">
          {typeof onBack === "function" && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-1 rounded-md hover:bg-gray-100 active:opacity-90 md:hidden"
              aria-label="Назад к чатам"
            >
              ←
            </button>
          )}

          <img
            src={avatarSrc}
            alt=""
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
            draggable={false}
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{displayName}</div>
            <div className="text-xs text-gray-500 truncate">{subtitle}</div>
          </div>
        </div>
      </div>

      {/* Лента сообщений: единый вертикальный скролл с дозагрузкой вверх */}
      <div
        id="tg-scroll"
        ref={scRef}
        onScroll={onScroll}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-telegram min-w-0"
      >
        <div className="w-full px-2 py-3 flex flex-col gap-1">
          {loading && sortedMessages.length === 0 ? (
            <div className="text-center text-gray-400 mt-12">
              Загрузка сообщений...
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="text-center text-gray-400 mt-12">
              В этом чате пока нет сообщений
            </div>
          ) : (
            sortedMessages.map((m, i) => {
              const prev = sortedMessages[i - 1];
              const next = sortedMessages[i + 1];

              const prevSame =
                !!prev &&
                prev.from_me === m.from_me &&
                Math.abs(ts(m.date) - ts(prev.date)) < GROUP_MS;

              const nextSame =
                !!next &&
                next.from_me === m.from_me &&
                Math.abs(ts(next.date) - ts(m.date)) < GROUP_MS;

              let position = "single";
              if (prevSame && nextSame) position = "middle";
              else if (!prevSame && nextSame) position = "start";
              else if (prevSame && !nextSame) position = "end";

              return (
                <MessageBubble
                  key={m.id ?? m._tempId ?? `${m.date}-${i}`}
                  msg={m}
                  position={position}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Композер: textarea + кнопка отправки, 
      Enter — отправить, Shift+Enter — перенос */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-gray-200">
        <div className="p-3 flex gap-2 pb-[25%] sm:pb-3 md:pb-3 ">
          <textarea
            className="flex-1 resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            rows={2}
            placeholder="Напишите сообщение… (Enter — отправить, Shift+Enter — новая строка)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={!selectedId}
            aria-label="Поле ввода сообщения"
          />
          <button
            type="button"
            onClick={doSend}
            disabled={!selectedId || !text.trim()}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              !selectedId || !text.trim()
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-emerald-400 text-white hover:bg-emerald-500"
            }`}
          >
            Отправить
          </button>
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
