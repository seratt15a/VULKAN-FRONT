import type { ReactNode } from 'react';
import type { MembershipStatus, PaymentStatus } from '../data/types';

type Variant = 'green' | 'red' | 'amber' | 'gray';

const membershipVariant: Record<MembershipStatus, Variant> = {
  activa: 'green',
  vencida: 'red',
  pausada: 'amber',
};

const paymentVariant: Record<PaymentStatus, Variant> = {
  pagado: 'green',
  pendiente: 'amber',
  vencido: 'red',
};

export function Badge({ variant, children }: { variant: Variant; children: ReactNode }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function MembershipBadge({ status }: { status: MembershipStatus }) {
  return <Badge variant={membershipVariant[status]}>{status}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariant[status]}>{status}</Badge>;
}
