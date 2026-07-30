import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  AuditLogEntry,
  BodyMeasurement,
  CheckInRecord,
  GymClass,
  Member,
  Payment,
  ProgressPhoto,
  SessionPackage,
  SignupRequest,
  Trainer,
  WorkoutPlan,
} from '../data/types';
import { api, ApiError } from '../lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface DataContextValue {
  members: Member[];
  trainers: Trainer[];
  classes: GymClass[];
  payments: Payment[];
  workoutPlans: WorkoutPlan[];
  sessionPackages: SessionPackage[];
  checkIns: CheckInRecord[];
  signupRequests: SignupRequest[];
  auditLog: AuditLogEntry[];
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  updateMember: (id: string, patch: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addTrainer: (trainer: Omit<Trainer, 'id'>) => Promise<void>;
  updateTrainer: (id: string, patch: Partial<Trainer>) => Promise<void>;
  deleteTrainer: (id: string) => Promise<void>;
  reassignTrainerClasses: (fromTrainerId: string, toTrainerId: string) => Promise<void>;
  addClass: (gymClass: Omit<GymClass, 'id' | 'bookedIds' | 'waitlistIds' | 'attendedIds'>) => Promise<void>;
  updateClass: (id: string, patch: Partial<GymClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  toggleBooking: (classId: string, memberId: string) => Promise<void>;
  joinWaitlist: (classId: string, memberId: string) => Promise<void>;
  leaveWaitlist: (classId: string, memberId: string) => Promise<void>;
  toggleAttendance: (classId: string, memberId: string) => Promise<void>;
  markPaymentStatus: (id: string, status: Payment['status']) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  updatePayment: (id: string, patch: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  addWorkoutPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => Promise<void>;
  updateWorkoutPlan: (id: string, patch: Partial<Omit<WorkoutPlan, 'id'>>) => Promise<void>;
  deleteWorkoutPlan: (id: string) => Promise<void>;
  requestFreeze: (memberId: string, reason: string) => Promise<void>;
  resolveFreezeRequest: (memberId: string, approve: boolean) => Promise<void>;
  addSessionPackage: (pkg: Omit<SessionPackage, 'id'>) => Promise<void>;
  updateSessionPackage: (id: string, patch: Partial<SessionPackage>) => Promise<void>;
  deleteSessionPackage: (id: string) => Promise<void>;
  useSessionPackageSession: (packageId: string) => Promise<void>;
  addBodyMeasurement: (memberId: string, entry: BodyMeasurement) => Promise<void>;
  addProgressPhoto: (memberId: string, photo: ProgressPhoto) => Promise<void>;
  deleteProgressPhoto: (memberId: string, photoUrl: string, photoDate: string) => Promise<void>;
  checkInMember: (memberId: string) => Promise<void>;
  deleteCheckIn: (id: string) => Promise<void>;
  addSignupRequest: (request: Omit<SignupRequest, 'id' | 'requestedAt' | 'status'>) => Promise<void>;
  approveSignupRequest: (id: string, trainerId: string) => Promise<{ temporaryPassword: string; emailSent: boolean } | undefined>;
  rejectSignupRequest: (id: string) => Promise<void>;
  logAudit: (actor: string, action: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { showToast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [sessionPackages, setSessionPackages] = useState<SessionPackage[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [signupRequests, setSignupRequests] = useState<SignupRequest[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load every resource this role can see once, right after login. Pages keep
  // filtering the flat arrays client-side exactly like the old mock did.
  useEffect(() => {
    if (!session) {
      setMembers([]);
      setTrainers([]);
      setClasses([]);
      setPayments([]);
      setWorkoutPlans([]);
      setSessionPackages([]);
      setCheckIns([]);
      setSignupRequests([]);
      setAuditLog([]);
      setLoaded(false);
      return;
    }

    let cancelled = false;
    setLoaded(false);

    (async () => {
      try {
        const canSeeCheckIns = session.role === 'admin' || session.role === 'reception';
        const canSeeAdminOnly = session.role === 'admin';

        const [m, t, c, p, wp, sp, ci, sr, al] = await Promise.all([
          api.get<Member[]>('/members'),
          api.get<Trainer[]>('/trainers'),
          api.get<GymClass[]>('/classes'),
          api.get<Payment[]>('/payments'),
          api.get<WorkoutPlan[]>('/workout-plans'),
          api.get<SessionPackage[]>('/session-packages'),
          canSeeCheckIns ? api.get<CheckInRecord[]>('/check-ins') : Promise.resolve<CheckInRecord[]>([]),
          canSeeAdminOnly ? api.get<SignupRequest[]>('/signup-requests') : Promise.resolve<SignupRequest[]>([]),
          canSeeAdminOnly ? api.get<AuditLogEntry[]>('/audit-log') : Promise.resolve<AuditLogEntry[]>([]),
        ]);
        if (cancelled) return;
        setMembers(m);
        setTrainers(t);
        setClasses(c);
        setPayments(p);
        setWorkoutPlans(wp);
        setSessionPackages(sp);
        setCheckIns(ci);
        setSignupRequests(sr);
        setAuditLog(al);
      } catch (err) {
        if (!cancelled) {
          showToast(err instanceof ApiError ? err.message : 'No se pudieron cargar los datos del gimnasio.', 'error');
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, showToast]);

  const onError = (err: unknown, fallback: string) => {
    showToast(err instanceof ApiError ? err.message : fallback, 'error');
  };

  const value = useMemo<DataContextValue>(
    () => ({
      members,
      trainers,
      classes,
      payments,
      workoutPlans,
      sessionPackages,
      checkIns,
      signupRequests,
      auditLog,

      addMember: async (member) => {
        try {
          const created = await api.post<Member>('/members', member);
          setMembers((prev) => [...prev, created]);
        } catch (err) {
          onError(err, 'No se pudo agregar al miembro.');
        }
      },
      updateMember: async (id, patch) => {
        try {
          const updated = await api.patch<Member>(`/members/${id}`, patch);
          setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
        } catch (err) {
          onError(err, 'No se pudo actualizar al miembro.');
        }
      },
      deleteMember: async (id) => {
        try {
          await api.delete(`/members/${id}`);
          setMembers((prev) => prev.filter((m) => m.id !== id));
          setClasses((prev) =>
            prev.map((c) => ({
              ...c,
              bookedIds: c.bookedIds.filter((mid) => mid !== id),
              waitlistIds: c.waitlistIds.filter((mid) => mid !== id),
              attendedIds: c.attendedIds.filter((mid) => mid !== id),
            })),
          );
        } catch (err) {
          onError(err, 'No se pudo eliminar al miembro.');
        }
      },

      addTrainer: async (trainer) => {
        try {
          const created = await api.post<Trainer>('/trainers', trainer);
          setTrainers((prev) => [...prev, created]);
        } catch (err) {
          onError(err, 'No se pudo agregar al entrenador.');
        }
      },
      updateTrainer: async (id, patch) => {
        try {
          const updated = await api.patch<Trainer>(`/trainers/${id}`, patch);
          setTrainers((prev) => prev.map((t) => (t.id === id ? updated : t)));
        } catch (err) {
          onError(err, 'No se pudo actualizar al entrenador.');
        }
      },
      deleteTrainer: async (id) => {
        try {
          await api.delete(`/trainers/${id}`);
          setTrainers((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
          onError(err, 'No se pudo eliminar al entrenador.');
        }
      },
      reassignTrainerClasses: async (fromTrainerId, toTrainerId) => {
        try {
          await api.post(`/trainers/${fromTrainerId}/reassign-classes`, { toTrainerId });
          setClasses((prev) => prev.map((c) => (c.trainerId === fromTrainerId ? { ...c, trainerId: toTrainerId } : c)));
        } catch (err) {
          onError(err, 'No se pudieron reasignar las clases.');
        }
      },

      addClass: async (gymClass) => {
        try {
          const created = await api.post<GymClass>('/classes', gymClass);
          setClasses((prev) => [...prev, created]);
        } catch (err) {
          onError(err, 'No se pudo crear la clase.');
        }
      },
      updateClass: async (id, patch) => {
        try {
          const updated = await api.patch<GymClass>(`/classes/${id}`, patch);
          setClasses((prev) => prev.map((c) => (c.id === id ? updated : c)));
        } catch (err) {
          onError(err, 'No se pudo actualizar la clase.');
        }
      },
      deleteClass: async (id) => {
        try {
          await api.delete(`/classes/${id}`);
          setClasses((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
          onError(err, 'No se pudo eliminar la clase.');
        }
      },
      toggleBooking: async (classId, memberId) => {
        try {
          const updated = await api.post<GymClass>(`/classes/${classId}/toggle-booking`, { memberId });
          setClasses((prev) => prev.map((c) => (c.id === classId ? updated : c)));
        } catch (err) {
          onError(err, 'No se pudo actualizar tu reserva.');
        }
      },
      joinWaitlist: async (classId, memberId) => {
        try {
          const updated = await api.post<GymClass>(`/classes/${classId}/waitlist/join`, { memberId });
          setClasses((prev) => prev.map((c) => (c.id === classId ? updated : c)));
        } catch (err) {
          onError(err, 'No se pudo unir a la lista de espera.');
        }
      },
      leaveWaitlist: async (classId, memberId) => {
        try {
          const updated = await api.post<GymClass>(`/classes/${classId}/waitlist/leave`, { memberId });
          setClasses((prev) => prev.map((c) => (c.id === classId ? updated : c)));
        } catch (err) {
          onError(err, 'No se pudo salir de la lista de espera.');
        }
      },
      toggleAttendance: async (classId, memberId) => {
        try {
          const gymClass = classes.find((c) => c.id === classId);
          const alreadyAttended = gymClass?.attendedIds.includes(memberId) ?? false;
          const updated = await api.post<GymClass>(`/classes/${classId}/toggle-attendance`, { memberId });
          setClasses((prev) => prev.map((c) => (c.id === classId ? updated : c)));
          setMembers((prev) =>
            prev.map((m) => (m.id === memberId ? { ...m, checkIns: Math.max(0, m.checkIns + (alreadyAttended ? -1 : 1)) } : m)),
          );
        } catch (err) {
          onError(err, 'No se pudo actualizar la asistencia.');
        }
      },

      markPaymentStatus: async (id, status) => {
        try {
          const updated = await api.patch<Payment>(`/payments/${id}`, { status });
          setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
        } catch (err) {
          onError(err, 'No se pudo actualizar el pago.');
        }
      },
      addPayment: async (payment) => {
        try {
          const created = await api.post<Payment>('/payments', payment);
          setPayments((prev) => [...prev, created]);
        } catch (err) {
          onError(err, 'No se pudo registrar el pago.');
        }
      },
      updatePayment: async (id, patch) => {
        try {
          const updated = await api.patch<Payment>(`/payments/${id}`, patch);
          setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
        } catch (err) {
          onError(err, 'No se pudo actualizar el pago.');
        }
      },
      deletePayment: async (id) => {
        try {
          await api.delete(`/payments/${id}`);
          setPayments((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
          onError(err, 'No se pudo eliminar el pago.');
        }
      },

      addWorkoutPlan: async (plan) => {
        try {
          const created = await api.post<WorkoutPlan>('/workout-plans', plan);
          setWorkoutPlans((prev) => [...prev, created]);
        } catch (err) {
          onError(err, 'No se pudo asignar la rutina.');
        }
      },
      updateWorkoutPlan: async (id, patch) => {
        try {
          const updated = await api.patch<WorkoutPlan>(`/workout-plans/${id}`, patch);
          setWorkoutPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
        } catch (err) {
          onError(err, 'No se pudo actualizar la rutina.');
        }
      },
      deleteWorkoutPlan: async (id) => {
        try {
          await api.delete(`/workout-plans/${id}`);
          setWorkoutPlans((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
          onError(err, 'No se pudo eliminar la rutina.');
        }
      },

      requestFreeze: async (memberId, reason) => {
        try {
          const updated = await api.patch<Member>(`/members/${memberId}`, {
            freezeRequest: { reason, requestedAt: new Date().toISOString().slice(0, 10) },
          });
          setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
        } catch (err) {
          onError(err, 'No se pudo enviar la solicitud de pausa.');
        }
      },
      resolveFreezeRequest: async (memberId, approve) => {
        try {
          const current = members.find((m) => m.id === memberId);
          const updated = await api.patch<Member>(`/members/${memberId}`, {
            freezeRequest: null,
            status: approve ? 'pausada' : current?.status,
          });
          setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
        } catch (err) {
          onError(err, 'No se pudo resolver la solicitud de pausa.');
        }
      },

      addSessionPackage: async (pkg) => {
        try {
          const created = await api.post<SessionPackage>('/session-packages', pkg);
          setSessionPackages((prev) => [...prev, created]);
        } catch (err) {
          onError(err, 'No se pudo vender el paquete.');
        }
      },
      updateSessionPackage: async (id, patch) => {
        try {
          const updated = await api.patch<SessionPackage>(`/session-packages/${id}`, patch);
          setSessionPackages((prev) => prev.map((p) => (p.id === id ? updated : p)));
        } catch (err) {
          onError(err, 'No se pudo actualizar el paquete.');
        }
      },
      deleteSessionPackage: async (id) => {
        try {
          await api.delete(`/session-packages/${id}`);
          setSessionPackages((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
          onError(err, 'No se pudo eliminar el paquete.');
        }
      },
      useSessionPackageSession: async (packageId) => {
        try {
          const updated = await api.post<SessionPackage>(`/session-packages/${packageId}/use`);
          setSessionPackages((prev) => prev.map((p) => (p.id === packageId ? updated : p)));
        } catch (err) {
          onError(err, 'No se pudo registrar el uso de la sesión.');
        }
      },

      addBodyMeasurement: async (memberId, entry) => {
        try {
          const updated = await api.put<Member>(`/members/${memberId}/measurements`, entry);
          setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
        } catch (err) {
          onError(err, 'No se pudo registrar la medición.');
        }
      },
      addProgressPhoto: async (memberId, photo) => {
        try {
          const updated = await api.post<Member>(`/members/${memberId}/photos`, photo);
          setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
        } catch (err) {
          onError(err, 'No se pudo agregar la foto.');
        }
      },
      deleteProgressPhoto: async (memberId, photoUrl, photoDate) => {
        try {
          const updated = await api.delete<Member>(`/members/${memberId}/photos`, { url: photoUrl, date: photoDate });
          setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
        } catch (err) {
          onError(err, 'No se pudo eliminar la foto.');
        }
      },

      checkInMember: async (memberId) => {
        try {
          const created = await api.post<CheckInRecord>('/check-ins', { memberId });
          setCheckIns((prev) => [...prev, created]);
          setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, checkIns: m.checkIns + 1 } : m)));
        } catch (err) {
          onError(err, 'No se pudo registrar el check-in.');
        }
      },
      deleteCheckIn: async (id) => {
        try {
          const record = checkIns.find((c) => c.id === id);
          await api.delete(`/check-ins/${id}`);
          setCheckIns((prev) => prev.filter((c) => c.id !== id));
          if (record) {
            setMembers((prev) =>
              prev.map((m) => (m.id === record.memberId ? { ...m, checkIns: Math.max(0, m.checkIns - 1) } : m)),
            );
          }
        } catch (err) {
          onError(err, 'No se pudo deshacer el check-in.');
        }
      },

      addSignupRequest: async (request) => {
        try {
          const created = await api.post<SignupRequest>('/signup-requests', request);
          setSignupRequests((prev) => [...prev, created]);
        } catch (err) {
          onError(err, 'No se pudo enviar la solicitud.');
        }
      },
      approveSignupRequest: async (id, trainerId) => {
        try {
          const result = await api.post<{ memberId: string; temporaryPassword: string; emailSent: boolean }>(
            `/signup-requests/${id}/approve`,
            { trainerId },
          );
          const refreshedMembers = await api.get<Member[]>('/members');
          setMembers(refreshedMembers);
          setSignupRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'aprobado' } : r)));
          return { temporaryPassword: result.temporaryPassword, emailSent: result.emailSent };
        } catch (err) {
          onError(err, 'No se pudo aprobar la solicitud.');
          return undefined;
        }
      },
      rejectSignupRequest: async (id) => {
        try {
          await api.post(`/signup-requests/${id}/reject`);
          setSignupRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rechazado' } : r)));
        } catch (err) {
          onError(err, 'No se pudo rechazar la solicitud.');
        }
      },

      logAudit: async (actor, action) => {
        try {
          const entry = await api.post<AuditLogEntry>('/audit-log', { actor, action });
          setAuditLog((prev) => [entry, ...prev]);
        } catch {
          // Auditing must never block the action it's recording; fail silently.
        }
      },
    }),
    [members, trainers, classes, payments, workoutPlans, sessionPackages, checkIns, signupRequests, auditLog],
  );

  if (session && !loaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)' }}>
        Cargando…
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>');
  return ctx;
}
