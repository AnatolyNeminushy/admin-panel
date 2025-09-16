// pages/mailing/components/ProgressCard.jsx
import PropTypes from 'prop-types';

/**
 * Отображение результата выполнения: счётчики и подробные строки статусов.
 */
export default function ProgressCard({ progress }) {
  if (!progress) return null;

  const items = Array.isArray(progress.items) ? progress.items : [];

  return (
    <div className="bg-[#0f1a3a] rounded-2xl p-4 shadow">
      <div className="text-white font-semibold mb-2">Результат</div>

      {progress.error && <div className="text-red-400 mb-2">Ошибка: {progress.error}</div>}

      <div className="text-sm text-slate-300 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          Всего получателей: <b>{progress.total ?? 0}</b>
        </div>
        <div>
          Отправлено: <b>{progress.sent ?? 0}</b>
        </div>
        <div>
          Ошибки: <b>{progress.failed ?? 0}</b>
        </div>
        <div>
          Режим: <b>{progress.mode || (progress.testMode ? 'тест' : 'боевой')}</b>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-[#0b132b] text-slate-300">
              <tr>
                <th className="text-left p-2">chat_id</th>
                <th className="text-left p-2">platform</th>
                <th className="text-left p-2">status</th>
                <th className="text-left p-2">detail</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const key = `${r.platform || 'p'}:${r.chat_id || 'id'}:${r.detail || ''}`;
                return (
                  <tr key={key} className="border-t border-slate-700">
                    <td className="p-2">{r.chat_id}</td>
                    <td className="p-2">{r.platform}</td>
                    <td className="p-2">{r.ok ? 'ok' : 'fail'}</td>
                    <td className="p-2">{r.detail || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

ProgressCard.propTypes = {
  progress: PropTypes.shape({
    error: PropTypes.string,
    total: PropTypes.number,
    sent: PropTypes.number,
    failed: PropTypes.number,
    mode: PropTypes.string,
    testMode: PropTypes.bool,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        chat_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        platform: PropTypes.string,
        ok: PropTypes.bool,
        detail: PropTypes.string,
      }),
    ),
  }),
};

ProgressCard.defaultProps = {
  progress: null,
};
