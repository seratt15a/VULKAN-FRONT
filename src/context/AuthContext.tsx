import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Role } from '../data/types';
import { api, ApiError, clearToken, getToken, setToken } from '../lib/api';

interface Session {
  role: Role;
  name: string;
  avatar: string;
  memberId?: string;
  trainerId?: string;
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  session: Session | null;
  login: (email: string, password: string) => Promise<ActionResult>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<ActionResult>;
  forgotPassword: (email: string) => Promise<ActionResult>;
}

const SESSION_KEY = 'vulkan.session';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  // Re-validate the stored session against the backend once on load, in case
  // the token expired or was revoked since the last visit.
  useEffect(() => {
    if (!getToken()) {
      if (session) setSession(null);
      return;
    }
    api
      .get<{ session: Session }>('/auth/me')
      .then(({ session: fresh }) => setSession(fresh))
      .catch(() => {
        clearToken();
        setSession(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable across re-renders (empty deps: none of these read `session` from
  // the closure) so components that depend on them in a useEffect don't
  // re-fire just because a login/logout changed the session itself.
  const login = useCallback(async (email: string, password: string): Promise<ActionResult> => {
    try {
      const { token, session: newSession } = await api.post<{ token: string; session: Session }>('/auth/login', {
        email,
        password,
      });
      setToken(token);
      setSession(newSession);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof ApiError ? err.message : 'No se pudo iniciar sesión.' };
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setSession(null);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<ActionResult> => {
    try {
      await api.patch('/auth/password', { currentPassword, newPassword });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof ApiError ? err.message : 'No se pudo cambiar la contraseña.' };
    }
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<ActionResult> => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof ApiError ? err.message : 'No se pudo procesar la solicitud.' };
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, login, logout, changePassword, forgotPassword }),
    [session, login, logout, changePassword, forgotPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
