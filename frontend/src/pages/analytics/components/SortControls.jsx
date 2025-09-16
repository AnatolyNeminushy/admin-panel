// pages/analytics/components/SortControls.jsx
// Панель сортировки: выбор поля и направления.
import PropTypes from 'prop-types';

export default function SortControls({ sort, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="sort-by">
        Поле сортировки
      </label>
      <select
        id="sort-by"
        className="border rounded-lg px-2 py-1.5 text-sm"
        value={sort.by}
        onChange={(e) => onChange((s) => ({ ...s, by: e.target.value }))}
      >
        <option value="date">Дата</option>
        <option value="guest_name">Гость</option>
        <option value="total_amount">Сумма</option>
      </select>

      <button
        type="button"
        className="border rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
        title={sort.dir === 'asc' ? 'По возрастанию' : 'По убыванию'}
        onClick={() => onChange((s) => ({ ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' }))}
        aria-label={sort.dir === 'asc' ? 'Сортировать по возрастанию' : 'Сортировать по убыванию'}
      >
        {sort.dir === 'asc' ? '▲' : '▼'}
      </button>
    </div>
  );
}

SortControls.propTypes = {
  sort: PropTypes.shape({
    by: PropTypes.string.isRequired,
    dir: PropTypes.oneOf(['asc', 'desc']).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
