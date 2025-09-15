import { useState } from "react";

export default function SmoothChart({ data, yKey = "sum", height = 220, robustScale = true }) {
  if (!data || !data.length) return <div className="text-gray-400">Нет данных</div>;

  const trimmed = (() => {
    const first = data.findIndex((d) => Number(d[yKey] || 0) > 0);
    const lastRev = [...data].reverse().findIndex((d) => Number(d[yKey] || 0) > 0);
    if (first === -1) return data;
    const last = data.length - 1 - lastRev;
    const from = Math.max(0, first - 2);
    const to = Math.min(data.length, last + 3);
    return data.slice(from, to);
  })();

  const maxPoints = 180;
  const series = (() => {
    if (trimmed.length <= maxPoints) return trimmed;
    const bucket = Math.ceil(trimmed.length / maxPoints);
    const out = [];
    for (let i = 0; i < trimmed.length; i += bucket) {
      const chunk = trimmed.slice(i, i + bucket);
      const mid = chunk[Math.floor(chunk.length / 2)];
      out.push({
        dayISO: mid.dayISO,
        day: mid.day,
        [yKey]: chunk.reduce((s, c) => s + Number(c[yKey] || 0), 0),
      });
    }
    return out;
  })();

  const maxXTicks = 10;
  const step = Math.max(1, Math.ceil(series.length / maxXTicks));

  const values = series.map((d) => Number(d[yKey] || 0)).sort((a, b) => a - b);
  const nonZero = values.filter((v) => v > 0);
  const arr = nonZero.length ? nonZero : values;
  const quantile = (p) => arr[Math.min(arr.length - 1, Math.floor(p * (arr.length - 1)))];
  const maxVal = robustScale
    ? Math.max(quantile(0.9) || 1, values[values.length - 1] || 1)
    : values[values.length - 1] || 1;
  const yMax = Math.max(1, maxVal);

  const niceTicks = (n = 4) => {
    const raw = yMax / n;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    let stepNice = raw;
    for (const b of [1, 2, 5, 10]) {
      if (b * pow >= raw) { stepNice = b * pow; break; }
    }
    return Array.from({ length: n + 1 }, (_, i) => Math.round(stepNice * i));
  };
  const ticks = niceTicks(4);

  const W = 560, H = height;
  const pad = { t: 16, r: 16, b: 28, l: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const normX = (i) => pad.l + (i / (series.length - 1 || 1)) * plotW;
  const normY = (v) => pad.t + (1 - v / yMax) * plotH;

  const pathD = (() => {
    if (series.length === 1) {
      const x = normX(0), y = normY(series[0][yKey]);
      return `M${x} ${y} L${x + 0.01} ${y}`;
    }
    let d = "";
    for (let i = 0; i < series.length; i++) {
      const x = normX(i), y = normY(series[i][yKey]);
      if (i === 0) d += `M${x} ${y}`;
      else {
        const x0 = normX(i - 1), y0 = normY(series[i - 1][yKey]);
        const cx1 = x0 + (x - x0) / 2, cy1 = y0;
        const cx2 = x0 + (x - x0) / 2, cy2 = y;
        d += ` C${cx1} ${cy1}, ${cx2} ${cy2}, ${x} ${y}`;
      }
    }
    return d;
  })();

  const areaD = `${pathD} L${normX(series.length - 1)} ${normY(0)} L${normX(0)} ${normY(0)} Z`;

  const [hover, setHover] = useState(null);
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = rect.width / W;
    const xVB = (e.clientX - rect.left) / sx;
    const relX = xVB - pad.l;
    const ratio = Math.max(0, Math.min(1, relX / plotW));
    const i = Math.round(ratio * (series.length - 1));
    setHover({ i, x: normX(i), y: normY(series[i][yKey]) });
  };

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        style={{ width: "100%", height: "auto", aspectRatio: `${W}/${H}`, cursor: "crosshair" }}
      >
        {ticks.map((t, idx) => {
          const y = normY(t);
          return (
            <g key={idx}>
              <line x1={pad.l} x2={pad.l + plotW} y1={y} y2={y} stroke="rgba(0,0,0,0.08)" strokeDasharray="4 4" />
              <text x={pad.l - 8} y={y + 4} fontSize="10" textAnchor="end" fill="#6b7280">
                {t.toLocaleString("ru-RU")}
              </text>
            </g>
          );
        })}

        {series.map((d, i) => {
          if (i % step !== 0 && i !== series.length - 1) return null;
          const x = normX(i);
          return (
            <text key={i} x={x} y={H - 8} fontSize="10" textAnchor="middle" fill="#6b7280">
              {d.day}
            </text>
          );
        })}

        <defs>
          <linearGradient id="lineFill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#17e1b1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#17e1b1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineFill2)" />
        <path d={pathD} fill="none" stroke="#17e1b1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {hover && (
          <>
            <line x1={hover.x} x2={hover.x} y1={pad.t} y2={pad.t + plotH} stroke="rgba(0,0,0,0.15)" />
            <circle cx={hover.x} cy={hover.y} r="4" fill="#17e1b1" />
            <rect x={Math.min(hover.x + 8, W - 130)} y={pad.t + 8} width="122" height="46" rx="8" fill="rgba(0,0,0,0.75)" />
            <text x={Math.min(hover.x + 18, W - 120)} y={pad.t + 26} fontSize="11" fill="#fff">
              {series[hover.i].day}
            </text>
            <text x={Math.min(hover.x + 18, W - 120)} y={pad.t + 44} fontSize="12" fill="#fff" fontWeight="600">
              {series[hover.i][yKey].toLocaleString("ru-RU")}
              {yKey === "sum" ? " ₽" : ""}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
