import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import type { ClassCategory, GymClass } from '../../data/types';
import { sortByDay } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';

const categories: ('Todas' | ClassCategory)[] = ['Todas', 'Fuerza', 'HIIT', 'Hipertrofia', 'Movilidad', 'Cardio'];

export function MemberClasses() {
  usePageTitle('Clases');
  const { session } = useAuth();
  const { classes, trainers, toggleBooking, joinWaitlist, leaveWaitlist } = useData();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<'Todas' | ClassCategory>('Todas');

  const memberId = session?.memberId;
  const filtered = sortByDay(filter === 'Todas' ? classes : classes.filter((c) => c.category === filter));

  const handleToggle = (gymClass: GymClass, alreadyBooked: boolean) => {
    if (!memberId) return;
    toggleBooking(gymClass.id, memberId);
    showToast(
      alreadyBooked ? `Reserva cancelada en ${gymClass.name}.` : `¡Reserva confirmada en ${gymClass.name}!`,
      alreadyBooked ? 'info' : 'success',
    );
  };

  const handleJoinWaitlist = (gymClass: GymClass) => {
    if (!memberId) return;
    joinWaitlist(gymClass.id, memberId);
    showToast(`Te anotamos en la lista de espera de ${gymClass.name}.`, 'info');
  };

  const handleLeaveWaitlist = (gymClass: GymClass) => {
    if (!memberId) return;
    leaveWaitlist(gymClass.id, memberId);
    showToast(`Saliste de la lista de espera de ${gymClass.name}.`, 'info');
  };

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
          const waitlistPosition = memberId ? c.waitlistIds.indexOf(memberId) : -1;
          const onWaitlist = waitlistPosition !== -1;

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

              {onWaitlist && (
                <p style={{ color: 'var(--amber)', fontSize: '0.8rem' }}>
                  En lista de espera (posición {waitlistPosition + 1})
                </p>
              )}

              {booked || !isFull ? (
                <button className={`btn ${booked ? 'btn-outline' : 'btn-primary'}`} onClick={() => handleToggle(c, booked)}>
                  {booked ? 'Cancelar reserva' : 'Reservar'}
                </button>
              ) : onWaitlist ? (
                <button className="btn btn-outline" onClick={() => handleLeaveWaitlist(c)}>
                  Salir de la lista de espera
                </button>
              ) : (
                <button className="btn btn-outline" onClick={() => handleJoinWaitlist(c)}>
                  Unirse a la lista de espera
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
