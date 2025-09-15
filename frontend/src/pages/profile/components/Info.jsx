export function Info({ label, value }) {
  return (
    <div className="p-3 rounded-xl border">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}
