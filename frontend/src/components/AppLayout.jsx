// src/components/AppLayout.jsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import logoIcon from "../assets/logo-white.svg";

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  // Блокируем прокрутку body, когда открыт мобильный drawer
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [open]);

  return (
    <div className="w-screen h-screen flex bg-[#ececf4] overflow-hidden">
      {/* ===== Sidebar (desktop inline) ===== */}
      {/* Предполагается, что <Sidebar> сам умеет быть статичным на десктопе
          и позиционироваться как drawer на мобиле на основе пропа open */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* ===== Overlay for mobile drawer ===== */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== Content ===== */}
      <div className="flex-1 h-full min-h-0 flex flex-col relative z-0">
        {/* Safe area (top) */}
        <div className="h-[env(safe-area-inset-top)] lg:hidden" />

        {/* Mobile header */}
        <header className="hidden max-[920px]:flex items-center gap-3 px-3 py-2 bg-[#13214c] sticky top-0 z-50">
          <button
            onClick={() => setOpen(true)}
            aria-label="Открыть меню"
            className="p-2 rounded-xl bg-white/10 active:bg-white/5 focus:outline-none focus:ring-0"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#17e1b1]"
            >
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            
            
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 min-h-0 overflow-y-auto px-0 py-0 lg:px-6 lg:py-6 ">
          <Outlet />
        </main>

        {/* Safe area (bottom) */}
        <div className="h-[env(safe-area-inset-bottom)] lg:hidden" />
      </div>
    </div>
  );
}
