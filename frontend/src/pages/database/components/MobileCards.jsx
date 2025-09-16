// pages/database/components/MobileCards.jsx

/**
 * Мобильная карточка списка: рендерит строки в виде карточек.
 * columns: массив { key, title, render?(value,row) }.
 */
export default function MobileCards({
  rows,
  columns,
  tab,
  onEdit,
  onDelete,
  page,
  pageSize,
  loading,
}) {
  if (rows.length === 0 && !loading) {
    return (
      <div className="rounded-xl border border-slate-700 p-6 text-center text-slate-400">
        Пусто
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r, idx) => {
        const stableKey = r.id ?? r.chat_id ?? idx;
        return (
          <div
            key={`${tab}-m-${stableKey}`}
            className="rounded-xl border border-slate-700 bg-[#0b1533] p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-400">#{(page - 1) * pageSize + idx + 1}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(r)}
                  className="px-2 py-1 rounded bg-sky-700 hover:bg-sky-600 text-white text-xs"
                  aria-label="Изменить запись"
                >
                  Изм.
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(r)}
                  className="px-2 py-1 rounded bg-rose-700 hover:bg-rose-600 text-white text-xs"
                  aria-label="Удалить запись"
                >
                  Удал.
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {columns.map((c) => (
                <div key={c.key} className="text-sm">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">
                    {c.title}
                  </div>
                  <div className="mt-0.5">
                    {c.render ? c.render(r[c.key], r) : r[c.key] ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
