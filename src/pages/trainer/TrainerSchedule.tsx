import { useState } from 'react';
import { CalendarDays, Users, Dumbbell, List, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/StatCard';
import { sortByDay } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

type View = 'lista' | 'calendario';

export function TrainerSchedule() {
  usePageTitle('Mi Horario');
  const { session } = useAuth();
  const { classes } = useData();
  const [view, setView] = useState<View>('lista');

  const myClasses = sortByDay(classes.filter((c) => c.trainerId === session?.trainerId));
  const totalStudents = new Set(myClasses.flatMap((c) => c.bookedIds)).size;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Mi Horario</h1>
          <p style={{ color: 'var(--gray)' }}>Tus clases asignadas esta semana.</p>
        </div>
        <div className="view-toggle">
          <button className={view === 'lista' ? 'active' : ''} onClick={() => setView('lista')} aria-label="Vista de lista">
            <List size={16} />
          </button>
          <button className={view === 'calendario' ? 'active' : ''} onClick={() => setView('calendario')} aria-label="Vista de calendario">
            <LayoutGrid size={16} />
          </button>
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

      {view === 'lista' ? (
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
      ) : (
        <div className="classes-calendar">
          {days.map((day) => {
            const dayClasses = myClasses.filter((c) => c.day === day).sort((a, b) => (a.startTime < b.startTime ? -1 : 1));
            return (
              <div key={day} className="calendar-day-col">
                <div className="calendar-day-head">{day}</div>
                {dayClasses.map((c) => {
                  const pct = Math.min(100, Math.round((c.bookedIds.length / c.capacity) * 100));
                  return (
                    <div key={c.id} className="calendar-class-chip">
                      <span className="chip-time">{c.startTime}</span>
                      <strong>{c.name}</strong>
                      <span className="chip-trainer">{c.bookedIds.length}/{c.capacity} alumnos</span>
                      <div className="progress-bar chip-progress">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {dayClasses.length === 0 && <p className="calendar-day-empty">Sin clases</p>}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
