import { useState, type FormEvent } from 'react';
import { Snowflake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { MembershipBadge, PaymentBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { formatCurrency, formatDate } from '../../lib/format';
import { usePageTitle } from '../../lib/usePageTitle';
import type { MembershipPlan } from '../../data/types';

const planFeatures: Record<MembershipPlan, string[]> = {
  Básico: ['Acceso a sala de pesas', 'Horario limitado', '1 evaluación física al mes'],
  Pro: ['Acceso ilimitado 24/7', 'Todas las clases grupales', '2 sesiones con entrenador/mes'],
  Élite: ['Todo lo del plan Pro', 'Entrenador personal dedicado', 'Zona VIP y sauna'],
};

const planPrice: Record<MembershipPlan, number> = { Básico: 29, Pro: 49, Élite: 89 };

export function MemberMembership() {
  usePageTitle('Mi Membresía');
  const { session } = useAuth();
  const { members, payments, sessionPackages, requestFreeze } = useData();
  const { showToast } = useToast();
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [freezeReason, setFreezeReason] = useState('');

  const member = members.find((m) => m.id === session?.memberId);
  if (!member) return null;

  const history = payments.filter((p) => p.memberId === member.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const myPackages = sessionPackages.filter((p) => p.memberId === member.id);

  const handleRequestFreeze = (e: FormEvent) => {
    e.preventDefault();
    requestFreeze(member.id, freezeReason);
    showToast('Solicitud de pausa enviada. El equipo la revisará pronto.', 'success');
    setFreezeReason('');
    setFreezeModalOpen(false);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Mi Membresía</h1>
          <p style={{ color: 'var(--gray)' }}>Gestiona tu plan y revisa tu historial de pagos.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Plan actual</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>{member.plan}</h2>
          </div>
          <MembershipBadge status={member.status} />
        </div>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <span style={{ color: 'var(--gray)', fontSize: '0.8rem', display: 'block' }}>Cuota mensual</span>
            <strong>{formatCurrency(member.monthlyFee)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--gray)', fontSize: '0.8rem', display: 'block' }}>Próximo pago</span>
            <strong>{formatDate(member.nextPaymentDate)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--gray)', fontSize: '0.8rem', display: 'block' }}>Miembro desde</span>
            <strong>{formatDate(member.joinDate)}</strong>
          </div>
        </div>
        <ul className="check-list-plain" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {planFeatures[member.plan].map((f) => (
            <li key={f} style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>✓ {f}</li>
          ))}
        </ul>

        {member.freezeRequest ? (
          <p style={{ color: 'var(--amber)', fontSize: '0.85rem' }}>
            <Snowflake size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Solicitud de pausa enviada el {formatDate(member.freezeRequest.requestedAt)} — en revisión.
          </p>
        ) : member.status === 'activa' ? (
          <button className="btn btn-outline btn-sm" onClick={() => setFreezeModalOpen(true)}>
            <Snowflake size={14} /> Solicitar pausa de membresía
          </button>
        ) : null}
      </div>

      {myPackages.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 14 }}>Mis paquetes de sesiones</h2>
          <div className="stat-grid" style={{ marginBottom: 28 }}>
            {myPackages.map((pkg) => {
              const remaining = pkg.totalSessions - pkg.usedSessions;
              const pct = Math.round((pkg.usedSessions / pkg.totalSessions) * 100);
              return (
                <div key={pkg.id} className="card">
                  <div className="cap-label" style={{ marginBottom: 8 }}>
                    <span>{pkg.usedSessions}/{pkg.totalSessions} sesiones usadas</span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: 10 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span style={{ color: 'var(--gray-dim)', fontSize: '0.8rem' }}>{remaining} restantes · comprado {formatDate(pkg.purchaseDate)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 14 }}>Cambiar de plan</h2>
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {(Object.keys(planPrice) as MembershipPlan[]).map((plan) => (
          <div key={plan} className="card" style={{ textAlign: 'center', border: plan === member.plan ? '1px solid var(--red)' : undefined }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 8 }}>{plan}</h3>
            <p style={{ fontSize: '1.6rem', marginBottom: 12 }}>{formatCurrency(planPrice[plan])}<span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>/mes</span></p>
            <button className={`btn ${plan === member.plan ? 'btn-outline' : 'btn-primary'}`} disabled={plan === member.plan} style={{ width: '100%' }}>
              {plan === member.plan ? 'Plan actual' : 'Elegir plan'}
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 14 }}>Historial de pagos</h2>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Plan</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {history.map((p) => (
              <tr key={p.id}>
                <td>{formatDate(p.date)}</td>
                <td>{p.plan}</td>
                <td>{formatCurrency(p.amount)}</td>
                <td><PaymentBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {freezeModalOpen && (
        <Modal title="Solicitar pausa de membresía" onClose={() => setFreezeModalOpen(false)}>
          <form onSubmit={handleRequestFreeze}>
            <div className="form-group">
              <label htmlFor="freezeReason">Motivo (opcional)</label>
              <textarea
                id="freezeReason"
                rows={3}
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                placeholder="Ej. Viaje, lesión, motivos personales..."
              />
            </div>
            <p style={{ color: 'var(--gray-dim)', fontSize: '0.82rem', marginBottom: 16 }}>
              El equipo de VULKAN revisará tu solicitud y pausará tu membresía una vez aprobada.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setFreezeModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Enviar solicitud
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
