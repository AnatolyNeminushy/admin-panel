// src/pages/mailing/components/MessageForm.jsx
import Button from "@/components/Button";


export default function MessageForm({ title, setTitle, text, setText, imageUrl, setImageUrl }) {
return (
<div className="bg-[#0f1a3a] rounded-2xl p-4 space-y-3 shadow">
<div>
<label className="block text-sm text-slate-300 mb-1">Название кампании</label>
<input
value={title}
onChange={(e) => setTitle(e.target.value)}
className="w-full rounded-xl bg-[#0b132b] border border-slate-700 px-3 py-2 outline-none focus:border-[#17e1b1]"
placeholder="Например: Промо -20% до воскресенья"
/>
</div>


<div>
<label className="block text-sm text-slate-300 mb-1">Текст сообщения</label>
<textarea
value={text}
onChange={(e) => setText(e.target.value)}
rows={7}
className="w-full rounded-xl bg-[#0b132b] border border-slate-700 px-3 py-2 outline-none focus:border-[#17e1b1]"
placeholder="Привет! Сегодня у нас спецпредложение…"
/>
<div className="text-xs text-slate-400 mt-1">Простой текст + превью картинки (если укажешь URL ниже).</div>
</div>


<div>
<label className="block text-sm text-slate-300 mb-1">Картинка (URL, опционально)</label>
<input
value={imageUrl}
onChange={(e) => setImageUrl(e.target.value)}
className="w-full rounded-xl bg-[#0b132b] border border-slate-700 px-3 py-2 outline-none focus:border-[#17e1b1]"
placeholder="https://…/banner.jpg"
/>
{imageUrl ? (
<div className="mt-2"><img src={imageUrl} alt="preview" className="rounded-xl max-h-40 object-contain" /></div>
) : null}
</div>
</div>
);
}