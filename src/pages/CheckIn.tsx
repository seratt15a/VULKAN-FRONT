import { useState } from 'react';
import { Search, LogIn, Users, CalendarCheck, Undo2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { MembershipBadge } from '../components/Badge';
import { StatCard } from '../components/StatCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { usePageTitle } from '../lib/usePageTitle';
import type { CheckInRecord, Member } from '../data/types';

export function CheckIn() {
  usePageTitle('Check-in');
  const { members, checkIns, checkInMember, deleteCheckIn } = useData();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [pendingUndo, setPendingUndo] = useState<CheckInRecord | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const todayCheckIns = checkIns.filter((c) => c.date === today).slice().reverse();

  const matches = query.trim()
    ? members.filter(
        (m) => m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  const handleCheckIn = (member: Member) => {
    if (member.status !== 'activa') {
      showToast(`${member.name} no tiene membresía activa (${member.status}).`, 'error');
      return;
    }
    checkInMember(member.id);
    showToast(`Check-in registrado: ${member.name}.`, 'success');
    setQuery('');
  };

  const confirmUndo = () => {
    if (!pendingUndo) return;
    deleteCheckIn(pendingUndo.id);
    showToast('Se deshizo el check-in.', 'info');
    setPendingUndo(null);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Check-in</h1>
          <p style={{ color: 'var(--gray)' }}>Registra la entrada de un miembro al gimnasio.</p>
        </div>
      </div>

      <div className="stat-grid stat-grid-2">
        <StatCard icon={<LogIn size={20} />} label="Check-ins hoy" value={todayCheckIns.length} />
        <StatCard icon={<Users size={20} />} label="Miembros activos" value={members.filter((m) => m.status === 'activa').length} />
      </div>

      <div className="search-input" style={{ maxWidth: 420, marginBottom: 20 }}>
        <Search />
        <input placeholder="Buscar por nombre o correo..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
      </div>

      {matches.length > 0 && (
        <div className="table-wrap" style={{ marginBottom: 32 }}>
          <table className="data-table">
            <tbody>
              {matches.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="cell-user">
                      <img src={m.avatar} alt={m.name} />
                      <div>
                        <div className="cell-user-name">{m.name}</div>
                        <div className="cell-user-sub">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><MembershipBadge status={m.status} /></td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => handleCheckIn(m)}>
                      <LogIn size={14} /> Registrar entrada
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <CalendarCheck size={18} color="var(--red)" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>Check-ins de hoy</h2>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Miembro</th>
              <th>Hora</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {todayCheckIns.map((c) => {
              const member = members.find((m) => m.id === c.memberId);
              return (
                <tr key={c.id}>
                  <td>
                    <div className="cell-user">
                      {member && <img src={member.avatar} alt={member.name} />}
                      <span className="cell-user-name">{member?.name ?? '—'}</span>
                    </div>
                  </td>
                  <td>{c.time}</td>
                  <td>
                    <button className="icon-btn" onClick={() => setPendingUndo(c)} aria-label="Deshacer check-in" title="Deshacer check-in">
                      <Undo2 />
                    </button>
                  </td>
                </tr>
              );
            })}
            {todayCheckIns.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <div className="empty-state">Aún no hay check-ins registrados hoy.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingUndo && (
        <ConfirmDialog
          title="Deshacer check-in"
          message="¿Seguro que quieres deshacer este check-in? Se eliminará del registro de hoy."
          onConfirm={confirmUndo}
          onCancel={() => setPendingUndo(null)}
        />
      )}
    </>
  );
}
