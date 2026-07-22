import { Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { usePageTitle } from '../../lib/usePageTitle';
import { formatDate } from '../../lib/format';

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
        <div className="card" style={{ maxWidth: 640 }}>
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

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ejercicio</th>
                  <th>Series</th>
                  <th>Reps</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {currentPlan.exercises.map((ex, i) => (
                  <tr key={i}>
                    <td className="cell-user-name">{ex.name}</td>
                    <td>{ex.sets}</td>
                    <td>{ex.reps}</td>
                    <td style={{ color: 'var(--gray-dim)' }}>{ex.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">Tu entrenador aún no te ha asignado una rutina.</div>
      )}
    </>
  );
}
