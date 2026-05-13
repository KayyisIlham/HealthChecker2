'use client';

export default function HistoryChart({ data }) {
  if (!data || data.length < 2) return null;

  const recent = data.slice(0, 10).reverse();
  const maxBmi = Math.max(...recent.map(d => d.bmi), 35);
  const minBmi = Math.min(...recent.map(d => d.bmi), 15);
  const range = maxBmi - minBmi || 10;
  const padding = 40;
  const width = 600;
  const height = 200;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = recent.map((d, i) => {
    const x = padding + (i / (recent.length - 1)) * chartW;
    const y = padding + chartH - ((d.bmi - minBmi) / range) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const getColor = (bmi) => {
    if (bmi < 18.5) return '#3b82f6';
    if (bmi < 25) return '#22c55e';
    if (bmi < 30) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="chart-container glass-card">
      <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>📈 Tren IMT</h3>
      <div className="chart-canvas-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding + chartH * (1 - pct);
            const val = (minBmi + range * pct).toFixed(1);
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.05)" />
                <text x={padding - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">{val}</text>
              </g>
            );
          })}
          {/* Normal range band */}
          <rect x={padding} y={padding + chartH - ((25 - minBmi) / range) * chartH}
            width={chartW}
            height={((25 - 18.5) / range) * chartH}
            fill="rgba(34, 197, 94, 0.08)" />
          {/* Area */}
          <path d={areaPath} fill="url(#areaFill)" />
          {/* Line */}
          <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Dots */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill={getColor(p.bmi)} stroke="#0a0e1a" strokeWidth="2" />
              <text x={p.x} y={height - padding + 16} fill="#64748b" fontSize="8" textAnchor="middle">
                {new Date(p.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
