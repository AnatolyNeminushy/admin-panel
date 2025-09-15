// src/pages/mailing/MailingPage.jsx
import { useMemo, useState } from "react";
import MessageForm from "./components/MessageForm";
import FiltersCard from "./components/FiltersCard";
import ModeCard from "./components/ModeCard";
import RecipientsCard from "./components/RecipientsCard";
import ProgressCard from "./components/ProgressCard";
import { useRecipients } from "./hooks/useRecipients";
import { useBroadcast } from "./hooks/useBroadcast";
import { parseManualIds, canSend as canSendUtil } from "./utils";


export default function MailingPage() {
const [title, setTitle] = useState("");
const [text, setText] = useState("");
const [imageUrl, setImageUrl] = useState("");
const [platforms, setPlatforms] = useState({ tg: true, vk: false });
const [filters, setFilters] = useState({ onlyActiveDays: 90, minOrders: 0, platform: "any" });
const [testMode, setTestMode] = useState(true);
const [sendMode, setSendMode] = useState("all");
const [limit, setLimit] = useState(50);


const { recipients, setRecipients, loadingRecipients, loadError, loadRecipients } = useRecipients();
const { isSending, progress, setProgress, handleSend } = useBroadcast();


const [selectedIds, setSelectedIds] = useState(new Set());
const [manualIdsText, setManualIdsText] = useState("");


const canSend = useMemo(() => canSendUtil({ text, platforms, sendMode, selectedIds }), [text, platforms, sendMode, selectedIds]);


// выбор чекбоксами
function toggleOne(id) {
setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
}
function clearSelection() { setSelectedIds(new Set()); }
function addManualIds() {
const ids = parseManualIds(manualIdsText);
if (!ids.length) return;
setSelectedIds((prev) => { const next = new Set(prev); ids.forEach((id) => next.add(String(id))); return next; });
setSendMode("selected");
}


async function onLoadRecipients() {
await loadRecipients({ platformsObj: platforms, filters, limit: 500 });
}


async function onSend() {
if (!canSend || isSending) return;
await handleSend({
title: title || "Без названия",
text,
imageUrl: imageUrl || null,
platforms: Object.entries(platforms).filter(([, v]) => v).map(([k]) => k),
filters,
testMode,
mode: sendMode,
limit: sendMode === "limit" ? Number(limit) || null : null,
recipientIds: sendMode === "selected" ? Array.from(selectedIds) : [],
});
}


return (
<div className="p-6 flex flex-col gap-6">
<h1 className="text-xl font-semibold text-[#0b132b]">Рассылка</h1>


<div className="grid gap-4 md:grid-cols-2">
<MessageForm title={title} setTitle={setTitle} text={text} setText={setText} imageUrl={imageUrl} setImageUrl={setImageUrl} />
<div className="flex flex-col gap-4">
<FiltersCard platforms={platforms} setPlatforms={setPlatforms} filters={filters} setFilters={setFilters} limit={limit} setLimit={setLimit} sendMode={sendMode} />
<ModeCard sendMode={sendMode} setSendMode={setSendMode} testMode={testMode} setTestMode={setTestMode} canSend={canSend} onSend={onSend} onLoad={onLoadRecipients} loadingRecipients={loadingRecipients} isSending={isSending} />
{loadError && <div className="text-sm text-red-400">{loadError}</div>}
</div>
<RecipientsCard sendMode={sendMode} recipients={recipients} manualIdsText={manualIdsText} setManualIdsText={setManualIdsText} addManualIds={addManualIds} selectedIds={selectedIds} toggleOne={toggleOne} clearSelection={clearSelection} />
</div>


<ProgressCard progress={progress} />
</div>
);
}