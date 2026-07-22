import { useState } from 'react';
import { CheckCircle2, Wallet, Clock, AlertTriangle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { PaymentBadge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { formatCurrency, formatDate } from '../../lib/format';
import type { PaymentStatus } from '../../data/types';

export function AdminPayments() {
  const { payments, members, markPaymentStatus } = useData();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'todos' | PaymentStatus>('todos');

  const handleMarkPaid = (paymentId: string, memberName: string) => {
    markPaymentStatus(paymentId, 'pagado');
    showToast(`Pago de ${memberName} marcado como pagado.`, 'success');
  };

  const totalPaid = payments.filter((p) => p.status === 'pagado').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'pendiente');
  const overdue = payments.filter((p) => p.status === 'vencido');

  const sorted = [...payments]
    .filter((p) => statusFilter === 'todos' || p.status === statusFilter)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Pagos</h1>
          <p style={{ color: 'var(--gray)' }}>Control de pagos y membresías.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={<Wallet size={20} />} label="Total cobrado" value={formatCurrency(totalPaid)} />
        <StatCard icon={<Clock size={20} />} label="Pagos pendientes" value={pending.length} />
        <StatCard icon={<AlertTriangle size={20} />} label="Pagos vencidos" value={overdue.length} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          style={{ background: 'var(--black-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', color: 'var(--white)' }}
        >
          <option value="todos">Todos los estados</option>
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Miembro</th>
              <th>Plan</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const member = members.find((m) => m.id === p.memberId);
              return (
                <tr key={p.id}>
                  <td>
                    <div className="cell-user">
                      {member && <img src={member.avatar} alt={member.name} />}
                      <span className="cell-user-name">{member?.name ?? '—'}</span>
                    </div>
                  </td>
                  <td>{p.plan}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td><PaymentBadge status={p.status} /></td>
                  <td>
                    {p.status !== 'pagado' && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleMarkPaid(p.id, member?.name ?? 'miembro')}>
                        <CheckCircle2 size={14} /> Marcar pagado
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
