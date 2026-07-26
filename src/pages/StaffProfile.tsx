import { useState, type FormEvent } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEMO_PASSWORD } from '../lib/demoAccounts';
import { usePageTitle } from '../lib/usePageTitle';

const roleLabel = { admin: 'Administrador', reception: 'Recepción' } as const;

export function StaffProfile() {
  usePageTitle('Mi Perfil');
  const { session } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (!session || (session.role !== 'admin' && session.role !== 'reception')) return null;

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
          <p style={{ color: 'var(--gray)' }}>Tu cuenta de {roleLabel[session.role]}.</p>
        </div>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <img src={session.avatar} alt={session.name} />
        </div>
        <div>
          <h2>{session.name}</h2>
          <p className="profile-hero-sub">{roleLabel[session.role]}</p>
        </div>
      </div>

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
    </>
  );
}
