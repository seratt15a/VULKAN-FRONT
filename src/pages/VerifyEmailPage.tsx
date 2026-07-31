import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle';
import { api, ApiError } from '../lib/api';

type Status = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  usePageTitle('Confirmar correo');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Falta el token de verificación en el enlace.');
      return;
    }
    api
      .post<{ name: string }>('/signup-requests/verify', { token })
      .then((result) => {
        setName(result.name);
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setError(err instanceof ApiError ? err.message : 'No se pudo confirmar tu correo.');
      });
  }, [token]);

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          VUL<span>KAN</span>
        </div>
        <p className="login-sub">Confirmación de correo</p>

        {status === 'loading' && (
          <p style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: 1.6 }}>Confirmando tu correo…</p>
        )}

        {status === 'success' && (
          <p style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            ¡Listo{name ? `, ${name}` : ''}! Confirmamos tu correo. El equipo de VULKAN revisará tu solicitud de
            inscripción pronto.
          </p>
        )}

        {status === 'error' && <p style={{ color: 'var(--red)', fontSize: '0.9rem', lineHeight: 1.6 }}>{error}</p>}

        <div className="login-demo-hint">
          <p>
            <Link to="/login">Ir a iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
