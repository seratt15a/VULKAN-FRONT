import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Dumbbell, CalendarDays } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useEscapeClose } from '../lib/useEscapeClose';

type ResultKind = 'member' | 'trainer' | 'class';

interface SearchResult {
  id: string;
  kind: ResultKind;
  title: string;
  subtitle: string;
  path: string;
  presetQuery: string;
}

export function GlobalSearch() {
  const { members, trainers, classes } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  useEscapeClose(() => setOpen(false), open);

  const q = query.trim().toLowerCase();

  const results: SearchResult[] =
    q.length === 0
      ? []
      : [
          ...members
            .filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
            .map((m) => ({ id: m.id, kind: 'member' as const, title: m.name, subtitle: m.email, path: '/admin/miembros', presetQuery: m.name })),
          ...trainers
            .filter((t) => t.name.toLowerCase().includes(q) || t.specialty.toLowerCase().includes(q))
            .map((t) => ({ id: t.id, kind: 'trainer' as const, title: t.name, subtitle: t.specialty, path: '/admin/entrenadores', presetQuery: t.name })),
          ...classes
            .filter((c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
            .map((c) => ({ id: c.id, kind: 'class' as const, title: c.name, subtitle: `${c.day} · ${c.startTime}`, path: '/admin/clases', presetQuery: c.name })),
        ].slice(0, 8);

  const icon = (kind: ResultKind) => {
    if (kind === 'member') return <User size={15} />;
    if (kind === 'trainer') return <Dumbbell size={15} />;
    return <CalendarDays size={15} />;
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.path, { state: { presetQuery: result.presetQuery } });
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="global-search-wrap">
      <div className="search-input global-search-input">
        <Search />
        <input
          placeholder="Buscar miembros, entrenadores, clases..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {open && q.length > 0 && (
        <>
          <div className="notif-backdrop" onClick={() => setOpen(false)} />
          <div className="notif-panel global-search-panel" role="listbox" aria-label="Resultados de búsqueda">
            {results.length === 0 ? (
              <p className="notif-empty">Sin resultados para "{query}".</p>
            ) : (
              <div className="notif-list">
                {results.map((r) => (
                  <button key={`${r.kind}-${r.id}`} className="global-search-result" onClick={() => handleSelect(r)}>
                    {icon(r.kind)}
                    <div>
                      <div className="cell-user-name">{r.title}</div>
                      <div className="cell-user-sub">{r.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
