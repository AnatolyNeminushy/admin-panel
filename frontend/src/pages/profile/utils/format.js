export function fmtDateTime(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return isNaN(d) ? "—" : d.toLocaleString(); // при желании локаль/опции
}
