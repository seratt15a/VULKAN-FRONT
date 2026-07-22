import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import type { Role } from '../data/types';
import { members, trainers } from '../data';
import { useAuth } from '../context/AuthContext';

const homeByRole: Record<Role, string> = {
  member: '/',
  admin: '/admin',
  trainer: '/entrenador',
};

export function Login() {
  const { session, loginAsMember, loginAsTrainer, loginAsAdmin } = useAuth();
  const [role, setRole] = useState<Role>('member');
  const [selectedId, setSelectedId] = useState<string>(members[0].id);

  if (session) return <Navigate to={homeByRole[session.role]} replace />;

  const handleRoleChange = (next: Role) => {
    setRole(next);
    if (next === 'member') setSelectedId(members[0].id);
    if (next === 'trainer') setSelectedId(trainers[0].id);
  };

  const handleEnter = () => {
    if (role === 'member') loginAsMember(selectedId);
    else if (role === 'trainer') loginAsTrainer(selectedId);
    else loginAsAdmin();
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          VUL<span>KAN</span>
        </div>
        <p className="login-sub">Inicia sesión para continuar (demo, sin backend aún)</p>

        <div className="role-tabs">
          <button className={`role-tab ${role === 'member' ? 'active' : ''}`} onClick={() => handleRoleChange('member')}>
            Miembro
          </button>
          <button className={`role-tab ${role === 'trainer' ? 'active' : ''}`} onClick={() => handleRoleChange('trainer')}>
            Entrenador
          </button>
          <button className={`role-tab ${role === 'admin' ? 'active' : ''}`} onClick={() => handleRoleChange('admin')}>
            Admin
          </button>
        </div>

        {role === 'member' && (
          <div className="login-select-list">
            {members.map((m) => (
              <div
                key={m.id}
                className={`login-select-item ${selectedId === m.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(m.id)}
              >
                <img src={m.avatar} alt={m.name} />
                <div>
                  <strong>{m.name}</strong>
                  <span>Plan {m.plan}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {role === 'trainer' && (
          <div className="login-select-list">
            {trainers.map((t) => (
              <div
                key={t.id}
                className={`login-select-item ${selectedId === t.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(t.id)}
              >
                <img src={t.avatar} alt={t.name} />
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.specialty}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {role === 'admin' && (
          <p className="login-sub" style={{ marginBottom: 24 }}>
            Entrarás como personal administrativo de VULKAN.
          </p>
        )}

        <button className="btn btn-primary btn-block" style={{ width: '100%' }} onClick={handleEnter}>
          Entrar
        </button>
      </div>
    </div>
  );
}
