import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Search, Snowflake, Check, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { MembershipBadge } from '../../components/Badge';
import { formatDate } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';
import type { Member, MembershipPlan, MembershipStatus } from '../../data/types';

const planFee: Record<MembershipPlan, number> = { Básico: 29, Pro: 49, Élite: 89 };

type FormState = {
  name: string;
  email: string;
  plan: MembershipPlan;
  status: MembershipStatus;
  nextPaymentDate: string;
  trainerId: string;
  weightGoalKg: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
};

export function AdminMembers() {
  usePageTitle('Miembros');
  const { members, trainers, addMember, updateMember, deleteMember, resolveFreezeRequest } = useData();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | MembershipStatus>('todas');
  const [editing, setEditing] = useState<Member | null>(null);
  const [creating, setCreating] = useState(false);

  const emptyForm: FormState = {
    name: '',
    email: '',
    plan: 'Básico',
    status: 'activa',
    nextPaymentDate: new Date().toISOString().slice(0, 10),
    trainerId: trainers[0]?.id ?? '',
    weightGoalKg: 70,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  };
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Member | null>(null);

  const filtered = members.filter((m) => {
    const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'todas' || m.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const openCreate = () => {
    setForm(emptyForm);
    setCreating(true);
  };

  const openEdit = (member: Member) => {
    setForm({
      name: member.name,
      email: member.email,
      plan: member.plan,
      status: member.status,
      nextPaymentDate: member.nextPaymentDate,
      trainerId: member.trainerId,
      weightGoalKg: member.weightGoalKg,
      emergencyContactName: member.emergencyContact.name,
      emergencyContactPhone: member.emergencyContact.phone,
      emergencyContactRelationship: member.emergencyContact.relationship,
    });
    setEditing(member);
  };

  const closeModals = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const { emergencyContactName, emergencyContactPhone, emergencyContactRelationship, ...rest } = form;
    const emergencyContact = {
      name: emergencyContactName,
      phone: emergencyContactPhone,
      relationship: emergencyContactRelationship,
    };

    if (editing) {
      updateMember(editing.id, { ...rest, emergencyContact, monthlyFee: planFee[form.plan] });
      showToast(`Se actualizó a ${form.name}.`, 'success');
    } else {
      addMember({
        ...rest,
        emergencyContact,
        monthlyFee: planFee[form.plan],
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(form.name)}&backgroundColor=e8112a`,
        joinDate: new Date().toISOString().slice(0, 10),
        checkIns: 0,
        currentStreakDays: 0,
        weightHistory: [],
        bodyMeasurements: [],
        progressPhotos: [],
        freezeRequest: null,
      });
      showToast(`${form.name} fue agregado como nuevo miembro.`, 'success');
    }
    closeModals();
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMember(pendingDelete.id);
    showToast(`Se eliminó a ${pendingDelete.name}.`, 'info');
    setPendingDelete(null);
  };

  const handleResolveFreeze = (member: Member, approve: boolean) => {
    resolveFreezeRequest(member.id, approve);
    showToast(
      approve ? `Se pausó la membresía de ${member.name}.` : `Se rechazó la solicitud de pausa de ${member.name}.`,
      approve ? 'success' : 'info',
    );
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Nombre</label>
        <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="form-group">
        <label htmlFor="email">Correo</label>
        <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="plan">Plan</label>
          <select id="plan" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value as MembershipPlan })}>
            <option value="Básico">Básico</option>
            <option value="Pro">Pro</option>
            <option value="Élite">Élite</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="status">Estado</label>
          <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MembershipStatus })}>
            <option value="activa">Activa</option>
            <option value="pausada">Pausada</option>
            <option value="vencida">Vencida</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="nextPaymentDate">Próximo pago</label>
          <input
            id="nextPaymentDate"
            type="date"
            value={form.nextPaymentDate}
            onChange={(e) => setForm({ ...form, nextPaymentDate: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="weightGoalKg">Meta de peso (kg)</label>
          <input
            id="weightGoalKg"
            type="number"
            min={0}
            step={0.5}
            value={form.weightGoalKg}
            onChange={(e) => setForm({ ...form, weightGoalKg: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="trainerId">Entrenador asignado</label>
        <select id="trainerId" value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: '10px 0 14px' }}>Contacto de emergencia</h3>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="emergencyContactName">Nombre del contacto</label>
          <input
            id="emergencyContactName"
            value={form.emergencyContactName}
            onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
            placeholder="Nombre completo"
          />
        </div>
        <div className="form-group">
          <label htmlFor="emergencyContactRelationship">Parentesco</label>
          <input
            id="emergencyContactRelationship"
            value={form.emergencyContactRelationship}
            onChange={(e) => setForm({ ...form, emergencyContactRelationship: e.target.value })}
            placeholder="Ej. Esposa, Padre..."
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="emergencyContactPhone">Teléfono</label>
        <input
          id="emergencyContactPhone"
          value={form.emergencyContactPhone}
          onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
          placeholder="+52 55 0000 0000"
        />
      </div>
      <div className="modal-actions">
        <button type="button" className="btn btn-outline" onClick={closeModals}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          {editing ? 'Guardar cambios' : 'Agregar miembro'}
        </button>
      </div>
    </form>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Miembros</h1>
          <p style={{ color: 'var(--gray)' }}>{members.length} miembros registrados.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nuevo miembro
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-input">
          <Search />
          <input placeholder="Buscar por nombre o correo..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} style={{ background: 'var(--black-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', color: 'var(--white)' }}>
          <option value="todas">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="pausada">Pausada</option>
          <option value="vencida">Vencida</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Miembro</th>
              <th>Plan</th>
              <th>Estado</th>
              <th>Próximo pago</th>
              <th>Check-ins</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="cell-user">
                    <img src={m.avatar} alt={m.name} />
                    <div>
                      <div className="cell-user-name">{m.name}</div>
                      <div className="cell-user-sub">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td>{m.plan}</td>
                <td>
                  <MembershipBadge status={m.status} />
                  {m.freezeRequest && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--amber)', fontSize: '0.74rem', marginTop: 6 }}>
                      <Snowflake size={12} /> Solicitó pausa
                    </div>
                  )}
                </td>
                <td>{formatDate(m.nextPaymentDate)}</td>
                <td>{m.checkIns}</td>
                <td>
                  <div className="table-actions">
                    {m.freezeRequest && (
                      <>
                        <button className="icon-btn" onClick={() => handleResolveFreeze(m, true)} aria-label="Aprobar pausa" title="Aprobar pausa">
                          <Check />
                        </button>
                        <button className="icon-btn" onClick={() => handleResolveFreeze(m, false)} aria-label="Rechazar pausa" title="Rechazar pausa">
                          <X />
                        </button>
                      </>
                    )}
                    <button className="icon-btn" onClick={() => openEdit(m)} aria-label="Editar">
                      <Pencil />
                    </button>
                    <button className="icon-btn" onClick={() => setPendingDelete(m)} aria-label="Eliminar">
                      <Trash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">No se encontraron miembros.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <Modal title={editing ? 'Editar miembro' : 'Nuevo miembro'} onClose={closeModals}>
          {renderForm()}
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Eliminar miembro"
          message={`¿Seguro que quieres eliminar a ${pendingDelete.name}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
