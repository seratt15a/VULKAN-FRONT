import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';
import { sortByDay } from '../../lib/format';
import type { ClassCategory, GymClass } from '../../data/types';

const categories: ClassCategory[] = ['Fuerza', 'HIIT', 'Hipertrofia', 'Movilidad', 'Cardio'];
const days: GymClass['day'][] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

type FormState = {
  name: string;
  category: ClassCategory;
  trainerId: string;
  day: GymClass['day'];
  startTime: string;
  durationMin: number;
  capacity: number;
};

export function AdminClasses() {
  const { classes, trainers, addClass, updateClass, deleteClass } = useData();
  const { showToast } = useToast();
  const [editing, setEditing] = useState<GymClass | null>(null);
  const [creating, setCreating] = useState(false);

  const emptyForm: FormState = {
    name: '',
    category: 'Fuerza',
    trainerId: trainers[0]?.id ?? '',
    day: 'Lun',
    startTime: '07:00',
    durationMin: 60,
    capacity: 12,
  };
  const [form, setForm] = useState<FormState>(emptyForm);

  const openCreate = () => {
    setForm(emptyForm);
    setCreating(true);
  };

  const openEdit = (c: GymClass) => {
    setForm({ name: c.name, category: c.category, trainerId: c.trainerId, day: c.day, startTime: c.startTime, durationMin: c.durationMin, capacity: c.capacity });
    setEditing(c);
  };

  const closeModals = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateClass(editing.id, form);
      showToast(`Se actualizó la clase "${form.name}".`, 'success');
    } else {
      addClass(form);
      showToast(`Se creó la clase "${form.name}".`, 'success');
    }
    closeModals();
  };

  const handleDelete = (gymClass: GymClass) => {
    deleteClass(gymClass.id);
    showToast(`Se eliminó la clase "${gymClass.name}".`, 'info');
  };

  const sorted = sortByDay(classes);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Clases</h1>
          <p style={{ color: 'var(--gray)' }}>{classes.length} clases programadas esta semana.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Nueva clase
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Clase</th>
              <th>Entrenador</th>
              <th>Horario</th>
              <th>Cupo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const trainer = trainers.find((t) => t.id === c.trainerId);
              return (
                <tr key={c.id}>
                  <td>
                    <div className="cell-user-name">{c.name}</div>
                    <div className="cell-user-sub">{c.category}</div>
                  </td>
                  <td>{trainer?.name ?? '—'}</td>
                  <td>{c.day} · {c.startTime} ({c.durationMin} min)</td>
                  <td>{c.bookedIds.length}/{c.capacity}</td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" onClick={() => openEdit(c)} aria-label="Editar">
                        <Pencil />
                      </button>
                      <button className="icon-btn" onClick={() => handleDelete(c)} aria-label="Eliminar">
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <Modal title={editing ? 'Editar clase' : 'Nueva clase'} onClose={closeModals}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cname">Nombre</label>
              <input id="cname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Categoría</label>
                <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ClassCategory })}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="trainer">Entrenador</label>
                <select id="trainer" value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="day">Día</label>
                <select id="day" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as GymClass['day'] })}>
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="startTime">Hora</label>
                <input id="startTime" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="durationMin">Duración (min)</label>
                <input
                  id="durationMin"
                  type="number"
                  min={15}
                  step={5}
                  value={form.durationMin}
                  onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="capacity">Cupo</label>
                <input
                  id="capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={closeModals}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editing ? 'Guardar cambios' : 'Crear clase'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
