import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';
import type { Trainer } from '../../data/types';

type FormState = { name: string; email: string; specialty: string; bio: string };
const emptyForm: FormState = { name: '', email: '', specialty: '', bio: '' };

export function AdminTrainers() {
  const { trainers, classes, addTrainer, updateTrainer, deleteTrainer } = useData();
  const { showToast } = useToast();
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

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

  const handleDelete = (trainer: Trainer) => {
    deleteTrainer(trainer.id);
    showToast(`Se eliminó a ${trainer.name}.`, 'info');
  };

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
            {trainers.map((t) => (
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
                    <button className="icon-btn" onClick={() => handleDelete(t)} aria-label="Eliminar">
                      <Trash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
    </>
  );
}
