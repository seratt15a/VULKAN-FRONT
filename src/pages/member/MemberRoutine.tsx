import { Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { usePageTitle } from '../../lib/usePageTitle';
import { formatDate } from '../../lib/format';
import { ExerciseAnimation } from '../../components/ExerciseAnimation';

export function MemberRoutine() {
  usePageTitle('Mi Rutina');
  const { session } = useAuth();
  const { workoutPlans, trainers } = useData();

  const myPlans = workoutPlans
    .filter((p) => p.memberId === session?.memberId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const currentPlan = myPlans[0];
  const trainer = trainers.find((t) => t.id === currentPlan?.trainerId);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Mi Rutina</h1>
          <p style={{ color: 'var(--gray)' }}>El plan de ejercicios que te asignó tu entrenador.</p>
        </div>
      </div>

      {currentPlan ? (
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{currentPlan.title}</h2>
              <p style={{ color: 'var(--gray-dim)', fontSize: '0.85rem' }}>
                Asignada por {trainer?.name ?? 'tu entrenador'} · {formatDate(currentPlan.createdAt)}
              </p>
            </div>
            <span className="stat-icon">
              <Dumbbell size={20} />
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentPlan.exercises.map((ex, i) => (
              <div key={i} className="exercise-card">
                <ExerciseAnimation name={ex.name} size={56} />
                <div className="exercise-card-body">
                  <h4>{ex.name}</h4>
                  <div className="exercise-card-meta">
                    <span>{ex.sets} series</span>
                    <span>{ex.reps} reps</span>
                  </div>
                  {ex.notes && <p className="exercise-card-note">{ex.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">Tu entrenador aún no te ha asignado una rutina.</div>
      )}
    </>
  );
}
