export const fmtISO = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD

export const addDays = (date, delta) => {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
};
