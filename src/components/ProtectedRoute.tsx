import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Role } from '../data/types';
import { useAuth } from '../context/AuthContext';

const homeByRole: Record<Role, string> = {
  member: '/',
  admin: '/admin',
  trainer: '/entrenador',
};

export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { session } = useAuth();

  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) return <Navigate to={homeByRole[session.role]} replace />;

  return <>{children}</>;
}
