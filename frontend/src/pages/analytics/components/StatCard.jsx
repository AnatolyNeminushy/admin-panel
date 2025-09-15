export default function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center flex flex-col items-center">
      <span className="text-[36px] mb-1">{icon}</span>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-600 mt-1 text-sm">{label}</div>
    </div>
  );
}
