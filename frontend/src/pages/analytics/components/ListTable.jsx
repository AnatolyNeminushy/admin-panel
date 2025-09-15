export default function ListTable({ items }) {
  return (
    <div className="max-h[360px] md:max-h-[360px] overflow-auto custom-scroll">
      <table className="w-full text-sm min-w-[500px]">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Гость</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Сумма</th>
            <th className="text-left px-4 py-2 font-medium text-gray-600">Дата</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-gray-400 italic">
                Ничего не найдено
              </td>
            </tr>
          ) : (
            items.map((it, i) => (
              <tr key={i} className={i % 2 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-4 py-2">{it.guest_name || "—"}</td>
                <td className="px-4 py-2">
                  {Number(it.total_amount || 0).toLocaleString("ru-RU")} ₽
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {it.date ? new Date(it.date).toLocaleString("ru-RU") : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
