// pages/mailing/components/FiltersCard.jsx
import PropTypes from 'prop-types';

/**
 * Карточка фильтров: платформы, активность, мин. заказы, лимит.
 * Управляет state во внешнем компоненте через сеттеры из пропсов.
 */
export default function FiltersCard({
  platforms,
  setPlatforms,
  filters,
  setFilters,
  limit,
  setLimit,
  sendMode,
}) {
  return (
    <div className="bg-[#0f1a3a] rounded-2xl p-4 space-y-4 shadow">
      {/* Платформы */}
      <div>
        <div className="text-sm text-slate-300 mb-2">Платформы</div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={platforms.tg}
              onChange={(e) => setPlatforms((p) => ({ ...p, tg: e.target.checked }))}
              aria-label="Включить Telegram"
            />
            <span className="text-slate-400">Telegram</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={platforms.vk}
              onChange={(e) => setPlatforms((p) => ({ ...p, vk: e.target.checked }))}
              aria-label="Включить VK"
            />
            <span className="text-slate-400">VK</span>
          </label>
        </div>
      </div>

      {/* Активность/минимум заказов */}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="block mb-1 text-slate-300">Активны за N дней</span>
          <input
            type="number"
            min={0}
            value={filters.onlyActiveDays}
            onChange={(e) =>
              setFilters((f) => ({ ...f, onlyActiveDays: Number(e.target.value) || 0 }))
            }
            className="w-full rounded-xl bg-[#0b132b] border border-slate-700 px-3 py-2 outline-none focus:border-[#17e1b1]"
          />
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-slate-300">Мин. кол-во заказов</span>
          <input
            type="number"
            min={0}
            value={filters.minOrders}
            onChange={(e) =>
              setFilters((f) => ({ ...f, minOrders: Number(e.target.value) || 0 }))
            }
            className="w-full rounded-xl bg-[#0b132b] border border-slate-700 px-3 py-2 outline-none focus:border-[#17e1b1]"
          />
        </label>
      </div>

      {/* Платформа получателя / лимит */}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="block mb-1 text-slate-300">Платформа получателя</span>
          <select
            value={filters.platform}
            onChange={(e) => setFilters((f) => ({ ...f, platform: e.target.value }))}
            className="w-full rounded-xl bg-[#0b132b] border border-slate-700 text-slate-600 px-3 py-2 outline-none focus:border-[#17e1b1]"
          >
            <option value="any">Любая</option>
            <option value="tg">Telegram</option>
            <option value="vk">VK</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-slate-300">Ограничение (N)</span>
          <input
            type="number"
            min={1}
            value={limit}
            disabled={sendMode !== 'limit'}
            onChange={(e) => setLimit(Number(e.target.value) || 1)}
            className={`w-full rounded-xl bg-[#0b132b] border border-slate-700 px-3 py-2 outline-none focus:border-[#17e1b1] ${
              sendMode !== 'limit' ? 'opacity-50' : ''
            }`}
          />
        </label>
      </div>
    </div>
  );
}

FiltersCard.propTypes = {
  platforms: PropTypes.shape({
    tg: PropTypes.bool.isRequired,
    vk: PropTypes.bool.isRequired,
  }).isRequired,
  setPlatforms: PropTypes.func.isRequired,
  filters: PropTypes.shape({
    onlyActiveDays: PropTypes.number.isRequired,
    minOrders: PropTypes.number.isRequired,
    platform: PropTypes.oneOf(['any', 'tg', 'vk']).isRequired,
  }).isRequired,
  setFilters: PropTypes.func.isRequired,
  limit: PropTypes.number.isRequired,
  setLimit: PropTypes.func.isRequired,
  sendMode: PropTypes.oneOf(['all', 'limit', 'selected']).isRequired,
};
