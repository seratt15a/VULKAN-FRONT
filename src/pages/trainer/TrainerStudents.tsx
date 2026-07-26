import { useState, type FormEvent } from 'react';
import { CheckCircle2, Circle, ClipboardList, Ruler, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { MembershipBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ExerciseAnimation } from '../../components/ExerciseAnimation';
import { sortByDay } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';
import { exerciseLibrary } from '../../lib/exerciseLibrary';
import type { Exercise, GymClass, Member } from '../../data/types';

type ExerciseRow = Exercise;

const emptyExercise: ExerciseRow = { name: exerciseLibrary[0].name, sets: 3, reps: '10', libraryKey: exerciseLibrary[0].key };

export function TrainerStudents() {
  usePageTitle('Mis Alumnos');
  const { session } = useAuth();
  const { classes, members, workoutPlans, toggleAttendance, addWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan, addBodyMeasurement, logAudit } =
    useData();
  const { showToast } = useToast();

  const [routineTarget, setRoutineTarget] = useState<Member | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [routineTitle, setRoutineTitle] = useState('');
  const [exercises, setExercises] = useState<ExerciseRow[]>([{ ...emptyExercise }]);
  const [pendingDeletePlanId, setPendingDeletePlanId] = useState<string | null>(null);

  const [measurementTarget, setMeasurementTarget] = useState<Member | null>(null);
  const [bodyFatPercent, setBodyFatPercent] = useState(20);
  const [waistCm, setWaistCm] = useState(80);
  const [chestCm, setChestCm] = useState(95);
  const [armCm, setArmCm] = useState(30);

  const myClasses = sortByDay(classes.filter((c) => c.trainerId === session?.trainerId));

  const latestPlanFor = (memberId: string) =>
    workoutPlans.filter((p) => p.memberId === memberId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

  const handleToggleAttendance = (gymClass: GymClass, member: Member) => {
    toggleAttendance(gymClass.id, member.id);
    const wasAttended = gymClass.attendedIds.includes(member.id);
    showToast(wasAttended ? `Se quitó la asistencia de ${member.name}.` : `${member.name} marcado como presente.`, wasAttended ? 'info' : 'success');
  };

  const openRoutineModal = (member: Member) => {
    const existing = latestPlanFor(member.id);
    if (existing) {
      setRoutineTitle(existing.title);
      setExercises(existing.exercises.length ? existing.exercises : [{ ...emptyExercise }]);
      setEditingPlanId(existing.id);
    } else {
      setRoutineTitle('');
      setExercises([{ ...emptyExercise }]);
      setEditingPlanId(null);
    }
    setRoutineTarget(member);
  };

  const openMeasurementModal = (member: Member) => {
    const latest = [...member.bodyMeasurements].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    setBodyFatPercent(latest?.bodyFatPercent ?? 20);
    setWaistCm(latest?.waistCm ?? 80);
    setChestCm(latest?.chestCm ?? 95);
    setArmCm(latest?.armCm ?? 30);
    setMeasurementTarget(member);
  };

  const updateExercise = (index: number, patch: Partial<ExerciseRow>) => {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, ...patch } : ex)));
  };

  const handleSubmitRoutine = (e: FormEvent) => {
    e.preventDefault();
    if (!routineTarget || !session?.trainerId) return;
    const cleanExercises = exercises.filter((ex) => ex.name.trim().length > 0);
    if (editingPlanId) {
      updateWorkoutPlan(editingPlanId, { title: routineTitle, exercises: cleanExercises });
      showToast(`Se actualizó la rutina de ${routineTarget.name}.`, 'success');
    } else {
      addWorkoutPlan({ memberId: routineTarget.id, trainerId: session.trainerId, title: routineTitle, exercises: cleanExercises });
      showToast(`Rutina asignada a ${routineTarget.name}.`, 'success');
    }
    setRoutineTarget(null);
  };

  const confirmDeletePlan = () => {
    if (!pendingDeletePlanId) return;
    deleteWorkoutPlan(pendingDeletePlanId);
    logAudit(session?.name ?? 'Entrenador', `Eliminó la rutina de ${routineTarget?.name ?? 'un miembro'}`);
    showToast('Se eliminó la rutina.', 'info');
    setPendingDeletePlanId(null);
    setRoutineTarget(null);
  };

  const handleSubmitMeasurement = (e: FormEvent) => {
    e.preventDefault();
    if (!measurementTarget) return;
    addBodyMeasurement(measurementTarget.id, {
      date: new Date().toISOString().slice(0, 10),
      bodyFatPercent,
      waistCm,
      chestCm,
      armCm,
    });
    showToast(`Medición registrada para ${measurementTarget.name}.`, 'success');
    setMeasurementTarget(null);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Mis Alumnos</h1>
          <p style={{ color: 'var(--gray)' }}>Asistencia, rutinas y mediciones por clase.</p>
        </div>
      </div>

      {myClasses.map((c) => {
        const roster = c.bookedIds.map((id) => members.find((m) => m.id === id)).filter((m): m is NonNullable<typeof m> => Boolean(m));
        return (
          <div key={c.id} className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>{c.name}</h2>
                <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>{c.day} · {c.startTime}</span>
              </div>
              <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>{roster.length}/{c.capacity} alumnos</span>
            </div>
            {roster.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {roster.map((m) => {
                  const attended = c.attendedIds.includes(m.id);
                  const hasPlan = Boolean(latestPlanFor(m.id));
                  return (
                    <div key={m.id} className="cell-user" style={{ justifyContent: 'space-between' }}>
                      <div className="cell-user">
                        <img src={m.avatar} alt={m.name} />
                        <div>
                          <div className="cell-user-name">{m.name}</div>
                          <div className="cell-user-sub">{m.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MembershipBadge status={m.status} />
                        <button
                          className="icon-btn"
                          style={attended ? { borderColor: 'var(--green)', color: 'var(--green)' } : undefined}
                          onClick={() => handleToggleAttendance(c, m)}
                          aria-label={attended ? 'Quitar asistencia' : 'Marcar asistencia'}
                          title={attended ? 'Asistió' : 'Marcar asistencia'}
                        >
                          {attended ? <CheckCircle2 /> : <Circle />}
                        </button>
                        <button
                          className="icon-btn"
                          style={hasPlan ? { borderColor: 'var(--red)', color: 'var(--red)' } : undefined}
                          onClick={() => openRoutineModal(m)}
                          aria-label={hasPlan ? 'Editar rutina' : 'Asignar rutina'}
                          title={hasPlan ? 'Editar rutina' : 'Asignar rutina'}
                        >
                          <ClipboardList />
                        </button>
                        <button className="icon-btn" onClick={() => openMeasurementModal(m)} aria-label="Registrar medición" title="Registrar medición">
                          <Ruler />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--gray-dim)', fontSize: '0.88rem' }}>Sin alumnos inscritos todavía.</p>
            )}
          </div>
        );
      })}
      {myClasses.length === 0 && <div className="empty-state">No tienes clases asignadas todavía.</div>}

      {routineTarget && (
        <Modal title={`${editingPlanId ? 'Editar' : 'Asignar'} rutina — ${routineTarget.name}`} onClose={() => setRoutineTarget(null)}>
          <form onSubmit={handleSubmitRoutine}>
            <div className="form-group">
              <label htmlFor="routineTitle">Título</label>
              <input id="routineTitle" value={routineTitle} onChange={(e) => setRoutineTitle(e.target.value)} placeholder="Ej. Fuerza — Bloque 1" required />
            </div>

            {exercises.map((ex, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <ExerciseAnimation name={ex.name} libraryKey={ex.libraryKey} size={72} />
                <div className="form-row" style={{ flex: 1, alignItems: 'end', gridTemplateColumns: '2fr 1fr 1fr auto', marginBottom: 0 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor={`ex-name-${i}`}>Ejercicio</label>
                    <select
                      id={`ex-name-${i}`}
                      value={ex.libraryKey ?? 'custom'}
                      onChange={(e) => {
                        const key = e.target.value;
                        if (key === 'custom') {
                          updateExercise(i, { libraryKey: undefined, name: '' });
                        } else {
                          const lib = exerciseLibrary.find((x) => x.key === key);
                          if (lib) updateExercise(i, { name: lib.name, libraryKey: lib.key });
                        }
                      }}
                    >
                      {exerciseLibrary.map((lib) => (
                        <option key={lib.key} value={lib.key}>{lib.name}</option>
                      ))}
                      <option value="custom">Otro (personalizado)</option>
                    </select>
                    {ex.libraryKey === undefined && (
                      <input
                        style={{ marginTop: 8 }}
                        value={ex.name}
                        onChange={(e) => updateExercise(i, { name: e.target.value })}
                        placeholder="Nombre del ejercicio"
                        required
                      />
                    )}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor={`ex-sets-${i}`}>Series</label>
                    <input
                      id={`ex-sets-${i}`}
                      type="number"
                      min={1}
                      value={ex.sets}
                      onChange={(e) => updateExercise(i, { sets: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor={`ex-reps-${i}`}>Reps</label>
                    <input id={`ex-reps-${i}`} value={ex.reps} onChange={(e) => updateExercise(i, { reps: e.target.value })} placeholder="Ej. 10" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setExercises((prev) => prev.filter((_, idx) => idx !== i))}
                      disabled={exercises.length === 1}
                      aria-label="Quitar ejercicio"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-outline btn-sm" onClick={() => setExercises((prev) => [...prev, { ...emptyExercise }])} style={{ marginBottom: 18 }}>
              <Plus size={14} /> Agregar ejercicio
            </button>

            <div className="modal-actions" style={{ justifyContent: editingPlanId ? 'space-between' : 'flex-end' }}>
              {editingPlanId && (
                <button type="button" className="btn btn-danger" onClick={() => setPendingDeletePlanId(editingPlanId)}>
                  Eliminar rutina
                </button>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setRoutineTarget(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPlanId ? 'Guardar cambios' : 'Asignar rutina'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {pendingDeletePlanId && (
        <ConfirmDialog
          title="Eliminar rutina"
          message="¿Seguro que quieres eliminar esta rutina? El miembro dejará de verla en Mi Rutina."
          onConfirm={confirmDeletePlan}
          onCancel={() => setPendingDeletePlanId(null)}
        />
      )}

      {measurementTarget && (
        <Modal title={`Registrar medición — ${measurementTarget.name}`} onClose={() => setMeasurementTarget(null)}>
          <form onSubmit={handleSubmitMeasurement}>
            <p style={{ color: 'var(--gray-dim)', fontSize: '0.8rem', marginBottom: 14 }}>
              Si ya registraste una medición hoy, guardar de nuevo corrige esa entrada en vez de duplicarla.
            </p>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bodyFatPercent">% Grasa corporal</label>
                <input id="bodyFatPercent" type="number" step={0.1} min={0} value={bodyFatPercent} onChange={(e) => setBodyFatPercent(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label htmlFor="waistCm">Cintura (cm)</label>
                <input id="waistCm" type="number" step={0.5} min={0} value={waistCm} onChange={(e) => setWaistCm(Number(e.target.value))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="chestCm">Pecho (cm)</label>
                <input id="chestCm" type="number" step={0.5} min={0} value={chestCm} onChange={(e) => setChestCm(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label htmlFor="armCm">Brazo (cm)</label>
                <input id="armCm" type="number" step={0.5} min={0} value={armCm} onChange={(e) => setArmCm(Number(e.target.value))} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setMeasurementTarget(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar medición
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
