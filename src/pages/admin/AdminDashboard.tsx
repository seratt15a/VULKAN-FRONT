import { Users, Wallet, Dumbbell, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { MembershipBadge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { BarChart } from '../../components/BarChart';
import { formatCurrency, formatDate } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';

const MONTH_LABEL = new Intl.DateTimeFormat('es-ES', { month: 'short' });

export function AdminDashboard() {
  usePageTitle('Dashboard');
  const { members, classes, payments } = useData();

  const activeMembers = members.filter((m) => m.status === 'activa').length;
  const monthlyRevenue = members.filter((m) => m.status !== 'vencida').reduce((sum, m) => sum + m.monthlyFee, 0);
  const totalBookings = classes.reduce((sum, c) => sum + c.bookedIds.length, 0);
  const overdue = members.filter((m) => m.status === 'vencida');

  const recentPayments = [...payments].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);

  const revenueByMonth = new Map<string, number>();
  payments
    .filter((p) => p.status === 'pagado')
    .forEach((p) => {
      const key = p.date.slice(0, 7);
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + p.amount);
    });
  const revenueChartData = [...revenueByMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-6)
    .map(([key, value]) => ({
      label: MONTH_LABEL.format(new Date(`${key}-01T00:00:00`)).replace('.', ''),
      value,
    }));

  const occupancy = [...classes]
    .map((c) => ({ ...c, pct: Math.min(100, Math.round((c.bookedIds.length / c.capacity) * 100)) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Dashboard</h1>
          <p style={{ color: 'var(--gray)' }}>Vista general del gimnasio VULKAN.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={<Users size={20} />} label="Miembros activos" value={activeMembers} />
        <StatCard icon={<Wallet size={20} />} label="Ingresos mensuales estimados" value={formatCurrency(monthlyRevenue)} />
        <StatCard icon={<Dumbbell size={20} />} label="Reservas de clases" value={totalBookings} />
        <StatCard icon={<TrendingUp size={20} />} label="Membresías vencidas" value={overdue.length} />
      </div>

      <div className="two-col-14">
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 16 }}>Ingresos por mes</h2>
          <BarChart data={revenueChartData} formatValue={(v) => formatCurrency(v)} />
        </div>

        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 16 }}>Ocupación de clases</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {occupancy.map((c) => (
              <div key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                  <span>{c.name}</span>
                  <span style={{ color: 'var(--gray-dim)' }}>
                    {c.bookedIds.length}/{c.capacity}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="two-col-14" style={{ marginBottom: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => {
                const member = members.find((m) => m.id === p.memberId);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="cell-user">
                        {member && <img src={member.avatar} alt={member.name} />}
                        <span className="cell-user-name">{member?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td>{formatDate(p.date)}</td>
                    <td>{formatCurrency(p.amount)}</td>
                    <td>
                      <span className={`badge badge-${p.status === 'pagado' ? 'green' : p.status === 'pendiente' ? 'amber' : 'red'}`}>{p.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 16 }}>Requieren atención</h2>
          {overdue.length === 0 && <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Todo al día. Sin membresías vencidas.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {overdue.map((m) => (
              <div key={m.id} className="cell-user" style={{ justifyContent: 'space-between' }}>
                <div className="cell-user">
                  <img src={m.avatar} alt={m.name} />
                  <div>
                    <div className="cell-user-name">{m.name}</div>
                    <div className="cell-user-sub">Plan {m.plan}</div>
                  </div>
                </div>
                <MembershipBadge status={m.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
