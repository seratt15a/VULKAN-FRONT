import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import type { ClassCategory } from '../../data/types';
import { sortByDay } from '../../lib/format';

const categories: ('Todas' | ClassCategory)[] = ['Todas', 'Fuerza', 'HIIT', 'Hipertrofia', 'Movilidad', 'Cardio'];

export function MemberClasses() {
  const { session } = useAuth();
  const { classes, trainers, toggleBooking } = useData();
  const [filter, setFilter] = useState<'Todas' | ClassCategory>('Todas');

  const memberId = session?.memberId;
  const filtered = sortByDay(filter === 'Todas' ? classes : classes.filter((c) => c.category === filter));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Clases</h1>
          <p style={{ color: 'var(--gray)' }}>Reserva tu lugar en las clases de la semana.</p>
        </div>
      </div>

      <div className="role-tabs" style={{ maxWidth: 560, marginBottom: 24 }}>
        {categories.map((cat) => (
          <button key={cat} className={`role-tab ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <div className="class-grid">
        {filtered.map((c) => {
          const trainer = trainers.find((t) => t.id === c.trainerId);
          const booked = memberId ? c.bookedIds.includes(memberId) : false;
          const isFull = c.bookedIds.length >= c.capacity;
          const pct = Math.min(100, Math.round((c.bookedIds.length / c.capacity) * 100));

          return (
            <div key={c.id} className="gym-class-card">
              <span className="cat">{c.category}</span>
              <h3>{c.name}</h3>
              <div className="meta">
                <span>{c.day} · {c.startTime} · {c.durationMin} min</span>
              </div>
              <div className="meta">
                <span>Con {trainer?.name}</span>
              </div>
              <div className="cap-bar">
                <div className="cap-label">
                  <span>{c.bookedIds.length}/{c.capacity} lugares</span>
                  {isFull && !booked && <span style={{ color: 'var(--red)' }}>Llena</span>}
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <button
                className={`btn ${booked ? 'btn-outline' : 'btn-primary'}`}
                disabled={!booked && isFull}
                onClick={() => memberId && toggleBooking(c.id, memberId)}
              >
                {booked ? 'Cancelar reserva' : isFull ? 'Sin cupo' : 'Reservar'}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
