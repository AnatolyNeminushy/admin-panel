// src/components/ChatListItem.jsx
import vkLogo from "@/assets/vk.png";
import tgLogo from "../../../assets/tg.jpg";

export default function ChatListItem({
  dlg,
  selected,
  onSelect,
  lastDate,
  className = "",
}) {
  const platformLogo = dlg.platform === "vk" ? vkLogo : tgLogo;
  const platformAlt = dlg.platform === "vk" ? "VK logo" : "Telegram logo";

  return (
    <button
      onClick={() => onSelect(dlg.chat_id)}
      aria-selected={selected}
      className={[
        // базовая сетка
        "w-full max-w-[85%] sm:max-w-[90%] mx-auto",
        "text-left border rounded-xl",
        "p-2 sm:p-2.5 md:p-3",
        "flex items-start gap-2 sm:gap-2.5 md:gap-3",

        // ПЛАВНЫЕ ПЕРЕХОДЫ (фон, тени, цвет, масштаб)
        "transition-all duration-700 ease-in-out transform-gpu",

        // состояния
        selected
          ? "bg-[#17e1b1] text-white border-transparent shadow-md"
          : "bg-[#f7f7f9] text-gray-900 border-gray-200 hover:bg-gray-100",

        // focus/active
        "focus:outline-none focus:ring-2 focus:ring-offset-0",
        selected ? "focus:ring-white/50" : "focus:ring-[#17e1b1]/40",
        "active:scale-[0.99]",

        // внешние доп.классы от родителя
        className,
      ].join(" ")}
    >
      {/* Аватар / логотип платформы */}
      <img
        src={platformLogo}
        alt={platformAlt}
        className="rounded-full bg-white shadow-sm border object-contain w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9"
      />

      {/* Контент */}
      <div className="flex-1 flex flex-col items-start min-w-0">
        {/* Верхняя строка: ник + дата */}
        <div className="w-full flex items-center gap-1 sm:gap-2">
          <div
            className={[
              "min-w-0 truncate",
              "text-[12px] sm:text-[13px] md:text-sm font-semibold",
              selected ? "text-white" : "text-gray-900",
            ].join(" ")}
            title={`@${dlg.username || "id" + dlg.chat_id}`}
          >
            @{dlg.username || "id" + dlg.chat_id}
          </div>

          <div
            className={[
              "ml-auto shrink-0",
              "text-[9px] sm:text-[10px] md:text-[11px]",
              selected ? "opacity-85" : "text-gray-500",
            ].join(" ")}
          >
            {lastDate}
          </div>
        </div>

        {/* ФИО — скрываем на мобилке, показываем на ≥md */}
        <div
          className={[
            "w-full truncate hidden md:block",
            "text-[11px] md:text-xs mb-0.5 md:mb-1",
            selected ? "opacity-90" : "text-gray-500",
          ].join(" ")}
          title={`${dlg.first_name ?? ""} ${dlg.last_name ?? ""}`}
        >
          {dlg.first_name} {dlg.last_name || ""}
        </div>

        {/* Нижняя строка: ID */}
        <div className="w-full flex items-center justify-between">
          <div
            className={[
              "truncate",
              "text-[11px] sm:text-[12px] md:text-sm font-medium",
              selected ? "text-white/95" : "text-gray-600",
            ].join(" ")}
            title={`Id: ${dlg.chat_id}`}
          >
            Id: {dlg.chat_id}
          </div>
        </div>
      </div>
    </button>
  );
}
