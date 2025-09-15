import Button from "@/components/Button";

export default function Toolbar({ title, q, setQ, onSearch, onClear, total, loading }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
      <form
        onSubmit={(e) => { e.preventDefault(); onSearch(); }}
        className="flex items-center gap-2 w-full md:w-auto"
      >
        <input
          className="flex-1 md:w-72 h-10 rounded-full bg-[#0b1533] border border-slate-700 px-4 outline-none focus:border-cyan-500 text-slate-100"
          placeholder="Поиск…"
          value={q.input}
          onChange={(e) => setQ({ ...q, input: e.target.value })}
        />
        <Button type="submit" variant="tab" size="sm" className="px-4">Найти</Button>
        {q.value ? (
          <Button type="button" onClick={onClear} variant="tab" size="sm" className="px-4">
            Сброс
          </Button>
        ) : null}
      </form>
      <div className="text-sm text-slate-500">
        {loading ? "Загрузка…" : `Найдено: ${total}`}
      </div>
    </div>
  );
}
