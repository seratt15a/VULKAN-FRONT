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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await forgotPassword(email);
    setLoading(false);
    // Always show the same confirmation, whether or not the email has an
    // account, so this form can't be used to find out who is registered.
    setSubmitted(true);
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
