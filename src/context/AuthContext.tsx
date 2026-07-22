import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Role } from '../data/types';
import { members, trainers } from '../data';

interface Session {
  role: Role;
  name: string;
  avatar: string;
  memberId?: string;
  trainerId?: string;
}

interface AuthContextValue {
  session: Session | null;
  loginAsMember: (memberId: string) => void;
  loginAsTrainer: (trainerId: string) => void;
  loginAsAdmin: () => void;
  logout: () => void;
}

const STORAGE_KEY = 'vulkan.session';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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
      loginAsMember: (memberId) => {
        const member = members.find((m) => m.id === memberId);
        if (!member) return;
        setSession({ role: 'member', name: member.name, avatar: member.avatar, memberId: member.id });
      },
      loginAsTrainer: (trainerId) => {
        const trainer = trainers.find((t) => t.id === trainerId);
        if (!trainer) return;
        setSession({ role: 'trainer', name: trainer.name, avatar: trainer.avatar, trainerId: trainer.id });
      },
      loginAsAdmin: () => {
        setSession({
          role: 'admin',
          name: 'Staff VULKAN',
          avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80',
        });
      },
      logout: () => setSession(null),
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
