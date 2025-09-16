// pages/profile/components/Info.jsx
import PropTypes from 'prop-types';

/**
 * Отображает поле профиля:
 * - label — подпись слева/сверху
 * - value — значение, "—" если пусто
 */
export function Info({ label, value }) {
  return (
    <div className="p-3 rounded-xl border">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className="font-medium">{value ?? '—'}</div>
    </div>
  );
}

Info.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
};

Info.defaultProps = {
  value: '—',
};
