// pages/chats/components/ChatSearch.jsx

/**
 * Поле поиска по диалогам: локальный ввод + Enter для запроса на сервер.
 * Кнопка сброса очищает строку и снимает фильтр.
 */
export default function ChatSearch({ value, onChange, onSubmit, onClear }) {
  return (
    <div className="mb-3">
      <input
        type="text"
        placeholder="Поиск... (username, имя, фамилия, id). Enter — поиск на сервере"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
        className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17e1b1]"
        aria-label="Поиск по диалогам"
      />
      {value && (
        <button
          type="button"
          className="mt-2 text-xs text-gray-500 underline"
          onClick={onClear}
        >
          Сбросить поиск
        </button>
      )}
    </div>
  );
}
