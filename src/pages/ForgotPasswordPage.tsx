import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle';
import { useAuth } from '../context/AuthContext';

export function ForgotPasswordPage() {
  usePageTitle('Recuperar contraseña');
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    // The backend always returns success whether or not the email has an
    // account, so this can't be used to find out who is registered — but a
    // real failure (e.g. rate-limited) still needs to be shown as such,
    // instead of silently claiming an email is on its way.
    if (result.ok) {
      setSubmitted(true);
    } else {
      setError(result.error ?? 'No se pudo procesar la solicitud.');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          VUL<span>KAN</span>
        </div>
        <p className="login-sub">Recupera tu contraseña</p>

        {submitted ? (
          <p style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Si <strong>{email}</strong> tiene una cuenta con nosotros, te enviamos una nueva contraseña. Revisa tu
            bandeja de entrada (y spam) en unos minutos.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="forgotEmail">Correo</label>
              <input
                id="forgotEmail"
                type="email"
                autoComplete="username"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: 16 }}>{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Enviando…' : 'Enviar nueva contraseña'}
            </button>
          </form>
        )}

        <div className="login-demo-hint">
          <p>
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
