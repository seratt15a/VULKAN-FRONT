import { useState, type FormEvent } from 'react';
import { Flame, Target, Weight, CalendarCheck, Trophy, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DEMO_PASSWORD } from '../../lib/demoAccounts';
import { computeAchievements } from '../../lib/achievements';
import { StatCard } from '../../components/StatCard';
import { WeightChart } from '../../components/WeightChart';
import { formatDate } from '../../lib/format';

type Tab = 'general' | 'progreso' | 'seguridad';

export function MemberProfile() {
  const { session } = useAuth();
  const { members, trainers, updateMember } = useData();
  const { showToast } = useToast();
  const member = members.find((m) => m.id === session?.memberId);
  const trainer = trainers.find((t) => t.id === member?.trainerId);

  const [tab, setTab] = useState<Tab>('general');

  const [name, setName] = useState(member?.name ?? '');
  const [email, setEmail] = useState(member?.email ?? '');

  const [contactName, setContactName] = useState(member?.emergencyContact.name ?? '');
  const [contactPhone, setContactPhone] = useState(member?.emergencyContact.phone ?? '');
  const [contactRelationship, setContactRelationship] = useState(member?.emergencyContact.relationship ?? '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (!member) return null;

  const handleSaveGeneral = (e: FormEvent) => {
    e.preventDefault();
    updateMember(member.id, {
      name,
      email,
      emergencyContact: { name: contactName, phone: contactPhone, relationship: contactRelationship },
    });
    showToast('Perfil actualizado correctamente.', 'success');
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (currentPassword !== DEMO_PASSWORD) {
      setPasswordError('Tu contraseña actual no es correcta.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Contraseña actualizada correctamente.', 'success');
  };

  const achievements = computeAchievements(member);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const lastWeight = member.weightHistory.at(-1)?.weightKg;
  const weightDiff = lastWeight !== undefined ? lastWeight - member.weightGoalKg : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Mi Perfil</h1>
          <p style={{ color: 'var(--gray)' }}>Tu información, progreso y seguridad en un solo lugar.</p>
        </div>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <img src={member.avatar} alt={member.name} />
          {member.currentStreakDays > 0 && (
            <span className="profile-streak-badge">
              <Flame size={11} /> {member.currentStreakDays}
            </span>
          )}
        </div>
        <div>
          <h2>{member.name}</h2>
          <p className="profile-hero-sub">
            Plan {member.plan} · Miembro desde {formatDate(member.joinDate)}
          </p>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab ${tab === 'general' ? 'active' : ''}`} onClick={() => setTab('general')}>
          General
        </button>
        <button className={`profile-tab ${tab === 'progreso' ? 'active' : ''}`} onClick={() => setTab('progreso')}>
          Progreso
        </button>
        <button className={`profile-tab ${tab === 'seguridad' ? 'active' : ''}`} onClick={() => setTab('seguridad')}>
          Seguridad
        </button>
      </div>

      {tab === 'general' && (
        <div className="two-col-12">
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 18 }}>Datos personales</h3>
            <form onSubmit={handleSaveGeneral}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nombre</label>
                  <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Correo</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: '10px 0 14px' }}>Contacto de emergencia</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactName">Nombre</label>
                  <input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nombre completo" />
                </div>
                <div className="form-group">
                  <label htmlFor="contactRelationship">Parentesco</label>
                  <input
                    id="contactRelationship"
                    value={contactRelationship}
                    onChange={(e) => setContactRelationship(e.target.value)}
                    placeholder="Ej. Esposa, Padre..."
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="contactPhone">Teléfono</label>
                <input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+52 55 0000 0000" />
              </div>

              <button className="btn btn-primary" type="submit">
                Guardar cambios
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: 12 }}>Tu entrenador</h3>
            {trainer ? (
              <div className="trainer-mini-card">
                <img src={trainer.avatar} alt={trainer.name} />
                <div>
                  <strong>{trainer.name}</strong>
                  <span>{trainer.specialty}</span>
                  <p>{trainer.bio}</p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--gray-dim)', fontSize: '0.88rem' }}>Aún no tienes un entrenador asignado.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'progreso' && (
        <>
          <div className="stat-grid">
            <StatCard icon={<Weight size={20} />} label="Peso actual" value={lastWeight ? `${lastWeight} kg` : '—'} />
            <StatCard icon={<Target size={20} />} label="Meta" value={`${member.weightGoalKg} kg`} />
            <StatCard
              icon={<Flame size={20} />}
              label="Racha actual"
              value={`${member.currentStreakDays} días`}
              delta={weightDiff !== 0 ? { value: `${Math.abs(weightDiff).toFixed(1)} kg de la meta`, direction: weightDiff > 0 ? 'down' : 'up' } : undefined}
            />
            <StatCard icon={<CalendarCheck size={20} />} label="Check-ins totales" value={member.checkIns} />
          </div>

          <div className="card weight-chart-card" style={{ marginBottom: 24 }}>
            <div className="weight-chart-head">
              <h3>Evolución de peso</h3>
              <div className="weight-chart-legend">
                <span><span className="legend-dot actual" /> Peso registrado</span>
                <span><span className="legend-dot goal" /> Meta ({member.weightGoalKg} kg)</span>
              </div>
            </div>
            <WeightChart history={member.weightHistory} goalKg={member.weightGoalKg} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Trophy size={18} color="var(--red)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
              Logros <span style={{ color: 'var(--gray-dim)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>({unlockedCount}/{achievements.length})</span>
            </h3>
          </div>
          <div className="achievements-grid">
            {achievements.map((a) => (
              <div key={a.id} className={`achievement-card ${a.unlocked ? 'unlocked' : ''}`}>
                <span className="achievement-icon">
                  <Trophy size={18} />
                </span>
                <div>
                  <strong>{a.label}</strong>
                  <span>{a.description}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'seguridad' && (
        <div className="card" style={{ maxWidth: 460 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <ShieldCheck size={18} color="var(--red)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Cambiar contraseña</h3>
          </div>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label htmlFor="currentPassword">Contraseña actual</label>
              <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Nueva contraseña</label>
              <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            {passwordError && <p style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: 14 }}>{passwordError}</p>}
            <button className="btn btn-primary" type="submit">
              Actualizar contraseña
            </button>
          </form>
        </div>
      )}
    </>
  );
}
