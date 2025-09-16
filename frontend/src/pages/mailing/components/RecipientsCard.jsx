// pages/mailing/components/RecipientsCard.jsx
import PropTypes from 'prop-types';
import Button from '@/components/Button';

/**
 * Список получателей и блок ручного ввода chat_id.
 * Позволяет добавлять вручную, выбирать чекбоксами и очищать выбор.
 */
export default function RecipientsCard({
  sendMode,
  recipients,
  manualIdsText,
  setManualIdsText,
  addManualIds,
  selectedIds,
  toggleOne,
  clearSelection,
}) {
  return (
    <div className="bg-[#0f1a3a] rounded-2xl p-4 shadow md:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white font-semibold">Получатели</div>
        <div className="text-sm text-slate-300">
          Выбрано: <b>{selectedIds.size}</b> из {recipients.length}
        </div>
      </div>

      {/* Ручной ввод chat_id */}
      <div className="mb-3">
        <div className="text-sm text-slate-300 mb-1">Быстрая отправка по chat_id</div>
        <textarea
          value={manualIdsText}
          onChange={(e) => setManualIdsText(e.target.value)}
          rows={3}
          className="w-full rounded-xl bg-[#0b132b] border border-slate-700 px-3 py-2 outline-none focus:border-[#17e1b1]"
          placeholder={`Вставьте chat_id построчно или через запятую
123456
987654 и др...`}
          aria-label="Вставьте chat_id построчно или через запятую"
        />
        <div className="flex gap-2 mt-2">
          <Button type="button" onClick={addManualIds} variant="tab" size="sm" aria-selected className="px-4">
            Добавить в выборку
          </Button>
          <Button type="button" onClick={clearSelection} variant="tab" size="sm" className="px-4">
            Очистить выбранные
          </Button>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          После добавления выбери режим <b>«Только выбранные получатели»</b> и жми «Проверить/Отправить».
        </div>
      </div>

      {/* Таблица получателей */}
      <div
        className={`max-h-72 overflow-auto rounded-lg border border-slate-700 ${
          sendMode !== 'selected' ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <table className="w-full text-sm">
          <thead className="bg-[#0b132b] text-slate-300">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">chat_id</th>
              <th className="p-2 text-left">platform</th>
            </tr>
          </thead>
          <tbody>
            {recipients.length === 0 && (
              <tr>
                <td className="p-3 text-slate-400" colSpan={3}>
                  Нажми «Загрузить список», чтобы увидеть получателей по текущим фильтрам.
                </td>
              </tr>
            )}
            {recipients.map((r) => {
              const id = String(r.chat_id);
              const checked = selectedIds.has(id);
              const key = `${r.platform || 'p'}:${id}`;
              return (
                <tr key={key} className="border-t border-slate-700">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(id)}
                      aria-label={`Выбрать получателя ${id}`}
                    />
                  </td>
                  <td className="p-2">{id}</td>
                  <td className="p-2">{r.platform}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-400 mt-2">
        В режиме «Выбранные» сообщение уйдёт только тем, кто отмечен чекбоксами.
      </div>
    </div>
  );
}

RecipientsCard.propTypes = {
  sendMode: PropTypes.oneOf(['all', 'limit', 'selected']).isRequired,
  recipients: PropTypes.arrayOf(
    PropTypes.shape({
      chat_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      platform: PropTypes.string,
    }),
  ).isRequired,
  manualIdsText: PropTypes.string.isRequired,
  setManualIdsText: PropTypes.func.isRequired,
  addManualIds: PropTypes.func.isRequired,
  selectedIds: PropTypes.instanceOf(Set).isRequired,
  toggleOne: PropTypes.func.isRequired,
  clearSelection: PropTypes.func.isRequired,
};
