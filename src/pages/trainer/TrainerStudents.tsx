import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { MembershipBadge } from '../../components/Badge';
import { sortByDay } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';

export function TrainerStudents() {
  usePageTitle('Mis Alumnos');
  const { session } = useAuth();
  const { classes, members } = useData();

  const myClasses = sortByDay(classes.filter((c) => c.trainerId === session?.trainerId));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Mis Alumnos</h1>
          <p style={{ color: 'var(--gray)' }}>Lista de asistentes por clase.</p>
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
                {roster.map((m) => (
                  <div key={m.id} className="cell-user" style={{ justifyContent: 'space-between' }}>
                    <div className="cell-user">
                      <img src={m.avatar} alt={m.name} />
                      <div>
                        <div className="cell-user-name">{m.name}</div>
                        <div className="cell-user-sub">{m.email}</div>
                      </div>
                    </div>
                    <MembershipBadge status={m.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--gray-dim)', fontSize: '0.88rem' }}>Sin alumnos inscritos todavía.</p>
            )}
          </div>
        );
      })}
      {myClasses.length === 0 && <div className="empty-state">No tienes clases asignadas todavía.</div>}
    </>
  );
}
