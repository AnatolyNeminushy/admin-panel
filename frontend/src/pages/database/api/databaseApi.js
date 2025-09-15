// Можно и через ваш общий axios-инстанс: import api from "@/services/api";
// Здесь — через fetch, берём базовый URL из ENV:
const API = import.meta.env.VITE_API_URL;

export function buildListUrl(tab, { page, pageSize, qValue, filters }) {
  const offset = (page - 1) * pageSize;
  const params = new URLSearchParams({ limit: String(pageSize), offset: String(offset) });
  if (qValue) params.set("q", qValue);

  let path = "/chats";
  if (tab === "messages") { path = "/messages"; params.set("table", "1"); }
  else if (tab === "orders") {
    path = "/orders"; params.set("table","1");
    const f = filters || {};
    if (f.platform) params.set("platform", f.platform);
    if (f.order_type) params.set("order_type", f.order_type);
    if (f.date_from) params.set("date_from", f.date_from);
    if (f.date_to) params.set("date_to", f.date_to);
    if (f.min_total !== "" && f.min_total != null) params.set("min_total", String(f.min_total));
    if (f.max_total !== "" && f.max_total != null) params.set("max_total", String(f.max_total));
  } else if (tab === "reservations") {
    path = "/reserves"; params.set("table","1");
    const f = filters || {};
    if (f.date_from) params.set("date_from", f.date_from);
    if (f.date_to) params.set("date_to", f.date_to);
    if (f.min_guests !== "" && f.min_guests != null) params.set("min_guests", String(f.min_guests));
    if (f.max_guests !== "" && f.max_guests != null) params.set("max_guests", String(f.max_guests));
  }
  return `${API}${path}?${params.toString()}`;
}

export async function loadRows(tab, { page, pageSize, qValue, filters, signal }) {
  const url = buildListUrl(tab, { page, pageSize, qValue, filters });
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  const total = Number(res.headers.get("X-Total-Count") || data.total || 0);
  return { items: Array.isArray(data.items) ? data.items : [], total };
}

export async function saveRow(tab, mode, form, body) {
  const headers = { "Content-Type": "application/json" };
  let url = "", method = mode === "add" ? "POST" : "PUT";

  if (tab === "chats") {
    url = mode === "add" ? `${API}/chats` : `${API}/chats/${body.chat_id}`;
  } else if (tab === "messages") {
    url = mode === "add" ? `${API}/messages-raw` : `${API}/messages/${form.id}`;
  } else if (tab === "orders") {
    url = mode === "add" ? `${API}/orders` : `${API}/orders/${form.id}`;
  } else {
    url = mode === "add" ? `${API}/reserves` : `${API}/reserves/${form.id}`;
  }

  const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("Save error");
}

export async function deleteRow(tab, row) {
  let url = "";
  if (tab === "chats") url = `${API}/chats/${row.chat_id}`;
  else if (tab === "messages") url = `${API}/messages/${row.id}`;
  else if (tab === "orders") url = `${API}/orders/${row.id}`;
  else url = `${API}/reserves/${row.id}`;

  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Delete error (${res.status}): ${text || res.statusText}`);
  }
}
