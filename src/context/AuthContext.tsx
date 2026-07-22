import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Role } from '../data/types';
import { findDemoAccount, DEMO_PASSWORD } from '../lib/demoAccounts';
import { useData } from './DataContext';

interface Session {
  role: Role;
  name: string;
  avatar: string;
  memberId?: string;
  trainerId?: string;
}

interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  session: Session | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const STORAGE_KEY = 'vulkan.session';
const ADMIN_AVATAR = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { members, trainers } = useData();
  const [session, setSession] = useState<Session | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      // Placeholder for a real POST /auth/login — same signature and return
      // shape a fetch-based implementation would use, so pages never change.
      login: async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 350));

        const account = findDemoAccount(email);
        if (!account || password !== DEMO_PASSWORD) {
          return { ok: false, error: 'Correo o contraseña incorrectos.' };
        }

        if (account.role === 'admin') {
          setSession({ role: 'admin', name: 'Staff VULKAN', avatar: ADMIN_AVATAR });
          return { ok: true };
        }

        if (account.role === 'member') {
          const member = members.find((m) => m.id === account.memberId);
          if (!member) return { ok: false, error: 'No se encontró la cuenta asociada.' };
          setSession({ role: 'member', name: member.name, avatar: member.avatar, memberId: member.id });
          return { ok: true };
        }

        const trainer = trainers.find((t) => t.id === account.trainerId);
        if (!trainer) return { ok: false, error: 'No se encontró la cuenta asociada.' };
        setSession({ role: 'trainer', name: trainer.name, avatar: trainer.avatar, trainerId: trainer.id });
        return { ok: true };
      },
      logout: () => setSession(null),
    }),
    [session, members, trainers],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
