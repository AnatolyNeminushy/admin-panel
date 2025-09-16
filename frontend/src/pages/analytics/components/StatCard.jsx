// pages/analytics/components/StatCard.jsx
// Карточка с ключевой метрикой: иконка, значение и подпись.
import PropTypes from 'prop-types';

export default function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center flex flex-col items-center">
      <span className="text-[36px] mb-1" aria-hidden="true">
        {icon}
      </span>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-600 mt-1 text-sm">{label}</div>
    </div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.node, // эмодзи/иконка/реакт-элемент
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

StatCard.defaultProps = {
  icon: null,
};
