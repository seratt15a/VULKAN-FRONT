import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getNotifications } from '../lib/notifications';
import { useEscapeClose } from '../lib/useEscapeClose';

export function NotificationBell() {
  const { session } = useAuth();
  const { members, classes, payments } = useData();
  const [open, setOpen] = useState(false);
  useEscapeClose(() => setOpen(false), open);

  const notifications = getNotifications(session, { members, classes, payments });

  return (
    <div className="notif-wrap">
      <button className="notif-bell" onClick={() => setOpen((v) => !v)} aria-label="Notificaciones" aria-expanded={open}>
        <Bell size={19} />
        {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
      </button>

      {open && (
        <>
          <div className="notif-backdrop" onClick={() => setOpen(false)} />
          <div className="notif-panel" role="dialog" aria-label="Notificaciones">
            <div className="notif-panel-head">Notificaciones</div>
            {notifications.length === 0 ? (
              <p className="notif-empty">Estás al día. Sin notificaciones.</p>
            ) : (
              <div className="notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className="notif-item">
                    <span className={`notif-dot notif-dot-${n.severity}`} />
                    <span>{n.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
