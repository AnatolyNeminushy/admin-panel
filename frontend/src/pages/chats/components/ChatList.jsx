// pages/chats/components/ChatList.jsx
import { useEffect, useState } from "react";
import ChatListItem from "./ChatListItem";
import { getDialogTimestamp } from "../utils/chatUtils";

/**
 * Хук: подписка на media query без сторонних библиотек.
 * Возвращает true/false в зависимости от соответствия запросу.
 */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    try {
      mql.addEventListener("change", onChange);
    } catch {
      // Safari: старый API
      mql.addListener(onChange);
    }
    return () => {
      try {
        mql.removeEventListener("change", onChange);
      } catch {
        mql.removeListener(onChange);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Обертка: плавное поочередное появление детей.
 * Используется для каскадной анимации списка.
 */
function AnimatedItem({ children, delay = 0, durationMs = 600 }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const style = { transitionDuration: `${durationMs}ms` };

  return (
    <div
      style={style}
      className={[
        "transition-all ease-out transform-gpu",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/**
 * Список диалогов: виртуализация не требуется (короткие выборки),
 * вывод с компактной/расширенной датой в зависимости от ширины экрана.
 */
export default function ChatList({ dialogs, selectedId, onSelect }) {
  const isMobile = useMediaQuery("(max-width: 920px)");

  if (!dialogs?.length) {
    return <div className="text-center text-gray-400 py-6">Нет диалогов</div>;
  }

  return (
    <div
      role="listbox" // a11y: список с выбираемыми опциями
      className="
        flex flex-col
        gap-2 md:gap-3
        max-h-[calc(100dvh-190px)]
        md:max-h-[calc(100dvh-140px)]
        overflow-y-auto
        pr-1 md:pr-2
        -mr-1 md:-mr-2
        scrollbar-thin
      "
    >
      {dialogs.map((dlg, i) => {
        const ts = getDialogTimestamp(dlg);

        // Формат даты: компакт на мобиле, расширенный на десктопе
        let lastDate = "";
        if (ts > 0) {
          const d = new Date(ts);
          lastDate = d.toLocaleString("ru-RU", isMobile
            ? { hour: "2-digit", minute: "2-digit", hour12: false }
            : { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }
          );
        }

        // Каскад появления с шагом ~30мс
        const delay = Math.min(i * 30, 240);

        return (
          <AnimatedItem key={dlg.chat_id} delay={delay} durationMs={700}>
            <ChatListItem
              dlg={dlg}
              selected={selectedId === dlg.chat_id}
              onSelect={onSelect}
              lastDate={lastDate}
              className="transition-all duration-700 ease-in-out"
            />
          </AnimatedItem>
        );
      })}
    </div>
  );
}
