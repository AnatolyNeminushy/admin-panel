// pages/database/components/EditorModal.jsx
import Button from '@/components/Button';
import { TAB_TITLES } from '../config/constants';

/**
 * Модальное окно редактирования/добавления строки.
 * - Рендерит поля из schema: { key, label, type, required, readOnly, options? }
 * - Управляет формой через setForm (контролируемые инпуты).
 * - Вызывает onSave по кнопке "Сохранить".
 */
export default function EditorModal({
  open,
  mode,        // "add" | "edit"
  tab,         // "chats" | "messages" | "orders" | "reservations"
  schema,      // массив описаний полей
  form, setForm,
  onClose,
  onSave,
}) {
  if (!open) return null;

  const headingId = 'editor-modal-heading';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div className="bg-[#0b1533] border border-slate-700 rounded-2xl w-full max-w-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 id={headingId} className="text-lg font-semibold text-slate-200">
            {mode === 'add' ? 'Добавление' : 'Редактирование'}: {TAB_TITLES[tab]}
          </h2>
          <Button
            type="button"
            onClick={onClose}
            variant="tab"
            size="sm"
            aria-label="Закрыть модальное окно"
            className="px-3 py-1.5 leading-none text-white"
          >
            ✕
          </Button>
        </div>

        {/* Поля формы (контролируемые) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {schema.map((f) => (
            <label
              key={f.key}
              className={`${f.type === 'textarea' ? 'sm:col-span-2' : ''} flex flex-col gap-1`}
            >
              <span className="text-sm text-slate-300">
                {f.label}
                {f.required ? ' *' : ''}
              </span>

              {f.type === 'textarea' ? (
                <textarea
                  disabled={f.readOnly && mode === 'edit'}
                  className="rounded-lg bg-[#09102a] border border-slate-700 px-3 py-2 text-slate-100 min-h-[96px]"
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              ) : f.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-cyan-600"
                  checked={!!form[f.key]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.checked }))}
                />
              ) : f.type === 'select' ? (
                <select
                  className="rounded-lg bg-[#09102a] border border-slate-700 px-3 py-2 text-slate-100"
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                >
                  <option value="">— выберите —</option>
                  {f.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type}
                  disabled={f.readOnly && mode === 'edit'}
                  className="rounded-lg bg-[#09102a] border border-slate-700 px-3 py-2 text-slate-100"
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              )}
            </label>
          ))}
        </div>

        {/* Подсказка для временного chat_id на вкладке "chats" */}
        {tab === 'chats' && (
          <div className="rounded-lg bg-[#09102a] border border-slate-700 p-3 text-xs text-slate-400">
            <b>Подсказка:</b> если не знаете реальный <b>ID чата</b>, оставьте пустым или введите «—».
            Будет создан временный ID (в таблице отобразится как «—»). Сообщения отправлять нельзя,
            пока не замените на реальный ID.
          </div>
        )}

        {/* Кнопки управления */}
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onClose} variant="tab" size="sm" className="px-4">
            Отмена
          </Button>
          <Button type="button" onClick={onSave} variant="tab" size="sm" className="px-4">
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}
