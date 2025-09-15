const API = import.meta.env.VITE_API_URL;

export async function fetchChart(activeTab, { from, to, preset }) {
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  if (preset === "all") qs.set("all", "1");

  const res = await fetch(`${API}/stat/${activeTab}-by-day?${qs.toString()}`);
  return res.json();
}

export async function fetchGlobalStats() {
  const [orders, reserves, ordersSum, extra] = await Promise.all([
    fetch(`${API}/stat/orders`).then((r) => r.json()),
    fetch(`${API}/stat/reserves`).then((r) => r.json()),
    fetch(`${API}/stat/orders-sum`).then((r) => r.json()),
    fetch(`${API}/stat/orders-extra`).then((r) => r.json()),
  ]);

  return {
    orders: orders.count || 0,
    reserves: reserves.count || 0,
    ordersSum: Number(ordersSum.sum || 0),
    avg: Number(extra.avg || 0),
    maxDay: Number(extra.maxDay || 0),
  };
}

export async function fetchOrders(limit = 1000) {
  const res = await fetch(`${API}/orders?limit=${limit}`);
  const data = await res.json();
  return data?.items || [];
}

export async function fetchReserves(limit = 1000) {
  const res = await fetch(`${API}/reserves?limit=${limit}`);
  const data = await res.json();
  return data?.items || [];
}
