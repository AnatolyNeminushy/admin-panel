export default function Button({
  children,
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary",   // primary | secondary | ghost | tab  ← NEW
  grouped = false,
  size = "md",           // sm | md | lg
  className = "",
  ...props
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  // Для табов ширина должна быть авто; для grouped тоже авто; иначе — full
  const isFullWidth = !grouped && variant !== "tab";
  const width = isFullWidth ? "w-full" : "w-auto";

  const base =
    "font-semibold rounded-md transition-colors duration-200 disabled:opacity-60 " +
    "border-0 outline-none focus:outline-none focus:ring-0 active:brightness-90 " +
    width + " " + (sizes[size] || sizes.md);

  const variants = {
    primary:
      "bg-[#13214C] text-white hover:bg-[#17E1B1] hover:text-[#13214C]",
    secondary:
      "bg-[#17E1B1] text-[#13214C] hover:bg-[#13214C] hover:text-white",
    ghost:
      "bg-transparent text-slate-200 hover:bg-white/10 border border-white/10",

    // ====== TAB STYLE (пилюльки) ======
    // Неактивная: тёмная (#13214C) с белым текстом
    // Активная (aria-selected): бирюзовая (#17E1B1) с тёмным текстом
    tab:
      "rounded-full shadow-sm " +
      "bg-[#13214C] text-white " +
      "hover:bg-[#0f1b3d] " +
      "aria-selected:bg-[#17E1B1] aria-selected:text-[#13214C]",
  };

  // Сегментированный (кнопки вплотную) — оставляю как было
  const groupedBase =
    "rounded-none first:rounded-l-xl last:rounded-r-xl " +
    "border first:ml-0 -ml-px focus:z-10";
  const groupedVariant = {
    primary:
      "bg-[#0f1b3d] text-white hover:bg-[#13214C] border-[#1a2b66] " +
      "aria-selected:bg-[#17E1B1] aria-selected:text-[#13214C] aria-selected:border-[#17E1B1]",
    secondary:
      "bg-[#1fe7b7]/10 text-[#17E1B1] hover:bg-[#1fe7b7]/20 border-[#1fe7b7]/40 " +
      "aria-selected:bg-[#17E1B1] aria-selected:text-[#13214C] aria-selected:border-[#17E1B1]",
    ghost:
      "bg-transparent text-slate-200 hover:bg-white/10 border-white/15 " +
      "aria-selected:bg-white/15 aria-selected:text-white",
  };

  const appearance =
    variant === "tab"
      ? variants.tab
      : grouped
      ? `${groupedBase} ${groupedVariant[variant] || groupedVariant.primary}`
      : variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${appearance} ${className}`}
      {...props}
    >
      {loading ? "Загрузка..." : children}
    </button>
  );
}
