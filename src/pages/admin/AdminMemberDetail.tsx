import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Percent, Ruler, Receipt } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { MembershipBadge, PaymentBadge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { ExerciseAnimation } from '../../components/ExerciseAnimation';
import { MeasurementsChart, type MeasurementMetric } from '../../components/MeasurementsChart';
import { PaymentReceipt } from '../../components/PaymentReceipt';
import { formatCurrency, formatDate } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';
import type { Payment } from '../../data/types';

export function AdminMemberDetail() {
  const { id } = useParams<{ id: string }>();
  const { members, trainers, payments, sessionPackages, workoutPlans } = useData();
  const member = members.find((m) => m.id === id);
  usePageTitle(member ? member.name : 'Miembro');
  const [measurementMetric, setMeasurementMetric] = useState<MeasurementMetric>('waistCm');
  const [receiptTarget, setReceiptTarget] = useState<Payment | null>(null);

  if (!member) {
    return (
      <>
        <div className="page-header">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Miembro no encontrado</h1>
          </div>
        </div>
        <Link to="/admin/miembros" className="btn btn-outline">
          <ArrowLeft size={16} /> Volver a Miembros
        </Link>
      </>
    );
  }

  const trainer = trainers.find((t) => t.id === member.trainerId);
  const history = payments.filter((p) => p.memberId === member.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const myPackages = sessionPackages.filter((p) => p.memberId === member.id);
  const plan = [...workoutPlans].filter((p) => p.memberId === member.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  const latestMeasurement = member.bodyMeasurements.at(-1);

  return (
    <>
      <div className="page-header">
        <div>
          <Link to="/admin/miembros" style={{ color: 'var(--gray)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <ArrowLeft size={14} /> Volver a Miembros
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>{member.name}</h1>
          <p style={{ color: 'var(--gray)' }}>{member.email}</p>
        </div>
        <Link to="/admin/miembros" state={{ presetQuery: member.name }} className="btn btn-outline">
          Editar en Miembros
        </Link>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <img src={member.avatar} alt={member.name} />
          {member.currentStreakDays > 0 && <span className="profile-streak-badge">🔥 {member.currentStreakDays}</span>}
        </div>
        <div>
          <h2>{member.name}</h2>
          <p className="profile-hero-sub">
            Plan {member.plan} · Miembro desde {formatDate(member.joinDate)}
          </p>
        </div>
        <MembershipBadge status={member.status} />
      </div>

      <div className="stat-grid" style={{ marginTop: 20 }}>
        <StatCard label="Próximo pago" value={formatDate(member.nextPaymentDate)} icon={<Receipt size={20} />} />
        <StatCard label="Check-ins totales" value={member.checkIns} icon={<Percent size={20} />} />
        <StatCard label="Entrenador asignado" value={trainer?.name ?? '—'} icon={<Ruler size={20} />} />
        <StatCard label="Meta de peso" value={`${member.weightGoalKg} kg`} icon={<Ruler size={20} />} />
      </div>

      <div className="two-col-12" style={{ marginBottom: 28 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 14 }}>Contacto de emergencia</h3>
          {member.emergencyContact.name ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.9rem' }}>
              <span><strong>{member.emergencyContact.name}</strong> ({member.emergencyContact.relationship || '—'})</span>
              <span style={{ color: 'var(--gray)' }}>{member.emergencyContact.phone || 'Sin teléfono registrado'}</span>
            </div>
          ) : (
            <p style={{ color: 'var(--gray-dim)', fontSize: '0.88rem' }}>Sin contacto de emergencia registrado.</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 14 }}>Rutina asignada</h3>
          {plan ? (
            <>
              <p style={{ fontWeight: 700, marginBottom: 10 }}>{plan.title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.exercises.map((ex, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <ExerciseAnimation name={ex.name} libraryKey={ex.libraryKey} size={48} />
                    <div style={{ fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 600 }}>{ex.name}</div>
                      <div style={{ color: 'var(--gray)' }}>{ex.sets} series · {ex.reps} reps</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--gray-dim)', fontSize: '0.88rem' }}>Sin rutina asignada todavía.</p>
          )}
        </div>
      </div>

      {myPackages.length > 0 && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 14 }}>Paquetes de sesiones</h3>
          <div className="stat-grid" style={{ marginBottom: 28 }}>
            {myPackages.map((pkg) => {
              const remaining = pkg.totalSessions - pkg.usedSessions;
              const pct = Math.round((pkg.usedSessions / pkg.totalSessions) * 100);
              return (
                <div key={pkg.id} className="card">
                  <div className="cap-label" style={{ marginBottom: 8 }}>
                    <span>{pkg.usedSessions}/{pkg.totalSessions} sesiones</span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 10 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span style={{ color: 'var(--gray-dim)', fontSize: '0.8rem' }}>{remaining} restantes · vence {formatDate(pkg.expirationDate)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 14 }}>Medidas corporales</h3>
      {member.bodyMeasurements.length > 0 && latestMeasurement ? (
        <>
          <div className="stat-grid">
            <StatCard icon={<Percent size={20} />} label="% Grasa corporal" value={`${latestMeasurement.bodyFatPercent}%`} />
            <StatCard icon={<Ruler size={20} />} label="Cintura" value={`${latestMeasurement.waistCm} cm`} />
            <StatCard icon={<Ruler size={20} />} label="Pecho" value={`${latestMeasurement.chestCm} cm`} />
            <StatCard icon={<Ruler size={20} />} label="Brazo" value={`${latestMeasurement.armCm} cm`} />
          </div>
          <div className="card weight-chart-card" style={{ marginBottom: 28 }}>
            <div className="weight-chart-head">
              <h3>Tendencia de medidas</h3>
              <select
                value={measurementMetric}
                onChange={(e) => setMeasurementMetric(e.target.value as MeasurementMetric)}
                style={{ background: 'var(--black-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--white)' }}
              >
                <option value="waistCm">Cintura</option>
                <option value="chestCm">Pecho</option>
                <option value="armCm">Brazo</option>
                <option value="bodyFatPercent">% Grasa corporal</option>
              </select>
            </div>
            <MeasurementsChart history={member.bodyMeasurements} metric={measurementMetric} />
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--gray-dim)', fontSize: '0.88rem', marginBottom: 28 }}>Sin mediciones registradas todavía.</p>
      )}

      {member.progressPhotos.length > 0 && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 14 }}>Fotos de progreso</h3>
          <div className="photo-grid" style={{ marginBottom: 28 }}>
            {[...member.progressPhotos].reverse().map((photo) => (
              <div key={photo.url + photo.date} className="progress-photo-card">
                <img src={photo.url} alt={photo.note ?? 'Foto de progreso'} />
                <div className="progress-photo-caption">
                  <span>{formatDate(photo.date)}</span>
                  {photo.note && <p>{photo.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 14 }}>Historial de pagos</h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Plan</th>
              <th>Monto</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {history.map((p) => (
              <tr key={p.id}>
                <td>{formatDate(p.date)}</td>
                <td>{p.plan}</td>
                <td>{formatCurrency(p.amount)}</td>
                <td><PaymentBadge status={p.status} /></td>
                <td>
                  <button className="icon-btn" onClick={() => setReceiptTarget(p)} aria-label="Recibo" title="Ver recibo">
                    <Receipt />
                  </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">Sin pagos registrados.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {receiptTarget && (
        <PaymentReceipt payment={receiptTarget} memberName={member.name} onClose={() => setReceiptTarget(null)} />
      )}
    </>
  );
}
