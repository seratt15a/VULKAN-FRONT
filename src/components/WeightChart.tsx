import type { WeightEntry } from '../data/types';

interface WeightChartProps {
  history: WeightEntry[];
  goalKg: number;
}

const WIDTH = 640;
const HEIGHT = 200;
const PAD_X = 16;
const PAD_Y = 24;

export function WeightChart({ history, goalKg }: WeightChartProps) {
  if (history.length === 0) return <p style={{ color: 'var(--gray-dim)', fontSize: '0.88rem' }}>Aún no hay registros de peso.</p>;

  const values = history.map((h) => h.weightKg).concat(goalKg);
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const range = max - min || 1;

  const stepX = history.length > 1 ? (WIDTH - PAD_X * 2) / (history.length - 1) : 0;
  const yFor = (w: number) => HEIGHT - PAD_Y - ((w - min) / range) * (HEIGHT - PAD_Y * 2);
  const xFor = (i: number) => PAD_X + i * stepX;

  const linePoints = history.map((h, i) => `${xFor(i)},${yFor(h.weightKg)}`).join(' ');
  const areaPoints = `${PAD_X},${HEIGHT - PAD_Y} ${linePoints} ${xFor(history.length - 1)},${HEIGHT - PAD_Y}`;
  const goalY = yFor(goalKg);

  const monthLabel = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} preserveAspectRatio="none" role="img" aria-label="Progreso de peso">
      <line x1={PAD_X} y1={goalY} x2={WIDTH - PAD_X} y2={goalY} stroke="var(--gray-dim)" strokeWidth={1.5} strokeDasharray="4 4" />
      <polygon points={areaPoints} fill="rgba(232,17,42,0.12)" stroke="none" />
      <polyline points={linePoints} fill="none" stroke="var(--red)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {history.map((h, i) => (
        <g key={h.date}>
          <circle cx={xFor(i)} cy={yFor(h.weightKg)} r={4} fill="var(--red)" stroke="var(--black-card)" strokeWidth={2} />
          <text x={xFor(i)} y={HEIGHT - 4} fontSize={10} fill="var(--gray-dim)" textAnchor="middle">
            {monthLabel(h.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}
