import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  delta?: { value: string; direction: 'up' | 'down' };
}

export function StatCard({ icon, label, value, delta }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-icon">{icon}</span>
        {delta && <span className={`stat-delta ${delta.direction}`}>{delta.direction === 'up' ? '▲' : '▼'} {delta.value}</span>}
      </div>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
