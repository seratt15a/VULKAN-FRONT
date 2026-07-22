import { useState, type FormEvent } from 'react';
import { CheckCircle2, Circle, ClipboardList, Ruler, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { MembershipBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { sortByDay } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';
import type { Exercise, GymClass, Member } from '../../data/types';

type ExerciseRow = Exercise;

const emptyExercise: ExerciseRow = { name: '', sets: 3, reps: '10' };

export function TrainerStudents() {
  usePageTitle('Mis Alumnos');
  const { session } = useAuth();
  const { classes, members, toggleAttendance, addWorkoutPlan, addBodyMeasurement } = useData();
  const { showToast } = useToast();

  const [routineTarget, setRoutineTarget] = useState<Member | null>(null);
  const [routineTitle, setRoutineTitle] = useState('');
  const [exercises, setExercises] = useState<ExerciseRow[]>([{ ...emptyExercise }]);

  const [measurementTarget, setMeasurementTarget] = useState<Member | null>(null);
  const [bodyFatPercent, setBodyFatPercent] = useState(20);
  const [waistCm, setWaistCm] = useState(80);
  const [chestCm, setChestCm] = useState(95);
  const [armCm, setArmCm] = useState(30);

  const myClasses = sortByDay(classes.filter((c) => c.trainerId === session?.trainerId));

  const handleToggleAttendance = (gymClass: GymClass, member: Member) => {
    toggleAttendance(gymClass.id, member.id);
    const wasAttended = gymClass.attendedIds.includes(member.id);
    showToast(wasAttended ? `Se quitó la asistencia de ${member.name}.` : `${member.name} marcado como presente.`, wasAttended ? 'info' : 'success');
  };

  const openRoutineModal = (member: Member) => {
    setRoutineTitle('');
    setExercises([{ ...emptyExercise }]);
    setRoutineTarget(member);
  };

  const openMeasurementModal = (member: Member) => {
    setBodyFatPercent(20);
    setWaistCm(80);
    setChestCm(95);
    setArmCm(30);
    setMeasurementTarget(member);
  };

  const updateExercise = (index: number, patch: Partial<ExerciseRow>) => {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, ...patch } : ex)));
  };

  const handleSubmitRoutine = (e: FormEvent) => {
    e.preventDefault();
    if (!routineTarget || !session?.trainerId) return;
    addWorkoutPlan({
      memberId: routineTarget.id,
      trainerId: session.trainerId,
      title: routineTitle,
      exercises: exercises.filter((ex) => ex.name.trim().length > 0),
    });
    showToast(`Rutina asignada a ${routineTarget.name}.`, 'success');
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
                        <button className="icon-btn" onClick={() => openRoutineModal(m)} aria-label="Asignar rutina" title="Asignar rutina">
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
        <Modal title={`Asignar rutina a ${routineTarget.name}`} onClose={() => setRoutineTarget(null)}>
          <form onSubmit={handleSubmitRoutine}>
            <div className="form-group">
              <label htmlFor="routineTitle">Título</label>
              <input id="routineTitle" value={routineTitle} onChange={(e) => setRoutineTitle(e.target.value)} placeholder="Ej. Fuerza — Bloque 1" required />
            </div>

            {exercises.map((ex, i) => (
              <div key={i} className="form-row" style={{ alignItems: 'end', gridTemplateColumns: '2fr 1fr 1fr auto' }}>
                <div className="form-group">
                  <label htmlFor={`ex-name-${i}`}>Ejercicio</label>
                  <input id={`ex-name-${i}`} value={ex.name} onChange={(e) => updateExercise(i, { name: e.target.value })} placeholder="Ej. Sentadilla" required />
                </div>
                <div className="form-group">
                  <label htmlFor={`ex-sets-${i}`}>Series</label>
                  <input
                    id={`ex-sets-${i}`}
                    type="number"
                    min={1}
                    value={ex.sets}
                    onChange={(e) => updateExercise(i, { sets: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`ex-reps-${i}`}>Reps</label>
                  <input id={`ex-reps-${i}`} value={ex.reps} onChange={(e) => updateExercise(i, { reps: e.target.value })} placeholder="Ej. 10" />
                </div>
                <div className="form-group">
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
            ))}

            <button type="button" className="btn btn-outline btn-sm" onClick={() => setExercises((prev) => [...prev, { ...emptyExercise }])} style={{ marginBottom: 18 }}>
              <Plus size={14} /> Agregar ejercicio
            </button>

            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setRoutineTarget(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Asignar rutina
              </button>
            </div>
          </form>
        </Modal>
      )}

      {measurementTarget && (
        <Modal title={`Registrar medición — ${measurementTarget.name}`} onClose={() => setMeasurementTarget(null)}>
          <form onSubmit={handleSubmitMeasurement}>
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
