import { CalendarDays, Users, Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/StatCard';
import { sortByDay } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';

export function TrainerSchedule() {
  usePageTitle('Mi Horario');
  const { session } = useAuth();
  const { classes } = useData();

  const myClasses = sortByDay(classes.filter((c) => c.trainerId === session?.trainerId));
  const totalStudents = new Set(myClasses.flatMap((c) => c.bookedIds)).size;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Mi Horario</h1>
          <p style={{ color: 'var(--gray)' }}>Tus clases asignadas esta semana.</p>
        </div>
      </div>

      <div className="stat-grid stat-grid-3">
        <StatCard icon={<Dumbbell size={20} />} label="Clases asignadas" value={myClasses.length} />
        <StatCard icon={<Users size={20} />} label="Alumnos únicos" value={totalStudents} />
        <StatCard
          icon={<CalendarDays size={20} />}
          label="Próxima clase"
          value={myClasses[0] ? `${myClasses[0].day} · ${myClasses[0].startTime}` : '—'}
        />
      </div>

      <div className="class-grid">
        {myClasses.map((c) => (
          <div key={c.id} className="gym-class-card">
            <span className="cat">{c.category}</span>
            <h3>{c.name}</h3>
            <div className="meta">
              <span>{c.day} · {c.startTime} · {c.durationMin} min</span>
            </div>
            <div className="cap-bar">
              <div className="cap-label">
                <span>{c.bookedIds.length}/{c.capacity} alumnos</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.round((c.bookedIds.length / c.capacity) * 100))}%` }} />
              </div>
            </div>
          </div>
        ))}
        {myClasses.length === 0 && <div className="empty-state">No tienes clases asignadas todavía.</div>}
      </div>
    </>
  );
}
