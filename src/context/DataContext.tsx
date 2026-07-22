import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { GymClass, Member, Payment, Trainer } from '../data/types';
import { members as initialMembers } from '../data/members';
import { trainers as initialTrainers } from '../data/trainers';
import { classes as initialClasses } from '../data/classes';
import { payments as initialPayments } from '../data/payments';

interface DataContextValue {
  members: Member[];
  trainers: Trainer[];
  classes: GymClass[];
  payments: Payment[];
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addTrainer: (trainer: Omit<Trainer, 'id'>) => void;
  updateTrainer: (id: string, patch: Partial<Trainer>) => void;
  deleteTrainer: (id: string) => void;
  addClass: (gymClass: Omit<GymClass, 'id' | 'bookedIds'>) => void;
  updateClass: (id: string, patch: Partial<GymClass>) => void;
  deleteClass: (id: string) => void;
  toggleBooking: (classId: string, memberId: string) => void;
  markPaymentStatus: (id: string, status: Payment['status']) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}${idCounter++}`;

export function DataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [classes, setClasses] = useState<GymClass[]>(initialClasses);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

  const value = useMemo<DataContextValue>(
    () => ({
      members,
      trainers,
      classes,
      payments,
      addMember: (member) => setMembers((prev) => [...prev, { ...member, id: nextId('m') }]),
      updateMember: (id, patch) => setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
      deleteMember: (id) => setMembers((prev) => prev.filter((m) => m.id !== id)),
      addTrainer: (trainer) => setTrainers((prev) => [...prev, { ...trainer, id: nextId('t') }]),
      updateTrainer: (id, patch) => setTrainers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      deleteTrainer: (id) => setTrainers((prev) => prev.filter((t) => t.id !== id)),
      addClass: (gymClass) => setClasses((prev) => [...prev, { ...gymClass, id: nextId('c'), bookedIds: [] }]),
      updateClass: (id, patch) => setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      deleteClass: (id) => setClasses((prev) => prev.filter((c) => c.id !== id)),
      toggleBooking: (classId, memberId) =>
        setClasses((prev) =>
          prev.map((c) => {
            if (c.id !== classId) return c;
            const isBooked = c.bookedIds.includes(memberId);
            return { ...c, bookedIds: isBooked ? c.bookedIds.filter((id) => id !== memberId) : [...c.bookedIds, memberId] };
          }),
        ),
      markPaymentStatus: (id, status) => setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p))),
    }),
    [members, trainers, classes, payments],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>');
  return ctx;
}
