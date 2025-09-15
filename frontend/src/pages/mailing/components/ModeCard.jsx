// src/pages/mailing/components/ModeCard.jsx
import Button from "@/components/Button";


export default function ModeCard({ sendMode, setSendMode, testMode, setTestMode, canSend, onSend, onLoad, loadingRecipients, isSending }) {
return (
<div className="bg-[#0f1a3a] rounded-2xl p-4 space-y-4 shadow">
<div>
<div className="text-sm text-slate-300 mb-2">Режим</div>
<div className="flex flex-col gap-2 text-slate-400">
<label className="flex items-center gap-2 cursor-pointer">
<input type="radio" name="sendMode" checked={sendMode === "all"} onChange={() => setSendMode("all")} />
<span>Всем по фильтрам</span>
</label>
<label className="flex items-center gap-2 cursor-pointer">
<input type="radio" name="sendMode" checked={sendMode === "limit"} onChange={() => setSendMode("limit")} />
<span>Первые N по фильтрам</span>
</label>
<label className="flex items-center gap-2 cursor-pointer">
<input type="radio" name="sendMode" checked={sendMode === "selected"} onChange={() => setSendMode("selected")} />
<span>Только выбранные получатели</span>
</label>
</div>
</div>


<div className="flex items-center gap-3">
<label className="flex items-center gap-2 cursor-pointer text-slate-600">
<input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} />
<span>Тестовый прогон (без отправки, только выборка)</span>
</label>
</div>


<div className="pt-2 flex gap-3 items-center">
<Button type="button" onClick={onSend} disabled={!canSend || isSending} variant="tab" size="sm" aria-selected={canSend && !isSending} className="px-4">
{isSending ? "Работаю…" : testMode ? "Проверить выборку" : "Отправить"}
</Button>
<Button type="button" onClick={onLoad} disabled={loadingRecipients} loading={loadingRecipients} variant="tab" size="sm" aria-selected title="Загрузит список по текущим фильтрам (до 500)" className="px-4">
Загрузить список
</Button>
{loadingRecipients && <span className="text-sm text-slate-300">получаю получателей…</span>}
</div>
</div>
);
}