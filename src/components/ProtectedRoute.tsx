import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Role } from '../data/types';
import { useAuth } from '../context/AuthContext';
import { homeByRole } from '../lib/roleHome';

export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { session } = useAuth();

  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== role) return <Navigate to={homeByRole[session.role]} replace />;

  return <>{children}</>;
}
