import type { Role } from '../../data/types';
import {
  LayoutDashboard,
  Dumbbell,
  CreditCard,
  User,
  Users,
  UserCog,
  Wallet,
  CalendarDays,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const navByRole: Record<Role, NavItem[]> = {
  member: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/clases', label: 'Clases', icon: Dumbbell },
    { to: '/membresia', label: 'Mi Membresía', icon: CreditCard },
    { to: '/perfil', label: 'Perfil', icon: User },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/miembros', label: 'Miembros', icon: Users },
    { to: '/admin/clases', label: 'Clases', icon: Dumbbell },
    { to: '/admin/entrenadores', label: 'Entrenadores', icon: UserCog },
    { to: '/admin/pagos', label: 'Pagos', icon: Wallet },
  ],
  trainer: [
    { to: '/entrenador', label: 'Mi Horario', icon: CalendarDays, end: true },
    { to: '/entrenador/alumnos', label: 'Mis Alumnos', icon: ClipboardList },
  ],
};
