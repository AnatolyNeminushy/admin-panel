export const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? "—" : d.toLocaleString();
};
