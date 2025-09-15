// src/pages/mailing/api/index.js
const API = import.meta.env.VITE_API_URL ;


async function fetchJSON(url, options = {}) {
const res = await fetch(url, options);
const raw = await res.text();
let data;
try {
data = JSON.parse(raw);
} catch {
throw new Error(raw?.slice(0, 200) || "Некорректный ответ сервера");
}
if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
return data;
}


export async function apiLoadRecipients({ platforms, filters, limit = 500 }) {
const params = new URLSearchParams({
platforms: platforms.join(","),
filters: JSON.stringify(filters),
limit: String(limit),
});
return fetchJSON(`${API}/broadcasts/recipients?${params}`);
}


export async function apiStartBroadcast(payload) {
return fetchJSON(`${API}/broadcasts`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});
}