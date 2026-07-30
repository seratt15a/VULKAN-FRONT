import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { usePageTitle } from '../lib/usePageTitle';
import type { MembershipPlan } from '../data/types';

export function SignupRequestPage() {
  usePageTitle('Solicitar inscripción');
  const { addSignupRequest } = useData();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [planInterest, setPlanInterest] = useState<MembershipPlan>('Básico');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (submitted) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await addSignupRequest({ name, email, phone, planInterest });
    setLoading(false);
    if (ok) {
      showToast('Solicitud enviada. El equipo de VULKAN la revisará pronto.', 'success');
      setSubmitted(true);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          VUL<span>KAN</span>
        </div>
        <p className="login-sub">Solicita tu inscripción</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signupName">Nombre completo</label>
            <input id="signupName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="signupEmail">Correo</label>
            <input id="signupEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="signupPhone">Teléfono</label>
            <input id="signupPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 55 0000 0000" required />
          </div>
          <div className="form-group">
            <label htmlFor="signupPlan">Plan de interés</label>
            <select id="signupPlan" value={planInterest} onChange={(e) => setPlanInterest(e.target.value as MembershipPlan)}>
              <option value="Básico">Básico</option>
              <option value="Pro">Pro</option>
              <option value="Élite">Élite</option>
            </select>
          </div>

          <p style={{ color: 'var(--gray)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: 16 }}>
            Usamos tus datos únicamente para crear y gestionar tu membresía en VULKAN — no los compartimos con
            terceros.
          </p>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Enviando…' : 'Enviar solicitud'}
          </button>
        </form>

        <div className="login-demo-hint">
          <p>
            ¿Ya eres miembro? <Link to="/login">Inicia sesión aquí</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
