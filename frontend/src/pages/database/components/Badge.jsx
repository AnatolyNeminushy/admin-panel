// pages/database/components/Badge.jsx

/**
 * Небольшой бейдж для выделения статуса/метки в таблицах/карточках.
 * Рендерит слот children внутри стилизованного <span>.
 */
export default function Badge({ children }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-100">
      {children}
    </span>
  );
}
