// pages/analytics/components/ListTable.jsx
// Компонент таблицы списков заказов/броней.
// Отображает гостя, сумму и дату. Шапка прилипающая, список скроллится.
import PropTypes from 'prop-types';

export default function ListTable({ items }) {
  return (
    <div className="max-h-[360px] md:max-h-[360px] overflow-auto custom-scroll">
      <table className="w-full text-sm min-w-[500px]">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Гость</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Сумма</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Дата</th>
          </tr>
        </thead>
        <tbody>
          {(items?.length ?? 0) === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-gray-400 italic">
                Ничего не найдено
              </td>
            </tr>
          ) : (
            items.map((it) => (
              // Ключ по стабильному идентификатору; если его нет — соберите из полей
              <tr key={it.id ?? `${it.guest_name}-${it.date}-${it.total_amount}`} className="odd:bg-gray-50/50 even:bg-white">
                {/* Имя гостя или тире */}
                <td className="px-4 py-2">{it.guest_name || '—'}</td>

                {/* Сумма в рублях с разделителями разрядов */}
                <td className="px-4 py-2">
                  {new Intl.NumberFormat('ru-RU').format(Number(it.total_amount || 0))} ₽
                </td>

                {/* Дата в локальном формате или тире */}
                <td className="px-4 py-2 whitespace-nowrap">
                  {it.date ? new Date(it.date).toLocaleString('ru-RU') : '—'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

ListTable.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      guest_name: PropTypes.string,
      total_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    }),
  ),
};

ListTable.defaultProps = {
  items: [],
};
