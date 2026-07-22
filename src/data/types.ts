export type Role = 'member' | 'admin' | 'trainer';

export type MembershipPlan = 'Básico' | 'Pro' | 'Élite';

export type MembershipStatus = 'activa' | 'vencida' | 'pausada';

export interface WeightEntry {
  date: string;
  weightKg: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface BodyMeasurement {
  date: string;
  bodyFatPercent: number;
  waistCm: number;
  chestCm: number;
  armCm: number;
}

export interface ProgressPhoto {
  date: string;
  url: string;
  note?: string;
}

export interface FreezeRequest {
  reason: string;
  requestedAt: string;
}

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
  trainerId: string;
  currentStreakDays: number;
  weightGoalKg: number;
  weightHistory: WeightEntry[];
  emergencyContact: EmergencyContact;
  bodyMeasurements: BodyMeasurement[];
  progressPhotos: ProgressPhoto[];
  freezeRequest: FreezeRequest | null;
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
  waitlistIds: string[];
  attendedIds: string[];
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

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  memberId: string;
  trainerId: string;
  title: string;
  createdAt: string;
  exercises: Exercise[];
}

export interface SessionPackage {
  id: string;
  memberId: string;
  totalSessions: number;
  usedSessions: number;
  purchaseDate: string;
  price: number;
}
