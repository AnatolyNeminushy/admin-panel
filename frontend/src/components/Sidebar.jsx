// src/components/Sidebar.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import chatIcon from "../assets/chat.svg";
import mailIcon from "../assets/mail.png";
import logoIcon from "../assets/logo-white.svg";

export default function Sidebar({ open = false, onClose = () => {} }) {
  // Закрывать меню после клика по пункту на мобиле
  const closeOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 920) onClose();
  };

  // Esc для закрытия на мобиле
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const asideClasses = [
    "bg-[#13214c] h-[100dvh] shrink-0 flex flex-col items-center py-6 gap-4 z-50",
    "transition-transform duration-300",
    // десктоп
    "w-24 sticky top-0",
    // мобила
    "max-[920px]:fixed max-[920px]:top-0 max-[920px]:left-0",
    "max-[920px]:w-[80vw] max-[920px]:min-w-[16rem] max-[920px]:max-w-[22rem]",
    "max-[920px]:pt-[calc(1.5rem+env(safe-area-inset-top))] max-[920px]:pb-[calc(1.5rem+env(safe-area-inset-bottom))]",
    open ? "max-[920px]:translate-x-0" : "max-[920px]:-translate-x-full",
  ].join(" ");

  // --- СЛАЙДЕР-ИНДИКАТОР ---
  const routes = useMemo(
    () => ["/chats", "/analytics", "/database", "/mailing", "/profile"],
    []
  );
  const ITEM_H = 64; // px (h-16)

  const location = useLocation();
  const activeIndex = Math.max(
    0,
    routes.findIndex((r) => location.pathname.startsWith(r))
  );

  // Индекс, который анимирует ползунок (ездит сразу по клику)
  const [animIndex, setAnimIndex] = useState(activeIndex);

  // Когда маршрут реально сменился — дотягиваем ползунок к активному
  useEffect(() => {
    setAnimIndex(activeIndex);
  }, [activeIndex]);

  return (
    <>
      {/* Оверлей (только мобила) */}
      <div
        onClick={onClose}
        className={`hidden max-[920px]:block fixed inset-0 bg-black/40 z-40 transition-opacity
        ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      <aside className={asideClasses} role="dialog" aria-modal="true">
        {/* Кнопка закрыть (только мобила) */}
        <button
          onClick={onClose}
          aria-label="Закрыть меню"
          className="hidden max-[920px]:block self-end mr-3 mb-2 p-2 rounded-lg
              bg-white/10 active:bg-white/5
             focus:outline-none active:scale-[0.98]"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-[#17e1b1]"
            />
          </svg>
        </button>

        {/* Логотип */}
        <div className="mb-4" onClick={closeOnMobile}>
          <img src={logoIcon} alt="logo" className="w-14 h-14 opacity-70" />
        </div>

        {/* Контейнер ссылок */}
        <nav className="w-full overflow-y-auto px-0 relative">
          {/* Слайдер-подсветка под пунктами */}
          <div
            aria-hidden
            className="absolute left-0 w-full bg-[#154c5b]
                       transition-transform duration-800 ease-[cubic-bezier(.25,.1,.25,1)]
                       will-change-transform"
            style={{
              height: ITEM_H,
              transform: `translateY(${animIndex * ITEM_H}px)`,
            }}
          />

          {/* Каждый пункт одинаковой высоты, контент поверх слайдера */}
          <NavLink
            to="/chats"
            onClick={() => {
              setAnimIndex(0);
              closeOnMobile();
            }}
            className="relative z-10 flex flex-col items-center justify-center h-16 w-full group"
          >
            <img src={chatIcon} className="w-10 h-10 mb-1" alt="chat" />
            <span className="text-white mt-1 text-xs font-semibold group-hover:text-[#17e1b1]">
              Чаты
            </span>
          </NavLink>

          <NavLink
            to="/analytics"
            onClick={() => {
              setAnimIndex(1);
              closeOnMobile();
            }}
            className="relative z-10 flex flex-col items-center justify-center h-16 w-full group"
          >
            <svg width="32" height="32" fill="none" className="mb-1">
              <rect x="6" y="16" width="4" height="10" rx="2" fill="#17e1b1" />
              <rect x="14" y="10" width="4" height="16" rx="2" fill="#17e1b1" />
              <rect x="22" y="6" width="4" height="20" rx="2" fill="#17e1b1" />
            </svg>
            <span className="text-white mt-1 text-xs font-semibold group-hover:text-[#17e1b1]">
              Аналитика
            </span>
          </NavLink>

          <NavLink
            to="/database"
            onClick={() => {
              setAnimIndex(2);
              closeOnMobile();
            }}
            className="relative z-10 flex flex-col items-center justify-center h-16 w-full group"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" fill="#17e1b1" />
              <path
                d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"
                stroke="#17e1b1"
                strokeWidth="2"
              />
              <path
                d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"
                stroke="#17e1b1"
                strokeWidth="2"
              />
            </svg>
            <span className="text-white mt-1 text-xs font-semibold group-hover:text-[#17e1b1]">
              База
            </span>
          </NavLink>

          <NavLink
            to="/mailing"
            onClick={() => {
              setAnimIndex(3);
              closeOnMobile();
            }}
            className="relative z-10 flex flex-col items-center justify-center h-16 w-full group"
          >
            <img
              src={mailIcon}
              alt="broadcast"
              className="w-8 h-8 mb-1"
              style={{
                filter:
                  "invert(66%) sepia(68%) saturate(495%) hue-rotate(115deg) brightness(95%) contrast(90%)",
              }}
            />
            <span className="text-white mt-1 text-xs font-semibold group-hover:text-[#17e1b1]">
              Рассылка
            </span>
          </NavLink>

          <NavLink
            to="/profile"
            onClick={() => {
              setAnimIndex(4);
              closeOnMobile();
            }}
            className="relative z-10 flex flex-col items-center justify-center h-16 w-full group"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="mb-1"
            >
              <circle cx="12" cy="8" r="4" stroke="#17e1b1" strokeWidth="2" />
              <path
                d="M4 20c0-4 4-6 8-6s8 2 8 6"
                stroke="#17e1b1"
                strokeWidth="2"
              />
            </svg>
            <span className="text-white mt-1 text-xs font-semibold group-hover:text-[#17e1b1]">
              Профиль
            </span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
