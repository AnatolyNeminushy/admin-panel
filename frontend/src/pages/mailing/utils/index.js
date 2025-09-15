// src/pages/mailing/utils/index.js
export function safeJSON(text) {
try { return JSON.parse(text); } catch { return null; }
}


export function parseManualIds(input) {
return input
.split(/[\s,;]+/)
.map((s) => s.trim())
.filter(Boolean)
.map(String);
}


export function canSend({ text, platforms, sendMode, selectedIds }) {
const anyPlatform = platforms.tg || platforms.vk;
if (sendMode === "selected") return selectedIds.size > 0;
return text.trim().length > 0 && anyPlatform;
}