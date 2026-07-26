import { useState, type FormEvent } from 'react';
import { Plus, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { usePageTitle } from '../../lib/usePageTitle';
import { formatCurrency, formatDate } from '../../lib/format';
import type { SessionPackage } from '../../data/types';

type FormState = { memberId: string; totalSessions: number; usedSessions: number; price: number; expirationDate: string };

const defaultExpiration = () => {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 10);
};

export function AdminPackages() {
  usePageTitle('Paquetes');
  const { members, sessionPackages, addSessionPackage, updateSessionPackage, deleteSessionPackage, useSessionPackageSession, logAudit } = useData();
  const { session } = useAuth();
  const { showToast } = useToast();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SessionPackage | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SessionPackage | null>(null);

  const emptyForm: FormState = {
    memberId: members[0]?.id ?? '',
    totalSessions: 10,
    usedSessions: 0,
    price: 450,
    expirationDate: defaultExpiration(),
  };
  const [form, setForm] = useState<FormState>(emptyForm);

  const memberName = (memberId: string) => members.find((m) => m.id === memberId)?.name ?? '—';
  const today = new Date().toISOString().slice(0, 10);

  const openCreate = () => {
    setForm(emptyForm);
    setCreating(true);
  };

  const openEdit = (pkg: SessionPackage) => {
    setForm({
      memberId: pkg.memberId,
      totalSessions: pkg.totalSessions,
      usedSessions: pkg.usedSessions,
      price: pkg.price,
      expirationDate: pkg.expirationDate,
    });
    setEditing(pkg);
  };

  const closeModals = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateSessionPackage(editing.id, form);
      showToast(`Se actualizó el paquete de ${memberName(form.memberId)}.`, 'success');
    } else {
      addSessionPackage({ ...form, usedSessions: 0, purchaseDate: new Date().toISOString().slice(0, 10) });
      showToast(`Paquete de ${form.totalSessions} sesiones vendido a ${memberName(form.memberId)}.`, 'success');
    }
    closeModals();
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteSessionPackage(pendingDelete.id);
    logAudit(session?.name ?? 'Admin', `Eliminó el paquete de ${memberName(pendingDelete.memberId)}`);
    showToast(`Se eliminó el paquete de ${memberName(pendingDelete.memberId)}.`, 'info');
    setPendingDelete(null);
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
        <button className="btn btn-primary" onClick={openCreate}>
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
              <th>Vence</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessionPackages.map((pkg) => {
              const remaining = pkg.totalSessions - pkg.usedSessions;
              const pct = Math.round((pkg.usedSessions / pkg.totalSessions) * 100);
              const expired = pkg.expirationDate < today;
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
                  <td>
                    {formatDate(pkg.expirationDate)}
                    {expired && <span className="badge badge-red" style={{ marginLeft: 8 }}>Vencido</span>}
                  </td>
                  <td>{formatCurrency(pkg.price)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-outline btn-sm" disabled={remaining <= 0 || expired} onClick={() => handleUseSession(pkg.id, remaining)}>
                        <CheckCircle2 size={14} /> Registrar uso
                      </button>
                      <button className="icon-btn" onClick={() => openEdit(pkg)} aria-label="Editar">
                        <Pencil />
                      </button>
                      <button className="icon-btn" onClick={() => setPendingDelete(pkg)} aria-label="Eliminar">
                        <Trash2 />
                      </button>
                    </div>
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

      {(creating || editing) && (
        <Modal title={editing ? 'Editar paquete' : 'Vender paquete de sesiones'} onClose={closeModals}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="memberId">Miembro</label>
              <select id="memberId" value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })} disabled={Boolean(editing)}>
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
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expirationDate">Vence</label>
                <input
                  id="expirationDate"
                  type="date"
                  value={form.expirationDate}
                  onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                />
              </div>
              {editing && (
                <div className="form-group">
                  <label htmlFor="usedSessions">Sesiones usadas</label>
                  <input
                    id="usedSessions"
                    type="number"
                    min={0}
                    max={form.totalSessions}
                    value={form.usedSessions}
                    onChange={(e) => setForm({ ...form, usedSessions: Number(e.target.value) })}
                  />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={closeModals}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Guardar cambios' : 'Vender paquete'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Eliminar paquete"
          message={`¿Seguro que quieres eliminar el paquete de ${memberName(pendingDelete.memberId)}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
