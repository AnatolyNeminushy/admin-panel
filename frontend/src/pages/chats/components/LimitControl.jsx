// src/components/LimitControl.jsx
export default function LimitControl({ visibleCount, setVisibleCount, totalCount, shownCount, filteredCount, showTotalNote }) {
  return (
    <div className="flex items-start justify-between mb-3 gap-3">
      <div className="text-xs text-gray-700 leading-tight">
        <span>Показано:</span><br />
        <span>{shownCount} из {filteredCount}</span>
        {showTotalNote && (
          <div className="text-[10px] text-gray-500">(в базе всего: {totalCount})</div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">Сколько показать:</label>
        <input
          type="number"
          min={1}
          max={Math.max(totalCount, 1)}
          step={1}
          className="w-20 text-xs border rounded px-2 py-1"
          value={visibleCount}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (Number.isFinite(val)) {
              setVisibleCount(Math.max(1, Math.min(val, totalCount || val)));
            }
          }}
        />
      </div>
    </div>
  );
}
