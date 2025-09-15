// src/components/ChatList.jsx
import { useEffect, useState } from "react";
import ChatListItem from "./ChatListItem";
import { getDialogTimestamp } from "../utils/chatUtils";

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
      // Safari fallback
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
 * Плавное появление каждого элемента (без сторонних пакетов).
 * Сначала рендерим "скрыто", потом включаем видимость -> transition.
 */
function AnimatedItem({ children, delay = 0, durationMs = 600 }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  // Поддержка нестандартной длительности через inline-style
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

export default function ChatList({ dialogs, selectedId, onSelect }) {
  const isMobile = useMediaQuery("(max-width: 920px)");

  if (!dialogs?.length) {
    return <div className="text-center text-gray-400 py-6">Нет диалогов</div>;
  }

  return (
    <div
      role="list"
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

        // компактная дата на мобиле, расширенная — на десктопе
        let lastDate = "";
        if (ts > 0) {
          const d = new Date(ts);
          if (isMobile) {
            lastDate = d.toLocaleString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          } else {
            lastDate = d.toLocaleString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          }
        }

        // Небольшой каскад появления (по 30 мс между элементами, максимум 240 мс)
        const delay = Math.min(i * 30, 240);

        return (
          <AnimatedItem key={dlg.chat_id} delay={delay} durationMs={700}>
            <ChatListItem
              dlg={dlg}
              selected={selectedId === dlg.chat_id}
              onSelect={onSelect}
              lastDate={lastDate}
              // доп. переходы на самом элементе — плавная смена фона при выборе
              className="transition-all duration-700 ease-in-out"
            />
          </AnimatedItem>
        );
      })}
    </div>
  );
}
