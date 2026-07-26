import { useState, type FormEvent } from 'react';
import { CheckCircle2, Wallet, Clock, AlertTriangle, Search, Download, Plus, Pencil, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { PaymentBadge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { formatCurrency, formatDate } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';
import { downloadCsv } from '../../lib/csv';
import type { MembershipPlan, Payment, PaymentStatus } from '../../data/types';

type FormState = { memberId: string; amount: number; date: string; plan: MembershipPlan; status: PaymentStatus };

export function AdminPayments() {
  usePageTitle('Pagos');
  const { payments, members, markPaymentStatus, addPayment, updatePayment, deletePayment } = useData();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'todos' | PaymentStatus>('todos');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Payment | null>(null);

  const emptyForm: FormState = {
    memberId: members[0]?.id ?? '',
    amount: members[0]?.monthlyFee ?? 0,
    date: new Date().toISOString().slice(0, 10),
    plan: members[0]?.plan ?? 'Básico',
    status: 'pagado',
  };
  const [form, setForm] = useState<FormState>(emptyForm);

  const handleMarkPaid = (paymentId: string, memberName: string) => {
    markPaymentStatus(paymentId, 'pagado');
    showToast(`Pago de ${memberName} marcado como pagado.`, 'success');
  };

  const openCreate = () => {
    setForm(emptyForm);
    setCreating(true);
  };

  const openEdit = (p: Payment) => {
    setForm({ memberId: p.memberId, amount: p.amount, date: p.date, plan: p.plan, status: p.status });
    setEditing(p);
  };

  const closeModals = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      updatePayment(editing.id, form);
      showToast('Se actualizó el pago.', 'success');
    } else {
      addPayment(form);
      showToast(`Se registró un pago de ${memberName(form.memberId)}.`, 'success');
    }
    closeModals();
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deletePayment(pendingDelete.id);
    showToast('Se eliminó el pago.', 'info');
    setPendingDelete(null);
  };

  const totalPaid = payments.filter((p) => p.status === 'pagado').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'pendiente');
  const overdue = payments.filter((p) => p.status === 'vencido');

  const memberName = (memberId: string) => members.find((m) => m.id === memberId)?.name ?? '';

  const sorted = [...payments]
    .filter((p) => statusFilter === 'todos' || p.status === statusFilter)
    .filter((p) => memberName(p.memberId).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const handleExport = () => {
    downloadCsv(
      'pagos.csv',
      sorted.map((p) => ({
        Miembro: memberName(p.memberId),
        Plan: p.plan,
        Fecha: p.date,
        Monto: p.amount,
        Estado: p.status,
      })),
    );
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Pagos</h1>
          <p style={{ color: 'var(--gray)' }}>Control de pagos y membresías.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={16} /> Exportar CSV
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Registrar pago
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={<Wallet size={20} />} label="Total cobrado" value={formatCurrency(totalPaid)} />
        <StatCard icon={<Clock size={20} />} label="Pagos pendientes" value={pending.length} />
        <StatCard icon={<AlertTriangle size={20} />} label="Pagos vencidos" value={overdue.length} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-input">
          <Search />
          <input placeholder="Buscar por miembro..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
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
                    <div className="table-actions">
                      {p.status !== 'pagado' && (
                        <button className="btn btn-outline btn-sm" onClick={() => handleMarkPaid(p.id, member?.name ?? 'miembro')}>
                          <CheckCircle2 size={14} /> Marcar pagado
                        </button>
                      )}
                      <button className="icon-btn" onClick={() => openEdit(p)} aria-label="Editar">
                        <Pencil />
                      </button>
                      <button className="icon-btn" onClick={() => setPendingDelete(p)} aria-label="Eliminar">
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">No se encontraron pagos.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <Modal title={editing ? 'Editar pago' : 'Registrar pago'} onClose={closeModals}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="payMember">Miembro</label>
              <select id="payMember" value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="payPlan">Plan</label>
                <select id="payPlan" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value as MembershipPlan })}>
                  {(['Básico', 'Pro', 'Élite'] as MembershipPlan[]).map((plan) => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="payAmount">Monto</label>
                <input id="payAmount" type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="payDate">Fecha</label>
                <input id="payDate" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="payStatus">Estado</label>
                <select id="payStatus" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}>
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="vencido">Vencido</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={closeModals}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Guardar cambios' : 'Registrar pago'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Eliminar pago"
          message="¿Seguro que quieres eliminar este registro de pago? Esta acción no se puede deshacer."
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
