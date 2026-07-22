interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  formatValue?: (value: number) => string;
}

const WIDTH = 560;
const HEIGHT = 200;
const PAD_X = 8;
const PAD_TOP = 24;
const PAD_BOTTOM = 26;

export function BarChart({ data, formatValue = (v) => `${v}` }: BarChartProps) {
  if (data.length === 0) return <p style={{ color: 'var(--gray-dim)', fontSize: '0.88rem' }}>Sin datos suficientes todavía.</p>;

  const max = Math.max(...data.map((d) => d.value), 1);
  const slotWidth = (WIDTH - PAD_X * 2) / data.length;
  const barWidth = Math.min(46, slotWidth * 0.5);
  const chartHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} preserveAspectRatio="none" role="img" aria-label="Gráfica de barras">
      {data.map((d, i) => {
        const barHeight = (d.value / max) * chartHeight;
        const x = PAD_X + i * slotWidth + (slotWidth - barWidth) / 2;
        const y = PAD_TOP + (chartHeight - barHeight);
        return (
          <g key={d.label}>
            <text x={x + barWidth / 2} y={y - 8} fontSize={11} fill="var(--white)" textAnchor="middle" fontWeight={600}>
              {formatValue(d.value)}
            </text>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} fill="var(--red)" />
            <text x={x + barWidth / 2} y={HEIGHT - 6} fontSize={11} fill="var(--gray-dim)" textAnchor="middle">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
