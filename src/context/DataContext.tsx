import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  BodyMeasurement,
  CheckInRecord,
  GymClass,
  Member,
  Payment,
  ProgressPhoto,
  SessionPackage,
  Trainer,
  WorkoutPlan,
} from '../data/types';
import { members as initialMembers } from '../data/members';
import { trainers as initialTrainers } from '../data/trainers';
import { classes as initialClasses } from '../data/classes';
import { payments as initialPayments } from '../data/payments';
import { workoutPlans as initialWorkoutPlans } from '../data/workoutPlans';
import { sessionPackages as initialSessionPackages } from '../data/sessionPackages';

interface DataContextValue {
  members: Member[];
  trainers: Trainer[];
  classes: GymClass[];
  payments: Payment[];
  workoutPlans: WorkoutPlan[];
  sessionPackages: SessionPackage[];
  checkIns: CheckInRecord[];
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addTrainer: (trainer: Omit<Trainer, 'id'>) => void;
  updateTrainer: (id: string, patch: Partial<Trainer>) => void;
  deleteTrainer: (id: string) => void;
  reassignTrainerClasses: (fromTrainerId: string, toTrainerId: string) => void;
  addClass: (gymClass: Omit<GymClass, 'id' | 'bookedIds' | 'waitlistIds' | 'attendedIds'>) => void;
  updateClass: (id: string, patch: Partial<GymClass>) => void;
  deleteClass: (id: string) => void;
  toggleBooking: (classId: string, memberId: string) => void;
  joinWaitlist: (classId: string, memberId: string) => void;
  leaveWaitlist: (classId: string, memberId: string) => void;
  toggleAttendance: (classId: string, memberId: string) => void;
  markPaymentStatus: (id: string, status: Payment['status']) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, patch: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  addWorkoutPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => void;
  updateWorkoutPlan: (id: string, patch: Partial<Omit<WorkoutPlan, 'id'>>) => void;
  deleteWorkoutPlan: (id: string) => void;
  requestFreeze: (memberId: string, reason: string) => void;
  resolveFreezeRequest: (memberId: string, approve: boolean) => void;
  addSessionPackage: (pkg: Omit<SessionPackage, 'id'>) => void;
  updateSessionPackage: (id: string, patch: Partial<SessionPackage>) => void;
  deleteSessionPackage: (id: string) => void;
  useSessionPackageSession: (packageId: string) => void;
  addBodyMeasurement: (memberId: string, entry: BodyMeasurement) => void;
  addProgressPhoto: (memberId: string, photo: ProgressPhoto) => void;
  deleteProgressPhoto: (memberId: string, photoUrl: string, photoDate: string) => void;
  checkInMember: (memberId: string) => void;
  deleteCheckIn: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

const nextId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const STORAGE_KEY = 'vulkan.data';

interface StoredData {
  members: Member[];
  trainers: Trainer[];
  classes: GymClass[];
  payments: Payment[];
  workoutPlans: WorkoutPlan[];
  sessionPackages: SessionPackage[];
  checkIns: CheckInRecord[];
}

function loadStored(): StoredData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredData) : null;
  } catch {
    return null;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(() => loadStored()?.members ?? initialMembers);
  const [trainers, setTrainers] = useState<Trainer[]>(() => loadStored()?.trainers ?? initialTrainers);
  const [classes, setClasses] = useState<GymClass[]>(() => loadStored()?.classes ?? initialClasses);
  const [payments, setPayments] = useState<Payment[]>(() => loadStored()?.payments ?? initialPayments);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>(() => loadStored()?.workoutPlans ?? initialWorkoutPlans);
  const [sessionPackages, setSessionPackages] = useState<SessionPackage[]>(
    () => loadStored()?.sessionPackages ?? initialSessionPackages,
  );
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>(() => loadStored()?.checkIns ?? []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ members, trainers, classes, payments, workoutPlans, sessionPackages, checkIns }),
    );
  }, [members, trainers, classes, payments, workoutPlans, sessionPackages, checkIns]);

  const value = useMemo<DataContextValue>(
    () => ({
      members,
      trainers,
      classes,
      payments,
      workoutPlans,
      sessionPackages,
      checkIns,
      addMember: (member) => setMembers((prev) => [...prev, { ...member, id: nextId('m') }]),
      updateMember: (id, patch) => setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
      deleteMember: (id) => {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setClasses((prev) =>
          prev.map((c) => ({
            ...c,
            bookedIds: c.bookedIds.filter((mid) => mid !== id),
            waitlistIds: c.waitlistIds.filter((mid) => mid !== id),
            attendedIds: c.attendedIds.filter((mid) => mid !== id),
          })),
        );
      },
      addTrainer: (trainer) => setTrainers((prev) => [...prev, { ...trainer, id: nextId('t') }]),
      updateTrainer: (id, patch) => setTrainers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      deleteTrainer: (id) => setTrainers((prev) => prev.filter((t) => t.id !== id)),
      reassignTrainerClasses: (fromTrainerId, toTrainerId) =>
        setClasses((prev) => prev.map((c) => (c.trainerId === fromTrainerId ? { ...c, trainerId: toTrainerId } : c))),
      addClass: (gymClass) => setClasses((prev) => [...prev, { ...gymClass, id: nextId('c'), bookedIds: [], waitlistIds: [], attendedIds: [] }]),
      updateClass: (id, patch) => setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      deleteClass: (id) => setClasses((prev) => prev.filter((c) => c.id !== id)),
      toggleBooking: (classId, memberId) =>
        setClasses((prev) =>
          prev.map((c) => {
            if (c.id !== classId) return c;
            const isBooked = c.bookedIds.includes(memberId);
            if (isBooked) {
              const remaining = c.bookedIds.filter((id) => id !== memberId);
              const [promoted, ...restWaitlist] = c.waitlistIds;
              return promoted
                ? { ...c, bookedIds: [...remaining, promoted], waitlistIds: restWaitlist }
                : { ...c, bookedIds: remaining };
            }
            if (c.bookedIds.length >= c.capacity) return c;
            return { ...c, bookedIds: [...c.bookedIds, memberId] };
          }),
        ),
      joinWaitlist: (classId, memberId) =>
        setClasses((prev) =>
          prev.map((c) => (c.id === classId && !c.waitlistIds.includes(memberId) ? { ...c, waitlistIds: [...c.waitlistIds, memberId] } : c)),
        ),
      leaveWaitlist: (classId, memberId) =>
        setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, waitlistIds: c.waitlistIds.filter((id) => id !== memberId) } : c))),
      toggleAttendance: (classId, memberId) => {
        const gymClass = classes.find((c) => c.id === classId);
        if (!gymClass) return;
        const alreadyAttended = gymClass.attendedIds.includes(memberId);
        setClasses((prev) =>
          prev.map((c) =>
            c.id === classId
              ? { ...c, attendedIds: alreadyAttended ? c.attendedIds.filter((id) => id !== memberId) : [...c.attendedIds, memberId] }
              : c,
          ),
        );
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, checkIns: Math.max(0, m.checkIns + (alreadyAttended ? -1 : 1)) } : m)),
        );
      },
      markPaymentStatus: (id, status) => setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p))),
      addPayment: (payment) => setPayments((prev) => [...prev, { ...payment, id: nextId('p') }]),
      updatePayment: (id, patch) => setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      deletePayment: (id) => setPayments((prev) => prev.filter((p) => p.id !== id)),
      addWorkoutPlan: (plan) =>
        setWorkoutPlans((prev) => [...prev, { ...plan, id: nextId('wp'), createdAt: new Date().toISOString().slice(0, 10) }]),
      updateWorkoutPlan: (id, patch) => setWorkoutPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      deleteWorkoutPlan: (id) => setWorkoutPlans((prev) => prev.filter((p) => p.id !== id)),
      requestFreeze: (memberId, reason) =>
        setMembers((prev) =>
          prev.map((m) =>
            m.id === memberId ? { ...m, freezeRequest: { reason, requestedAt: new Date().toISOString().slice(0, 10) } } : m,
          ),
        ),
      resolveFreezeRequest: (memberId, approve) =>
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, freezeRequest: null, status: approve ? 'pausada' : m.status } : m)),
        ),
      addSessionPackage: (pkg) => setSessionPackages((prev) => [...prev, { ...pkg, id: nextId('pkg') }]),
      updateSessionPackage: (id, patch) => setSessionPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      deleteSessionPackage: (id) => setSessionPackages((prev) => prev.filter((p) => p.id !== id)),
      useSessionPackageSession: (packageId) =>
        setSessionPackages((prev) =>
          prev.map((p) => (p.id === packageId && p.usedSessions < p.totalSessions ? { ...p, usedSessions: p.usedSessions + 1 } : p)),
        ),
      addBodyMeasurement: (memberId, entry) =>
        setMembers((prev) =>
          prev.map((m) => {
            if (m.id !== memberId) return m;
            const existingIndex = m.bodyMeasurements.findIndex((e) => e.date === entry.date);
            const bodyMeasurements =
              existingIndex === -1
                ? [...m.bodyMeasurements, entry]
                : m.bodyMeasurements.map((e, i) => (i === existingIndex ? entry : e));
            return { ...m, bodyMeasurements };
          }),
        ),
      addProgressPhoto: (memberId, photo) =>
        setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, progressPhotos: [...m.progressPhotos, photo] } : m))),
      deleteProgressPhoto: (memberId, photoUrl, photoDate) =>
        setMembers((prev) =>
          prev.map((m) =>
            m.id === memberId
              ? { ...m, progressPhotos: m.progressPhotos.filter((p) => !(p.url === photoUrl && p.date === photoDate)) }
              : m,
          ),
        ),
      checkInMember: (memberId) => {
        const now = new Date();
        setCheckIns((prev) => [
          ...prev,
          { id: nextId('ci'), memberId, date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5) },
        ]);
        setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, checkIns: m.checkIns + 1 } : m)));
      },
      deleteCheckIn: (id) => {
        const record = checkIns.find((c) => c.id === id);
        if (!record) return;
        setCheckIns((prev) => prev.filter((c) => c.id !== id));
        setMembers((prev) => prev.map((m) => (m.id === record.memberId ? { ...m, checkIns: Math.max(0, m.checkIns - 1) } : m)));
      },
    }),
    [members, trainers, classes, payments, workoutPlans, sessionPackages, checkIns],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>');
  return ctx;
}
