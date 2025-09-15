// src/pages/mailing/hooks/useRecipients.js
import { useState, useCallback } from "react";
import { apiLoadRecipients } from "../api";


export function useRecipients() {
const [recipients, setRecipients] = useState([]);
const [loadingRecipients, setLoading] = useState(false);
const [loadError, setLoadError] = useState("");


const loadRecipients = useCallback(async ({ platformsObj, filters, limit }) => {
setLoading(true); setLoadError("");
try {
const platforms = Object.entries(platformsObj)
.filter(([, v]) => v)
.map(([k]) => k);
if (platforms.length === 0) {
setRecipients([]);
setLoadError("Выберите хотя бы одну платформу (Telegram/VK).");
return;
}
const data = await apiLoadRecipients({ platforms, filters, limit });
setRecipients(Array.isArray(data.items) ? data.items : []);
} catch (e) {
setRecipients([]);
setLoadError(e?.message || "Ошибка загрузки списка");
} finally {
setLoading(false);
}
}, []);


return { recipients, setRecipients, loadingRecipients, loadError, loadRecipients };
}