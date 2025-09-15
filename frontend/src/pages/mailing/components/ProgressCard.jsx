// src/pages/mailing/components/ProgressCard.jsx
export default function ProgressCard({ progress }) {
if (!progress) return null;
return (
<div className="bg-[#0f1a3a] rounded-2xl p-4 shadow">
<div className="text-white font-semibold mb-2">Результат</div>
{progress.error && <div className="text-red-400 mb-2">Ошибка: {progress.error}</div>}
<div className="text-sm text-slate-300 grid grid-cols-2 md:grid-cols-4 gap-3">
<div>Всего получателей: <b>{progress.total ?? 0}</b></div>
<div>Отправлено: <b>{progress.sent ?? 0}</b></div>
<div>Ошибки: <b>{progress.failed ?? 0}</b></div>
<div>Режим: <b>{progress.mode || (progress.testMode ? "тест" : "боевой")}</b></div>
</div>
{Array.isArray(progress.items) && progress.items.length > 0 && (
<div className="mt-4 max-h-72 overflow-auto rounded-lg border border-slate-700">
<table className="w-full text-sm">
<thead className="bg-[#0b132b] text-slate-300">
<tr>
<th className="text-left p-2">chat_id</th>
<th className="text-left p-2">platform</th>
<th className="text-left p-2">status</th>
<th className="text-left p-2">detail</th>
</tr>
</thead>
<tbody>
{progress.items.map((r, idx) => (
<tr key={idx} className="border-t border-slate-700">
<td className="p-2">{r.chat_id}</td>
<td className="p-2">{r.platform}</td>
<td className="p-2">{r.ok ? "ok" : "fail"}</td>
<td className="p-2">{r.detail || "—"}</td>
</tr>
))}
</tbody>
</table>
</div>
)}
</div>
);
}