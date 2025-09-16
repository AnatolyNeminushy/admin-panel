// pages/analytics/AnalyticsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { PRESETS } from './constants';
import { fmtISO, addDays } from './utils/date';
import { sortItems } from './utils/sort';
import { fetchChart, fetchGlobalStats, fetchOrders, fetchReserves } from './api';

import StatCard from './components/StatCard';
import SortControls from './components/SortControls';
import SmoothChart from './components/SmoothChart';
import ListTable from './components/ListTable';

/**
 * Страница аналитики заказов и броней:
 * - Верхняя панель: выбор вкладки (заказы/брони) и пресеты дат.
 * - Глобальные сводные показатели (карточки).
 * - График по выбранной вкладке (сумма/количество).
 * - Два списка с фильтрами и сортировкой (заказы и брони).
 */
export default function AnalyticsPage() {
  // ===== Глобальные сводные показатели (общие цифры по системе)
  const [stats, setStats] = useState({
    orders: 0,
    reserves: 0,
    ordersSum: 0,
    avg: 0,
    maxDay: 0,
    loading: true,
  });

  // ===== Верхние фильтры (вкладка и интервал)
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'reserves'
  const [preset, setPreset] = useState('7d');
  const [from, setFrom] = useState(fmtISO(addDays(new Date(), -6)));
  const [to, setTo] = useState(fmtISO(new Date()));
  const [useCustom, setUseCustom] = useState(false);

  // Переключение пресетов дат (или кастомный режим)
  useEffect(() => {
    if (preset === 'custom') {
      setUseCustom(true);
      return;
    }

    setUseCustom(false);
    const today = new Date();

    if (preset === 'all') {
      // Пустые значения => сервер/АПИ трактует как "без ограничений"
      setFrom('');
      setTo('');
    } else {
      const presetDef = PRESETS.find((item) => item.key === preset);
      const days = presetDef?.days ?? 7;
      const start = addDays(today, -(days - 1));
      setFrom(fmtISO(start));
      setTo(fmtISO(today));
    }
  }, [preset]);

  // ===== Данные для графика (агрегированные по дням)
  const [chartLoading, setChartLoading] = useState(true);
  const [chartData, setChartData] = useState([]); // [{ day, count, sum }]

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setChartLoading(true);
        const data = await fetchChart(activeTab, { from, to, preset });
        if (mounted) setChartData(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setChartData([]);
      } finally {
        if (mounted) setChartLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [activeTab, from, to, preset]);

  // ===== Загрузка суммарных статов (карточки)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setStats((s) => ({ ...s, loading: true }));
        const s = await fetchGlobalStats();
        if (mounted) setStats({ ...s, loading: false });
      } catch {
        if (mounted) setStats((s) => ({ ...s, loading: false }));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Подготовка данных для графика (перевод ISO → подпись dd.mm, нормализация чисел)
  const days = useMemo(() => {
    return chartData
      .slice()
      .reverse()
      .map((r) => ({
        dayISO: r.day,
        day: new Date(r.day).toLocaleDateString('ru-RU', { month: '2-digit', day: '2-digit' }),
        count: Number(r.count || 0),
        sum: Number(r.sum || 0),
      }));
  }, [chartData]);

  // ===== Списки ниже графика (заказы и брони)
  const [ordersList, setOrdersList] = useState([]); // [{ guest_name, total_amount, date }]
  const [reservesList, setReservesList] = useState([]);

  // Локальные фильтры (по имени гостя и сумме)
  const [orderFilter, setOrderFilter] = useState({ q: '', min: '', max: '' });
  const [reserveFilter, setReserveFilter] = useState({ q: '', min: '', max: '' });

  // Сортировка списков
  const [orderSort, setOrderSort] = useState({ by: 'date', dir: 'desc' });
  const [reserveSort, setReserveSort] = useState({ by: 'date', dir: 'desc' });

  // Загрузка исходных списков
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [o, r] = await Promise.all([fetchOrders(1000), fetchReserves(1000)]);
        if (!mounted) return;
        setOrdersList(o);
        setReservesList(r);
      } catch {
        if (!mounted) return;
        setOrdersList([]);
        setReservesList([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Применение фильтров/сортировки к заказам
  const filteredOrders = useMemo(() => {
    const q = orderFilter.q.trim().toLowerCase();
    const min = Number(orderFilter.min || 0);
    const max = Number(orderFilter.max || 0);

    const base = ordersList.filter((it) => {
      const guest = String(it.guest_name || '').toLowerCase();
      const total = Number(it.total_amount || 0);
      const byQ = !q || guest.includes(q);
      const byMin = !min || total >= min;
      const byMax = !max || total <= max;
      return byQ && byMin && byMax;
    });

    return sortItems(base, orderSort);
  }, [ordersList, orderFilter, orderSort]);

  // Применение фильтров/сортировки к броням
  const filteredReserves = useMemo(() => {
    const q = reserveFilter.q.trim().toLowerCase();
    const min = Number(reserveFilter.min || 0);
    const max = Number(reserveFilter.max || 0);

    const base = reservesList.filter((it) => {
      const guest = String(it.guest_name || '').toLowerCase();
      const total = Number(it.total_amount || 0);
      const byQ = !q || guest.includes(q);
      const byMin = !min || total >= min;
      const byMax = !max || total <= max;
      return byQ && byMin && byMax;
    });

    return sortItems(base, reserveSort);
  }, [reservesList, reserveFilter, reserveSort]);

  // ===== Рендер
  return (
    <div className="min-h-screen p-6 md:p-10 pb-24 custom-scroll">
      <h1 className="text-xl font-semibold mb-6">Аналитика заказов и броней</h1>

      {/* Верхняя панель фильтров */}
      <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Табы (переключают источник для графика) */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 w-fit">
            {['orders', 'reserves'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={
                  'px-4 py-2 rounded-lg text-sm font-medium ' +
                  (activeTab === t ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900')
                }
              >
                {t === 'orders' ? 'Заказы' : 'Брони'}
              </button>
            ))}
          </div>

          {/* Пресеты (быстрый выбор интервала) */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPreset(p.key)}
                className={
                  'px-3 py-1.5 rounded-lg border text-sm ' +
                  (preset === p.key
                    ? 'bg-[#17E1B1] text-white'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300')
                }
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Кастомные даты (появляются при выборе "Период…") */}
          {useCustom && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">с</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-1.5"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <label className="text-sm text-gray-600">по</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-1.5"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Карточки со сводной статистикой */}
      {stats.loading ? (
        <div className="text-gray-500 text-center mb-6">Загрузка статов…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          <StatCard icon="🏠" label="Всего заказов" value={stats.orders} />
          <StatCard icon="📅" label="Всего броней" value={stats.reserves} />
          <StatCard
            icon="💰"
            label="Сумма заказов"
            value={`${stats.ordersSum.toLocaleString('ru-RU')} ₽`}
          />
          <StatCard
            icon="📈"
            label="Средний чек"
            value={`${stats.avg.toLocaleString('ru-RU')} ₽`}
          />
        </div>
      )}

      {/* График + блок с максимальным днём */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold mb-4 text-lg">
            {activeTab === 'orders' ? 'Динамика заказов (сумма)' : 'Динамика броней (кол-во)'}
          </h2>
          {chartLoading ? (
            <div className="text-gray-500 text-center">Загрузка графика…</div>
          ) : (
            <SmoothChart data={days} yKey={activeTab === 'orders' ? 'sum' : 'count'} height={240} />
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
          <div className="text-6xl mb-3">🔝</div>
          <div className="text-2xl font-bold mb-2">Максимум за день</div>
          <div className="text-3xl font-mono">{stats.maxDay.toLocaleString('ru-RU')} ₽</div>
          <div className="text-gray-500 text-sm mt-2">Самый прибыльный день</div>
        </div>
      </div>

      {/* Списки: Заказы и Брони */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Заказы */}
        <div className="bg-white rounded-2xl shadow">
          <div className="p-4 border-b rounded-t-2xl overflow-visible">
            <div className="font-semibold mb-3">Заказы</div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                placeholder="Имя гостя"
                className="border rounded-lg px-3 py-1.5"
                value={orderFilter.q}
                onChange={(e) => setOrderFilter((f) => ({ ...f, q: e.target.value }))}
              />
              <input
                type="number"
                placeholder="Мин, ₽"
                className="border rounded-lg px-3 py-1.5 w-28"
                value={orderFilter.min}
                onChange={(e) => setOrderFilter((f) => ({ ...f, min: e.target.value }))}
              />
              <input
                type="number"
                placeholder="Макс, ₽"
                className="border rounded-lg px-3 py-1.5 w-28"
                value={orderFilter.max}
                onChange={(e) => setOrderFilter((f) => ({ ...f, max: e.target.value }))}
              />
              <SortControls sort={orderSort} onChange={setOrderSort} />
              <button
                type="button"
                className="ml-auto text-sm text-gray-600 hover:text-black"
                onClick={() => setOrderFilter({ q: '', min: '', max: '' })}
              >
                Сбросить
              </button>
            </div>
          </div>

          <div className="rounded-b-2xl overflow-hidden">
            <ListTable items={filteredOrders} />
          </div>
        </div>

        {/* Брони */}
        <div className="bg-white rounded-2xl shadow">
          <div className="p-4 border-b rounded-t-2xl overflow-visible">
            <div className="font-semibold mb-3">Брони</div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                placeholder="Имя гостя"
                className="border rounded-lg px-3 py-1.5"
                value={reserveFilter.q}
                onChange={(e) => setReserveFilter((f) => ({ ...f, q: e.target.value }))}
              />
              <input
                type="number"
                placeholder="Мин, ₽"
                className="border rounded-lg px-3 py-1.5 w-28"
                value={reserveFilter.min}
                onChange={(e) => setReserveFilter((f) => ({ ...f, min: e.target.value }))}
              />
              <input
                type="number"
                placeholder="Макс, ₽"
                className="border rounded-lg px-3 py-1.5 w-28"
                value={reserveFilter.max}
                onChange={(e) => setReserveFilter((f) => ({ ...f, max: e.target.value }))}
              />
              <SortControls sort={reserveSort} onChange={setReserveSort} />
              <button
                type="button"
                className="ml-auto text-sm text-gray-600 hover:text-black"
                onClick={() => setReserveFilter({ q: '', min: '', max: '' })}
              >
                Сбросить
              </button>
            </div>
          </div>

          <div className="rounded-b-2xl overflow-hidden">
            <ListTable items={filteredReserves} />
          </div>
        </div>
      </div>
    </div>
  );
}
