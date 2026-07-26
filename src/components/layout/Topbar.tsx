import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../NotificationBell';
import { GlobalSearch } from '../GlobalSearch';

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { session } = useAuth();
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="burger-toggle" onClick={onToggleSidebar} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
        <span className="topbar-sub">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>
      <div className="topbar-right">
        {session?.role === 'admin' && <GlobalSearch />}
        <NotificationBell />
      </div>
    </header>
  );
}
