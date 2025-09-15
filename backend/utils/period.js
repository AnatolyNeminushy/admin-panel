// server/utils/period.js
const clampDays = (n, min, max) => Math.max(min, Math.min(max, n));
const todayISO = () => new Date().toISOString().slice(0, 10);
const addDaysISO = (iso, delta) => {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
};

exports.getRange = (req) => {
  let { from, to, all } = req.query;
  const today = todayISO();
  if (!to) to = today;
  if (all === "1") {
    if (!from) from = "1970-01-01";
    return { from, to };
  }
  if (!from) from = addDaysISO(to, -13);
  const diffDays = Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
  const safe = clampDays(diffDays, 1, 366);
  if (diffDays !== safe) from = addDaysISO(to, -(safe - 1));
  return { from, to };
};
