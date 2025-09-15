export default function SortControls({ sort, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded-lg px-2 py-1.5 text-sm"
        value={sort.by}
        onChange={(e) => onChange((s) => ({ ...s, by: e.target.value }))}
      >
        <option value="date">Дата</option>
        <option value="guest_name">Гость</option>
        <option value="total_amount">Сумма</option>
      </select>
      <button
        className="border rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
        title={sort.dir === "asc" ? "По возрастанию" : "По убыванию"}
        onClick={() =>
          onChange((s) => ({ ...s, dir: s.dir === "asc" ? "desc" : "asc" }))
        }
      >
        {sort.dir === "asc" ? "▲" : "▼"}
      </button>
    </div>
  );
}
