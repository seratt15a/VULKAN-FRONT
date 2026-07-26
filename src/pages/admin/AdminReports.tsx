import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Users, Download } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/StatCard';
import { BarChart } from '../../components/BarChart';
import { formatCurrency } from '../../lib/format';
import { downloadCsv } from '../../lib/csv';
import { usePageTitle } from '../../lib/usePageTitle';

const MONTH_LABEL = new Intl.DateTimeFormat('es-ES', { month: 'short' });

function defaultFrom() {
  const d = new Date();
  d.setMonth(d.getMonth() - 5, 1);
  return d.toISOString().slice(0, 10);
}

function defaultTo() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(iso: string, days: number) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daySpan(from: string, to: string) {
  return Math.max(1, Math.round((new Date(to + 'T00:00:00').getTime() - new Date(from + 'T00:00:00').getTime()) / 86400000) + 1);
}

export function AdminReports() {
  usePageTitle('Reportes');
  const { members, payments } = useData();
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(defaultTo());

  const inRange = payments.filter((p) => p.status === 'pagado' && p.date >= from && p.date <= to);
  const revenueInRange = inRange.reduce((sum, p) => sum + p.amount, 0);

  const span = daySpan(from, to);
  const prevTo = addDaysIso(from, -1);
  const prevFrom = addDaysIso(from, -span);
  const prevRevenue = payments
    .filter((p) => p.status === 'pagado' && p.date >= prevFrom && p.date <= prevTo)
    .reduce((sum, p) => sum + p.amount, 0);
  const pctChange = prevRevenue > 0 ? Math.round(((revenueInRange - prevRevenue) / prevRevenue) * 100) : null;

  const activeCount = members.filter((m) => m.status === 'activa').length;
  const pausedCount = members.filter((m) => m.status === 'pausada').length;
  const overdueCount = members.filter((m) => m.status === 'vencida').length;
  const churnRate = members.length > 0 ? Math.round((overdueCount / members.length) * 100) : 0;

  const revenueByMonth = new Map<string, number>();
  inRange.forEach((p) => {
    const key = p.date.slice(0, 7);
    revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + p.amount);
  });
  const revenueChartData = [...revenueByMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, value]) => ({
      label: MONTH_LABEL.format(new Date(`${key}-01T00:00:00`)).replace('.', ''),
      value,
    }));

  const pendingInRange = payments.filter((p) => p.status === 'pendiente' && p.date >= from && p.date <= to);
  const overdueInRange = payments.filter((p) => p.status === 'vencido' && p.date >= from && p.date <= to);

  const handleExport = () => {
    downloadCsv(`reporte-${from}-a-${to}.csv`, [
      {
        Desde: from,
        Hasta: to,
        IngresosPagados: revenueInRange,
        PagosPendientes: pendingInRange.length,
        PagosVencidos: overdueInRange.length,
        MiembrosActivos: activeCount,
        MiembrosPausados: pausedCount,
        MiembrosVencidos: overdueCount,
        TasaCancelacionPct: churnRate,
      },
    ]);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Reportes</h1>
          <p style={{ color: 'var(--gray)' }}>Ingresos, retención y comparativas por rango de fechas.</p>
        </div>
        <button className="btn btn-outline" onClick={handleExport}>
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="reportFrom">Desde</label>
          <input id="reportFrom" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="reportTo">Hasta</label>
          <input id="reportTo" type="date" value={to} min={from} max={defaultTo()} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<Wallet size={20} />}
          label="Ingresos en el rango"
          value={formatCurrency(revenueInRange)}
          delta={pctChange !== null ? { value: `${Math.abs(pctChange)}% vs periodo anterior`, direction: pctChange >= 0 ? 'up' : 'down' } : undefined}
        />
        <StatCard icon={<Users size={20} />} label="Miembros activos" value={activeCount} />
        <StatCard icon={pctChange !== null && pctChange < 0 ? <TrendingDown size={20} /> : <TrendingUp size={20} />} label="Miembros pausados" value={pausedCount} />
        <StatCard icon={<TrendingDown size={20} />} label="Tasa de cancelación" value={`${churnRate}%`} />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 16 }}>Ingresos por mes en el rango</h2>
        <BarChart data={revenueChartData} formatValue={(v) => formatCurrency(v)} />
      </div>

      <div className="two-col-14">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Estado de membresía</th>
                <th>Miembros</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Activa</td>
                <td>{activeCount}</td>
              </tr>
              <tr>
                <td>Pausada</td>
                <td>{pausedCount}</td>
              </tr>
              <tr>
                <td>Vencida</td>
                <td>{overdueCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pagos en el rango</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pagados</td>
                <td>{inRange.length}</td>
              </tr>
              <tr>
                <td>Pendientes</td>
                <td>{pendingInRange.length}</td>
              </tr>
              <tr>
                <td>Vencidos</td>
                <td>{overdueInRange.length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
