import { Link } from 'react-router-dom';
import { CalendarCheck, Flame, CreditCard, Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { MembershipBadge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { formatDate, daysUntil, sortByDay } from '../../lib/format';

export function MemberDashboard() {
  const { session } = useAuth();
  const { members, classes, trainers } = useData();

  const member = members.find((m) => m.id === session?.memberId);
  if (!member) return null;

  const myClasses = sortByDay(classes.filter((c) => c.bookedIds.includes(member.id)));
  const nextClass = myClasses[0];
  const paymentDays = daysUntil(member.nextPaymentDate);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>
            Hola, {member.name.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--gray)' }}>Sigue empujando tus límites. Esta es tu semana en VULKAN.</p>
        </div>
        <Link to="/clases" className="btn btn-primary">
          Reservar clase
        </Link>
      </div>

      <div className="stat-grid">
        <StatCard icon={<CreditCard size={20} />} label={`Plan ${member.plan}`} value={<MembershipBadge status={member.status} />} />
        <StatCard
          icon={<CalendarCheck size={20} />}
          label="Próximo pago"
          value={formatDate(member.nextPaymentDate)}
          delta={{ value: `${paymentDays >= 0 ? paymentDays : 0} días`, direction: paymentDays < 5 ? 'down' : 'up' }}
        />
        <StatCard icon={<Flame size={20} />} label="Check-ins totales" value={member.checkIns} />
        <StatCard icon={<Dumbbell size={20} />} label="Clases reservadas" value={myClasses.length} />
      </div>

      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 18 }}>Tus próximas clases</h2>
        {nextClass ? (
          <div className="class-grid">
            {myClasses.map((c) => {
              const trainer = trainers.find((t) => t.id === c.trainerId);
              return (
                <div key={c.id} className="gym-class-card">
                  <span className="cat">{c.category}</span>
                  <h3>{c.name}</h3>
                  <div className="meta">
                    <span>{c.day} · {c.startTime}</span>
                  </div>
                  <div className="meta">
                    <span>Con {trainer?.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>Aún no tienes clases reservadas.</p>
            <Link to="/clases" className="btn btn-outline" style={{ marginTop: 16 }}>
              Explorar clases
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
