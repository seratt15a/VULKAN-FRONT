import type { Member, GymClass, Payment, Role } from '../data/types';
import { daysUntil, formatCurrency } from './format';

export type NotificationSeverity = 'info' | 'warning' | 'danger';

export interface AppNotification {
  id: string;
  message: string;
  severity: NotificationSeverity;
}

interface Session {
  role: Role;
  memberId?: string;
  trainerId?: string;
}

interface NotificationData {
  members: Member[];
  classes: GymClass[];
  payments: Payment[];
}

const NEAR_FULL_THRESHOLD = 0.9;

export function getNotifications(session: Session | null, data: NotificationData): AppNotification[] {
  if (!session) return [];

  if (session.role === 'admin') {
    const notifications: AppNotification[] = [];

    data.members
      .filter((m) => m.status === 'vencida')
      .forEach((m) => notifications.push({ id: `overdue-${m.id}`, message: `${m.name} tiene la membresía vencida.`, severity: 'danger' }));

    data.payments
      .filter((p) => p.status === 'pendiente')
      .forEach((p) => {
        const member = data.members.find((m) => m.id === p.memberId);
        notifications.push({
          id: `pending-${p.id}`,
          message: `Pago pendiente de ${member?.name ?? 'un miembro'} (${formatCurrency(p.amount)}).`,
          severity: 'warning',
        });
      });

    data.classes
      .filter((c) => c.bookedIds.length / c.capacity >= NEAR_FULL_THRESHOLD)
      .forEach((c) =>
        notifications.push({
          id: `full-${c.id}`,
          message: `"${c.name}" está casi llena (${c.bookedIds.length}/${c.capacity}).`,
          severity: 'info',
        }),
      );

    data.members
      .filter((m) => m.freezeRequest)
      .forEach((m) => notifications.push({ id: `freeze-${m.id}`, message: `${m.name} solicitó pausar su membresía.`, severity: 'warning' }));

    return notifications;
  }

  if (session.role === 'member') {
    const member = data.members.find((m) => m.id === session.memberId);
    if (!member) return [];
    const notifications: AppNotification[] = [];

    if (member.status === 'vencida') {
      notifications.push({ id: 'own-overdue', message: 'Tu membresía está vencida. Renueva tu pago para seguir entrenando sin interrupciones.', severity: 'danger' });
    } else if (member.status === 'pausada') {
      notifications.push({ id: 'own-paused', message: 'Tu membresía está pausada. Reactívala cuando quieras volver.', severity: 'warning' });
    } else {
      const days = daysUntil(member.nextPaymentDate);
      if (days >= 0 && days <= 5) {
        notifications.push({ id: 'own-due-soon', message: `Tu próximo pago vence en ${days} día${days === 1 ? '' : 's'}.`, severity: 'warning' });
      }
    }

    return notifications;
  }

  if (session.role === 'trainer') {
    return data.classes
      .filter((c) => c.trainerId === session.trainerId && c.bookedIds.length / c.capacity >= NEAR_FULL_THRESHOLD)
      .map((c) => ({
        id: `full-${c.id}`,
        message: `"${c.name}" está casi llena (${c.bookedIds.length}/${c.capacity}).`,
        severity: 'info' as const,
      }));
  }

  return [];
}
