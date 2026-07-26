import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { formatDate } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';
import type { SignupRequest, SignupRequestStatus } from '../../data/types';

export function AdminSignups() {
  usePageTitle('Solicitudes');
  const { members, trainers, signupRequests, approveSignupRequest, rejectSignupRequest } = useData();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'todas' | SignupRequestStatus>('pendiente');
  const [approveTarget, setApproveTarget] = useState<SignupRequest | null>(null);
  const [trainerId, setTrainerId] = useState(trainers[0]?.id ?? '');
  const [rejectTarget, setRejectTarget] = useState<SignupRequest | null>(null);

  const filtered = signupRequests
    .filter((r) => statusFilter === 'todas' || r.status === statusFilter)
    .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));

  const openApprove = (request: SignupRequest) => {
    setTrainerId(trainers[0]?.id ?? '');
    setApproveTarget(request);
  };

  const confirmApprove = () => {
    if (!approveTarget) return;
    const emailTaken = members.some((m) => m.email.toLowerCase() === approveTarget.email.toLowerCase());
    if (emailTaken) {
      showToast(`Ya existe un miembro con el correo ${approveTarget.email}.`, 'error');
      setApproveTarget(null);
      return;
    }
    approveSignupRequest(approveTarget.id, trainerId);
    showToast(`${approveTarget.name} fue aprobado como nuevo miembro.`, 'success');
    setApproveTarget(null);
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    rejectSignupRequest(rejectTarget.id);
    showToast(`Se rechazó la solicitud de ${rejectTarget.name}.`, 'info');
    setRejectTarget(null);
  };

  const statusBadge = (status: SignupRequestStatus) => {
    const cls = status === 'aprobado' ? 'green' : status === 'rechazado' ? 'red' : 'amber';
    return <span className={`badge badge-${cls}`}>{status}</span>;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Solicitudes</h1>
          <p style={{ color: 'var(--gray)' }}>Inscripciones enviadas desde el formulario público.</p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          style={{ background: 'var(--black-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', color: 'var(--white)' }}
        >
          <option value="pendiente">Pendientes</option>
          <option value="aprobado">Aprobadas</option>
          <option value="rechazado">Rechazadas</option>
          <option value="todas">Todas</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Plan de interés</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="cell-user-name">{r.name}</td>
                <td>
                  <div className="cell-user-sub">{r.email}</div>
                  <div className="cell-user-sub">{r.phone}</div>
                </td>
                <td>{r.planInterest}</td>
                <td>{formatDate(r.requestedAt)}</td>
                <td>{statusBadge(r.status)}</td>
                <td>
                  {r.status === 'pendiente' && (
                    <div className="table-actions">
                      <button className="icon-btn" onClick={() => openApprove(r)} aria-label="Aprobar">
                        <Check />
                      </button>
                      <button className="icon-btn" onClick={() => setRejectTarget(r)} aria-label="Rechazar">
                        <X />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">No hay solicitudes en este estado.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {approveTarget && (
        <Modal title={`Aprobar solicitud — ${approveTarget.name}`} onClose={() => setApproveTarget(null)}>
          <p style={{ color: 'var(--gray)', fontSize: '0.88rem', marginBottom: 18 }}>
            Se creará un nuevo miembro con plan {approveTarget.planInterest}. Elige el entrenador asignado.
          </p>
          <div className="form-group">
            <label htmlFor="approveTrainer">Entrenador asignado</label>
            <select id="approveTrainer" value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setApproveTarget(null)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={confirmApprove}>
              Aprobar y crear miembro
            </button>
          </div>
        </Modal>
      )}

      {rejectTarget && (
        <ConfirmDialog
          title="Rechazar solicitud"
          message={`¿Seguro que quieres rechazar la solicitud de ${rejectTarget.name}?`}
          onConfirm={confirmReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </>
  );
}
