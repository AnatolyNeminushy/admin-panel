// src/pages/mailing/hooks/useBroadcast.js
import { useState, useCallback } from "react";
import { apiStartBroadcast } from "../api";


export function useBroadcast() {
const [isSending, setIsSending] = useState(false);
const [progress, setProgress] = useState(null);


const handleSend = useCallback(async (payload) => {
setIsSending(true);
setProgress({ total: 0, sent: 0, failed: 0, items: [] });
try {
const data = await apiStartBroadcast(payload);
setProgress(data);
} catch (e) {
setProgress((p) => ({ ...(p || {}), error: e?.message || "Ошибка сети" }));
} finally {
setIsSending(false);
}
}, []);


return { isSending, progress, setProgress, handleSend };
}