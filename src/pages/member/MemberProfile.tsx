import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../lib/format';

export function MemberProfile() {
  const { session } = useAuth();
  const { members, updateMember } = useData();
  const member = members.find((m) => m.id === session?.memberId);

  const [name, setName] = useState(member?.name ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [saved, setSaved] = useState(false);

  if (!member) return null;

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    updateMember(member.id, { name, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Mi Perfil</h1>
          <p style={{ color: 'var(--gray)' }}>Actualiza tu información personal.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 26 }}>
          <img src={member.avatar} alt={member.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <strong style={{ fontSize: '1.1rem' }}>{member.name}</strong>
            <p style={{ color: 'var(--gray-dim)', fontSize: '0.85rem' }}>Miembro desde {formatDate(member.joinDate)}</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit">
            Guardar cambios
          </button>
          {saved && <p style={{ color: 'var(--green)', fontSize: '0.85rem', marginTop: 10 }}>Perfil actualizado ✓</p>}
        </form>
      </div>
    </>
  );
}
