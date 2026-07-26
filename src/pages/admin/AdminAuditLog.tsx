import { useState } from 'react';
import { Search } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { usePageTitle } from '../../lib/usePageTitle';

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminAuditLog() {
  usePageTitle('Bitácora');
  const { auditLog } = useData();
  const [query, setQuery] = useState('');

  const filtered = [...auditLog]
    .filter((entry) => entry.action.toLowerCase().includes(query.toLowerCase()) || entry.actor.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.5px' }}>Bitácora</h1>
          <p style={{ color: 'var(--gray)' }}>Registro de acciones sensibles: quién hizo qué cambio y cuándo.</p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="search-input" style={{ maxWidth: 420 }}>
          <Search />
          <input placeholder="Buscar por acción o responsable..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Responsable</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id}>
                <td>{formatTimestamp(entry.timestamp)}</td>
                <td>{entry.actor}</td>
                <td>{entry.action}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <div className="empty-state">Sin registros todavía.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
