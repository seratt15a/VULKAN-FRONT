import { useState, type FormEvent } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';
import { usePageTitle } from '../../lib/usePageTitle';
import { formatCurrency, formatDate } from '../../lib/format';

type FormState = { memberId: string; totalSessions: number; price: number };

export function AdminPackages() {
  usePageTitle('Paquetes');
  const { members, sessionPackages, addSessionPackage, useSessionPackageSession } = useData();
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);

  const emptyForm: FormState = { memberId: members[0]?.id ?? '', totalSessions: 10, price: 450 };
  const [form, setForm] = useState<FormState>(emptyForm);

  const memberName = (memberId: string) => members.find((m) => m.id === memberId)?.name ?? '—';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addSessionPackage({ ...form, usedSessions: 0, purchaseDate: new Date().toISOString().slice(0, 10) });
    showToast(`Paquete de ${form.totalSessions} sesiones vendido a ${memberName(form.memberId)}.`, 'success');
    setForm(emptyForm);
    setCreating(false);
  };

  const handleUseSession = (packageId: string, remaining: number) => {
    if (remaining <= 0) return;
    useSessionPackageSession(packageId);
    showToast('Se registró el uso de una sesión.', 'success');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Paquetes</h1>
          <p style={{ color: 'var(--gray)' }}>Paquetes de sesiones vendidos, además de las membresías mensuales.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> Vender paquete
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Miembro</th>
              <th>Sesiones</th>
              <th>Restantes</th>
              <th>Fecha de compra</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessionPackages.map((pkg) => {
              const remaining = pkg.totalSessions - pkg.usedSessions;
              const pct = Math.round((pkg.usedSessions / pkg.totalSessions) * 100);
              return (
                <tr key={pkg.id}>
                  <td className="cell-user-name">{memberName(pkg.memberId)}</td>
                  <td style={{ minWidth: 140 }}>
                    <div className="cap-label" style={{ marginBottom: 6 }}>
                      <span>{pkg.usedSessions}/{pkg.totalSessions}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td>{remaining}</td>
                  <td>{formatDate(pkg.purchaseDate)}</td>
                  <td>{formatCurrency(pkg.price)}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" disabled={remaining <= 0} onClick={() => handleUseSession(pkg.id, remaining)}>
                      <CheckCircle2 size={14} /> Registrar uso
                    </button>
                  </td>
                </tr>
              );
            })}
            {sessionPackages.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">Aún no se han vendido paquetes.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {creating && (
        <Modal title="Vender paquete de sesiones" onClose={() => setCreating(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="memberId">Miembro</label>
              <select id="memberId" value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="totalSessions">Número de sesiones</label>
                <input
                  id="totalSessions"
                  type="number"
                  min={1}
                  value={form.totalSessions}
                  onChange={(e) => setForm({ ...form, totalSessions: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Precio</label>
                <input id="price" type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setCreating(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Vender paquete
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
