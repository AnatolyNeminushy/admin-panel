// src/pages/chats/components/MessageBubble.jsx

import platformIcon from "../../../assets/avatar.png"; // гость
import botAvatar from "../../../assets/tg.jpg"; // аватар бота (можешь поставить свой .png/.svg)

// Fallback-иконка, если файл не загрузился
const BOT_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#60a5fa"/>
  </linearGradient></defs>
  <circle cx="32" cy="32" r="31" fill="url(#g)"/>
  <rect x="18" y="22" width="28" height="20" rx="10" fill="white" opacity="0.9"/>
  <circle cx="26" cy="32" r="3.5" fill="#0f172a"/>
  <circle cx="38" cy="32" r="3.5" fill="#0f172a"/>
  <rect x="28" y="44" width="8" height="6" rx="3" fill="white" opacity="0.9"/>
</svg>`);

export default function MessageBubble({ msg }) {
  const mine = Boolean(msg?.from_me);

  const role = String(
    msg?.role || msg?.sender || msg?.author || msg?.sender_name || ""
  ).toLowerCase();

  // Явные признаки оператора
  const isOperator =
    mine &&
    (["operator", "admin", "manager", "support", "agent", "оператор"].includes(
      role
    ) ||
      msg?.is_operator === true ||
      msg?.from_operator === true);

  // Бот: всё исходящее, что не оператор, + явные признаки бота
  const isBot =
    !isOperator &&
    (mine || // ← последнее «спасающее» условие
      ["bot", "assistant", "ai", "system", "irbi"].includes(role) ||
      msg?.platform === "bot" ||
      msg?.is_bot === true ||
      msg?.is_bot === 1 ||
      msg?.is_bot === "1" ||
      msg?.is_bot === "true");

  const isGuest = !mine && !isBot;

  return (
    <div className="relative px-12 mb-1">
      {(isBot || isGuest) && (
        <img
          src={isBot ? botAvatar : platformIcon}
          alt={isBot ? "bot" : msg?.platform || "guest"}
          className="absolute left-2 top-1 w-8 h-8 rounded-full object-cover select-none z-10"
          draggable={false}
          onError={(e) => {
            e.currentTarget.src = BOT_FALLBACK;
          }}
        />
      )}

      <div className="flex justify-start">
        <div
          className={[
            "px-3 py-2 rounded-2xl shadow-sm",
            "whitespace-pre-wrap break-words",
            "min-w-[120px] max-w-[95%] md:max-w-[75%]",
            mine ? "bg-[#E3FBE5]" : "bg-white",
            "text-gray-900",
          ].join(" ")}
        >
          <div className="text-xs opacity-60 mb-1">
            {msg?.date
              ? `${new Date(msg.date).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })} ${new Date(msg.date).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                })}`
              : ""}
          </div>
          <div>{msg?.text}</div>
        </div>
      </div>
    </div>
  );
}
