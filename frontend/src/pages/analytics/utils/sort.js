export const sortItems = (arr, { by, dir }) => {
  const mult = dir === "asc" ? 1 : -1;
  return arr.slice().sort((a, b) => {
    let av, bv;
    if (by === "guest_name") {
      av = (a.guest_name || "").toLowerCase();
      bv = (b.guest_name || "").toLowerCase();
      if (av < bv) return -1 * mult;
      if (av > bv) return 1 * mult;
      return 0;
    }
    if (by === "total_amount") {
      av = Number(a.total_amount || 0);
      bv = Number(b.total_amount || 0);
      return (av - bv) * mult;
    }
    av = a.date ? new Date(a.date).getTime() : 0;
    bv = b.date ? new Date(b.date).getTime() : 0;
    return (av - bv) * mult;
  });
};
