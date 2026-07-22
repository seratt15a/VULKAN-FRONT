export type Role = 'member' | 'admin' | 'trainer';

export type MembershipPlan = 'Básico' | 'Pro' | 'Élite';

export type MembershipStatus = 'activa' | 'vencida' | 'pausada';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: MembershipPlan;
  status: MembershipStatus;
  joinDate: string;
  nextPaymentDate: string;
  monthlyFee: number;
  checkIns: number;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  specialty: string;
  bio: string;
  activeStudents: number;
}

export type ClassCategory = 'Fuerza' | 'HIIT' | 'Hipertrofia' | 'Movilidad' | 'Cardio';

export interface GymClass {
  id: string;
  name: string;
  category: ClassCategory;
  trainerId: string;
  day: 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie' | 'Sáb' | 'Dom';
  startTime: string;
  durationMin: number;
  capacity: number;
  bookedIds: string[];
}

export type PaymentStatus = 'pagado' | 'pendiente' | 'vencido';

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  plan: MembershipPlan;
  status: PaymentStatus;
}
