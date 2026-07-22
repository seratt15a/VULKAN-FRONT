import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { navByRole } from './navConfig';

const roleLabel = { member: 'Miembro', admin: 'Administrador', trainer: 'Entrenador' } as const;

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const { session, logout } = useAuth();
  if (!session) return null;
  const items = navByRole[session.role];

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-logo">
        VUL<span>KAN</span>
      </div>
      <div className="sidebar-role">Panel {roleLabel[session.role]}</div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <img src={session.avatar} alt={session.name} />
          <div>
            <div className="sidebar-user-name">{session.name}</div>
            <div className="sidebar-user-role">{roleLabel[session.role]}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
