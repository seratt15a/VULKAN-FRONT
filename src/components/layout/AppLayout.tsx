import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useEscapeClose } from '../../lib/useEscapeClose';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEscapeClose(() => setSidebarOpen(false), sidebarOpen);

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
