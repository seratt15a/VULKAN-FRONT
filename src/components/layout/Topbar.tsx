import { Menu } from 'lucide-react';

export function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="topbar">
      <button className="burger-toggle" onClick={onToggleSidebar} aria-label="Abrir menú">
        <Menu size={22} />
      </button>
      <span className="topbar-sub">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
    </header>
  );
}
