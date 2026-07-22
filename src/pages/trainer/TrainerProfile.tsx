import { useState, type FormEvent } from 'react';
import { Dumbbell, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { DEMO_PASSWORD } from '../../lib/demoAccounts';
import { StatCard } from '../../components/StatCard';

type Tab = 'general' | 'seguridad';

export function TrainerProfile() {
  const { session } = useAuth();
  const { trainers, classes, updateTrainer } = useData();
  const { showToast } = useToast();
  const trainer = trainers.find((t) => t.id === session?.trainerId);

  const [tab, setTab] = useState<Tab>('general');
  const [name, setName] = useState(trainer?.name ?? '');
  const [email, setEmail] = useState(trainer?.email ?? '');
  const [specialty, setSpecialty] = useState(trainer?.specialty ?? '');
  const [bio, setBio] = useState(trainer?.bio ?? '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (!trainer) return null;

  const myClasses = classes.filter((c) => c.trainerId === trainer.id);

  const handleSaveGeneral = (e: FormEvent) => {
    e.preventDefault();
    updateTrainer(trainer.id, { name, email, specialty, bio });
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

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Mi Perfil</h1>
          <p style={{ color: 'var(--gray)' }}>Tu información y seguridad como entrenador.</p>
        </div>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <img src={trainer.avatar} alt={trainer.name} />
        </div>
        <div>
          <h2>{trainer.name}</h2>
          <p className="profile-hero-sub">{trainer.specialty}</p>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <StatCard icon={<Dumbbell size={20} />} label="Clases asignadas" value={myClasses.length} />
        <StatCard icon={<Users size={20} />} label="Alumnos activos" value={trainer.activeStudents} />
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab ${tab === 'general' ? 'active' : ''}`} onClick={() => setTab('general')}>
          General
        </button>
        <button className={`profile-tab ${tab === 'seguridad' ? 'active' : ''}`} onClick={() => setTab('seguridad')}>
          Seguridad
        </button>
      </div>

      {tab === 'general' && (
        <div className="card" style={{ maxWidth: 520 }}>
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
            <div className="form-group">
              <label htmlFor="specialty">Especialidad</label>
              <input id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">
              Guardar cambios
            </button>
          </form>
        </div>
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
