import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { DEMO_PASSWORD } from '../lib/demoAccounts';
import { homeByRole } from '../lib/roleHome';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { session, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to={homeByRole[session.role]} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) setError(result.error ?? 'No se pudo iniciar sesión.');
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          VUL<span>KAN</span>
        </div>
        <p className="login-sub">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: 16 }}>{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="login-demo-hint">
          <strong>Cuentas de prueba</strong> (aún sin backend real)
          <p>admin@vulkangym.com · andres.reyes@gmail.com · marco.diaz@vulkangym.com</p>
          <p>Contraseña para todas: <code>{DEMO_PASSWORD}</code></p>
        </div>
      </div>
    </div>
  );
}
