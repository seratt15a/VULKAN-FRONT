import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { usePageTitle } from '../../lib/usePageTitle';
import type { Trainer } from '../../data/types';

type FormState = { name: string; email: string; specialty: string; bio: string };
const emptyForm: FormState = { name: '', email: '', specialty: '', bio: '' };

export function AdminTrainers() {
  usePageTitle('Entrenadores');
  const { trainers, classes, addTrainer, updateTrainer, deleteTrainer, reassignTrainerClasses, logAudit } = useData();
  const { session } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<Trainer | null>(null);
  const [reassignTarget, setReassignTarget] = useState<Trainer | null>(null);
  const [reassignToId, setReassignToId] = useState('');
  const [query, setQuery] = useState(() => (location.state as { presetQuery?: string } | null)?.presetQuery ?? '');

  const filtered = trainers.filter((t) => {
    const q = query.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.specialty.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setForm(emptyForm);
    setCreating(true);
  };

  const openEdit = (t: Trainer) => {
    setForm({ name: t.name, email: t.email, specialty: t.specialty, bio: t.bio });
    setEditing(t);
  };

  const closeModals = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const emailTaken = trainers.some(
      (t) => t.email.toLowerCase() === form.email.trim().toLowerCase() && t.id !== editing?.id,
    );
    if (emailTaken) {
      showToast(`Ya existe un entrenador con el correo ${form.email}.`, 'error');
      return;
    }

    if (editing) {
      updateTrainer(editing.id, form);
      showToast(`Se actualizó a ${form.name}.`, 'success');
    } else {
      addTrainer({
        ...form,
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(form.name)}&backgroundColor=e8112a`,
        activeStudents: 0,
      });
      showToast(`${form.name} se unió al equipo de entrenadores.`, 'success');
    }
    closeModals();
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteTrainer(pendingDelete.id);
    logAudit(session?.name ?? 'Admin', `Eliminó al entrenador ${pendingDelete.name}`);
    showToast(`Se eliminó a ${pendingDelete.name}.`, 'info');
    setPendingDelete(null);
  };

  const handleDeleteClick = (trainer: Trainer) => {
    const assignedCount = classes.filter((c) => c.trainerId === trainer.id).length;
    if (assignedCount === 0) {
      setPendingDelete(trainer);
      return;
    }
    const fallback = trainers.find((t) => t.id !== trainer.id);
    if (!fallback) {
      showToast(`${trainer.name} tiene clases asignadas y no hay otro entrenador para reasignarlas. Crea otro entrenador primero.`, 'error');
      return;
    }
    setReassignToId(fallback.id);
    setReassignTarget(trainer);
  };

  const handleReassignAndDelete = (e: FormEvent) => {
    e.preventDefault();
    if (!reassignTarget) return;
    reassignTrainerClasses(reassignTarget.id, reassignToId);
    deleteTrainer(reassignTarget.id);
    logAudit(session?.name ?? 'Admin', `Eliminó al entrenador ${reassignTarget.name} (clases reasignadas)`);
    showToast(`Se reasignaron las clases de ${reassignTarget.name} y se eliminó su cuenta.`, 'success');
    setReassignTarget(null);
  };

  const reassignClassCount = reassignTarget ? classes.filter((c) => c.trainerId === reassignTarget.id).length : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Entrenadores</h1>
          <p style={{ color: 'var(--gray)' }}>{trainers.length} entrenadores en el equipo.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nuevo entrenador
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="search-input">
          <Search />
          <input placeholder="Buscar por nombre, correo o especialidad..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Entrenador</th>
              <th>Especialidad</th>
              <th>Clases asignadas</th>
              <th>Alumnos activos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td>
                  <div className="cell-user">
                    <img src={t.avatar} alt={t.name} />
                    <div>
                      <div className="cell-user-name">{t.name}</div>
                      <div className="cell-user-sub">{t.email}</div>
                    </div>
                  </div>
                </td>
                <td>{t.specialty}</td>
                <td>{classes.filter((c) => c.trainerId === t.id).length}</td>
                <td>{t.activeStudents}</td>
                <td>
                  <div className="table-actions">
                    <button className="icon-btn" onClick={() => openEdit(t)} aria-label="Editar">
                      <Pencil />
                    </button>
                    <button className="icon-btn" onClick={() => handleDeleteClick(t)} aria-label="Eliminar">
                      <Trash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">No se encontraron entrenadores.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <Modal title={editing ? 'Editar entrenador' : 'Nuevo entrenador'} onClose={closeModals}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tname">Nombre</label>
              <input id="tname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="temail">Correo</label>
              <input id="temail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="specialty">Especialidad</label>
              <input id="specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} required />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={closeModals}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Guardar cambios' : 'Agregar entrenador'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Eliminar entrenador"
          message={`¿Seguro que quieres eliminar a ${pendingDelete.name}? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {reassignTarget && (
        <Modal title={`Reasignar clases de ${reassignTarget.name}`} onClose={() => setReassignTarget(null)}>
          <form onSubmit={handleReassignAndDelete}>
            <p style={{ color: 'var(--gray)', fontSize: '0.88rem', marginBottom: 18 }}>
              {reassignTarget.name} tiene {reassignClassCount} clase{reassignClassCount === 1 ? '' : 's'} asignada{reassignClassCount === 1 ? '' : 's'}.
              Elige a quién se las reasignamos antes de eliminarlo — no puedes dejar clases sin entrenador.
            </p>
            <div className="form-group">
              <label htmlFor="reassignTo">Nuevo entrenador</label>
              <select id="reassignTo" value={reassignToId} onChange={(e) => setReassignToId(e.target.value)}>
                {trainers
                  .filter((t) => t.id !== reassignTarget.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setReassignTarget(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-danger-solid">
                Reasignar y eliminar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
