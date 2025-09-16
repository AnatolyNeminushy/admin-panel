// pages/database/components/FilterBar.jsx
import Button from '@/components/Button';

/**
 * Панель фильтров для вкладок "orders" и "reservations".
 * Управляет объектом filters через setFilters.
 */
export default function FilterBar({ tab, filters, setFilters, onApply, onReset, mobileOpen }) {
  if (tab !== 'orders' && tab !== 'reservations') return null;

  const mobileHidden = mobileOpen ? '' : 'hidden md:block';
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className={`rounded-xl border border-slate-700 bg-[#0b1533] p-3 ${mobileHidden}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {tab === 'orders' && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-slate-300">Платформа</span>
              <select
                className="rounded-lg bg-[#09102a] border border-slate-700 px-3 py-2 text-slate-100"
                value={filters.platform || ''}
                onChange={set('platform')}
              >
                <option value="">— любая —</option>
                <option value="telegram">telegram</option>
                <option value="vk">vk</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-slate-300">Тип заказа</span>
              <input
                className="rounded-lg bg-[#09102a] border border-slate-700 px-3 py-2 text-slate-100"
                value={filters.order_type || ''}
                onChange={set('order_type')}
                placeholder="доставка / самовывоз…"
              />
            </label>
          </>
        )}

        {/* Диапазон дат */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-slate-300">С даты</span>
          <input
            type="date"
            className="rounded-lg bg-[#09102a] border border-slate-700 px-3 py-2 text-slate-100"
            value={filters.date_from || ''}
            onChange={set('date_from')}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-slate-300">По дату</span>
          <input
            type="date"
            className="rounded-lg bg-[#09102a] border border-slate-700 px-3 py-2 text-slate-100"
            value={filters.date_to || ''}
            onChange={set('date_to')}
          />
        </label>

        {tab === 'orders' && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-slate-300">Мин. сумма</span>
              <input
                type="number"
                className="rounded-lg bg-[#09102a] border border-slate-700 px-3 py-2 text-slate-100"
                value={filters.min_total ?? ''}
                onChange={set('min_total')}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-slate-300">Макс. сумма</span>
              <input
                type="number"
                className="rounded-lg bg-[#09102a] border border-slate-700 px-3 py-2 text-slate-100"
                value={filters.max_total ?? ''}
                onChange={set('max_total')}
              />
            </label>
          </>
        )}

        {tab === 'reservations' && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-slate-300">Мин. гостей</span>
              <input
                type="number"
                className="rounded-lg bg-[#09102a] border border-slate-700 px-3 py-2 text-slate-100"
                value={filters.min_guests ?? ''}
                onChange={set('min_guests')}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-slate-300">Макс. гостей</span>
              <input
                type="number"
                className="rounded-lg bg-[#09102a] border border-slate-700 px-3 py-2 text-slate-100"
                value={filters.max_guests ?? ''}
                onChange={set('max_guests')}
              />
            </label>
          </>
        )}
      </div>

      <div className="mt-3 md:mt-4 flex flex-col md:flex-row md:justify-end gap-2">
        <Button type="button" onClick={onReset} variant="tab" size="sm" className="w-full md:w-auto px-4">
          Сбросить фильтры
        </Button>
        <Button type="button" onClick={onApply} variant="tab" size="sm" className="w-full md:w-auto px-4">
          Применить
        </Button>
      </div>
    </div>
  );
}
