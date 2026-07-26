import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle';

export function NotFound({ homePath }: { homePath: string }) {
  usePageTitle('Página no encontrada');
  return (
    <div className="login-screen">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div className="login-logo">
          VUL<span>KAN</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', margin: '20px 0 8px', color: 'var(--red)' }}>404</h1>
        <p className="login-sub" style={{ marginBottom: 24 }}>No encontramos la página que buscas.</p>
        <Link to={homePath} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
